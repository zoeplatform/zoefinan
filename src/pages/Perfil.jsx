// src/pages/Perfil.jsx
/**
 * PÁGINA: Perfil do Usuário
 * DESCRIÇÃO: Gerenciamento de conta, preferências de tema, reserva de emergência e backup.
 * ---------------------------------------------------------
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CaretRight,
  Bank,
  Plus,
  DownloadSimple,
  UploadSimple,
  Trash,
  Warning,
  Moon,
  Sun,
} from "phosphor-react";

import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { exportUserData, importUserData } from "../utils/backupUtils";

export default function Perfil() {
  const navigate = useNavigate();

  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reserva, setReserva] = useState(0);
  const [metaSugerida, setMetaSugerida] = useState(10000);

  const [novoValor, setNovoValor] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const [backupLoading, setBackupLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Preferência de tema: padrão é DARK
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("zoe-theme");
    return saved === null ? true : saved === "dark";
  });

  const fileInputRef = useRef(null);
  const [user, setUser] = useState(auth.currentUser);

  /**
   * CARREGAMENTO DE DADOS
   */
  useEffect(() => {
    let mounted = true;

    async function carregarDados(uid) {
      try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);

        if (!mounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();

          setReserva(data.reservaEmergencia || 0);

          const despesasFixas = data.despesasFixas || [];
          const totalDespesas = despesasFixas.reduce(
            (sum, d) => sum + (Number(d?.valor) || 0),
            0
          );

          if (totalDespesas > 0) setMetaSugerida(totalDespesas * 6);
        }
      } catch (e) {
        console.error("Erro ao carregar dados do perfil:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        carregarDados(u.uid);
      } else {
        navigate("/login");
      }
    });

    const raf = requestAnimationFrame(() => setEntered(true));

    return () => {
      mounted = false;
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [navigate]);

  /**
   * AÇÕES
   */
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark((prev) => !prev);
    localStorage.setItem("zoe-theme", newTheme);
    window.dispatchEvent(new Event("themeChanged"));
  };

  async function handleAddReserva() {
    if (!user) return;

    const valorNum = Number(String(novoValor).replace(",", "."));
    if (!novoValor || Number.isNaN(valorNum) || valorNum <= 0) return;

    const total = reserva + valorNum;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, { reservaEmergencia: total });
      setReserva(total);
      setNovoValor("");
      setShowAdd(false);
    } catch (e) {
      console.error("Erro ao atualizar reserva:", e);
    }
  }

  async function handleSair() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  }

  async function handleExportBackup() {
    if (!user) return;
    setBackupLoading(true);
    try {
      await exportUserData(user.uid);
    } catch (error) {
      alert("Erro ao exportar backup: " + (error?.message || error));
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleImportBackup(event) {
    const file = event?.target?.files?.[0];
    if (!file || !user) return;

    const ok = window.confirm(
      "Isso irá sobrescrever seus dados atuais. Deseja continuar?"
    );
    if (!ok) return;

    setBackupLoading(true);
    try {
      await importUserData(user.uid, file);
      alert("Backup restaurado com sucesso!");
      window.location.reload();
    } catch (error) {
      alert("Erro ao importar backup: " + (error?.message || error));
    } finally {
      setBackupLoading(false);
      // Limpa input para permitir re-upload do mesmo arquivo
      if (event?.target) event.target.value = "";
    }
  }

  async function handleResetAccount() {
    if (!user) return;

    const ok = window.confirm(
      "Tem certeza? Isso apagará seus dados e reiniciará sua conta."
    );
    if (!ok) return;

    setBackupLoading(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        historicoMensal: {},
        rendaMensal: 0,
        despesasFixas: [],
        dividas: [],
        reservaEmergencia: 0,
        setupConcluido: false,
        reiniciadoEm: new Date(),
      });

      navigate("/setup");
    } catch (error) {
      console.error("Erro ao reiniciar conta:", error);
    } finally {
      setBackupLoading(false);
      setShowResetConfirm(false);
    }
  }

  /**
   * DERIVADOS
   */
  const nome = user?.displayName || "Usuário";
  const email = user?.email || "Sem e-mail";
  const uid = user?.uid || "";

  const iniciais = useMemo(() => {
    const base = (nome || email || "U").trim();
    const parts = base.split(" ").filter(Boolean);
    const a = (parts[0]?.[0] || "U").toUpperCase();
    const b = (parts[1]?.[0] || parts[0]?.[1] || "").toUpperCase();
    return `${a}${b}`;
  }, [nome, email]);

  /**
   * ESTILOS
   */
  const cardBase =
    "rounded-[32px] card-perf border border-default shadow-xl dark:shadow-none backdrop-blur-xl transition-all duration-300";

  /**
   * Sub-componente: item clicável
   */
  const Item = ({
    icon,
    title,
    subtitle,
    onClick,
    danger,
    loading: itemLoading,
    rightElement,
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={itemLoading}
      className={`w-full text-left ${cardBase} p-6 active:scale-[0.99] transition disabled:opacity-50 group`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div
            className={`mt-0.5 h-12 w-12 rounded-2xl flex items-center justify-center border transition-colors ${
              danger
                ? "bg-error-bg border-error/20 text-error"
                : "bg-surface-high dark:bg-surface-highest border-default text-on-surface-variant group-hover:text-on-surface"
            }`}
          >
            {itemLoading ? (
              <div className="h-5 w-5 border-2 border-on-surface-disabled border-t-on-surface rounded-full animate-spin" />
            ) : (
              icon
            )}
          </div>

          <div className="min-w-0">
            <div
              className={`text-sm font-black uppercase tracking-tight ${
                danger ? "text-error" : "text-on-surface"
              }`}
            >
              {title}
            </div>
            {subtitle && (
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant line-clamp-1">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className={`${danger ? "text-error/80" : "text-on-surface-variant"}`}>
          {rightElement || <CaretRight size={18} weight="bold" />}
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-app-background relative overflow-hidden md:overflow-auto transition-colors duration-300">
   

      <div
        className={`relative z-10 w-full max-w-2xl mx-auto px-6 pt-8 pb-32 md:pb-8 transition-all duration-500 ${
          entered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-surface-low dark:bg-surface-high border border-default flex items-center justify-center active:scale-95 transition-all md:hidden shadow-sm dark:shadow-none"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>

          <div className="min-w-0">
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">
              Perfil
            </h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">
              Gerenciamento de conta
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUNA ESQUERDA */}
          <div className="space-y-6">
            {/* CARD: Info do usuário */}
            <div className={`${cardBase} p-8`}>
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-[20px] bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center shadow-inner">
                  <span className="text-xl text-on-surface font-black">
                    {iniciais}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-lg text-on-surface font-black uppercase tracking-tight truncate">
                    {nome}
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium truncate">
                    {email}
                  </div>
                </div>
              </div>

              {uid && (
                <div className="mt-6 pt-6 border-t border-default">
                  <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest">
                    ID da Conta
                  </p>
                  <p className="text-[10px] font-mono text-on-surface-disabled truncate mt-1">
                    {uid}
                  </p>
                </div>
              )}
            </div>

            {/* CARD: Tema */}
            <div className={`${cardBase} p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-on-surface uppercase tracking-tight">
                    Tema do App
                  </div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                    {isDark ? "Modo Escuro" : "Modo Claro"}
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="h-12 w-24 rounded-2xl bg-surface-high dark:bg-surface-highest border border-default relative transition-all active:scale-95"
                >
                  <div
                    className={`absolute top-1 bottom-1 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isDark
                        ? "left-1 bg-on-surface text-surface-lowest"
                        : "left-12 bg-white text-on-surface shadow-md"
                    }`}
                  >
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                  </div>
                </button>
              </div>
            </div>

            {/* Backup e Reset */}
            <div className="space-y-3">
              <Item
                icon={<DownloadSimple size={22} />}
                title="Exportar Dados"
                subtitle="Salvar backup local"
                onClick={handleExportBackup}
                loading={backupLoading}
              />
              <Item
                icon={<UploadSimple size={22} />}
                title="Importar Dados"
                subtitle="Restaurar de arquivo"
                onClick={() => fileInputRef.current?.click()}
                loading={backupLoading}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleImportBackup}
              />

              <Item
                icon={<Trash size={22} />}
                title="Reiniciar Conta"
                subtitle="Apagar tudo e recomeçar"
                onClick={handleResetAccount}
                danger
                loading={backupLoading}
              />
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="space-y-6">
            {/* CARD: Reserva de Emergência */}
            <div className={`${cardBase} p-8 overflow-hidden relative`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-success-bg text-success border border-success/20 flex items-center justify-center">
                  <Bank size={22} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">
                  Reserva
                </h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
                    Saldo Acumulado
                  </p>
                  <div className="text-3xl font-black text-on-surface tracking-tighter">
                    R$ {reserva.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                      Progresso da Meta
                    </p>
                    <p className="text-xs font-black text-on-surface">
                      {Math.min(Math.round((reserva / metaSugerida) * 100), 100)}%
                    </p>
                  </div>
                  <div className="h-2 w-full bg-surface-high dark:bg-surface-highest rounded-full overflow-hidden border border-default">
                    <div
                      className="h-full bg-success transition-all duration-1000"
                      style={{
                        width: `${Math.min((reserva / metaSugerida) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-on-surface-disabled font-medium text-right">
                    Meta sugerida: R$ {metaSugerida.toLocaleString("pt-BR")}
                  </p>
                </div>

                {!showAdd ? (
                  <button
                    onClick={() => setShowAdd(true)}
                    className="w-full py-4 rounded-2xl bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[0.98] transition-all"
                  >
                    <Plus size={16} weight="bold" />
                    Adicionar Valor
                  </button>
                ) : (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input
                      autoFocus
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={novoValor}
                      onChange={(e) => setNovoValor(e.target.value)}
                      className="w-full bg-surface-high dark:bg-black/20 border border-default rounded-2xl p-4 text-sm text-on-surface font-black outline-none focus:border-on-surface transition-all"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAdd(false)}
                        className="flex-1 py-4 rounded-2xl border border-default text-[10px] font-black uppercase tracking-widest text-on-surface-variant"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddReserva}
                        className="flex-2 px-8 py-4 rounded-2xl bg-success text-white font-black text-[10px] uppercase tracking-widest"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Orbe decorativo */}
              <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-success/5 blur-3xl" />
            </div>

            {/* Link de saída */}
            <button
              onClick={handleSair}
              className="w-full py-6 rounded-[32px] border border-default text-red-400 font-black text-xs uppercase tracking-[0.3em] hover:bg-red-400/5 transition-all active:scale-95"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
