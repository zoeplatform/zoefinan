// src/pages/Perfil.jsx
import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CaretRight,
  SignOut,
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
  
  // Padrão agora é DARK se não houver nada no localStorage
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("zoe-theme");
    return saved === null ? true : saved === "dark";
  });
  
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        carregarDados(u.uid);
      } else {
        navigate("/login");
      }
    });

    const raf = requestAnimationFrame(() => setEntered(true));
    
    async function carregarDados(uid) {
      try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReserva(data.reservaEmergencia || 0);
          
          const despesasFixas = data.despesasFixas || [];
          const totalDespesas = despesasFixas.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
          if (totalDespesas > 0) {
            setMetaSugerida(totalDespesas * 6);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    localStorage.setItem("zoe-theme", newTheme);
    window.dispatchEvent(new Event("themeChanged"));
  };

  async function handleAddReserva() {
    if (!novoValor || isNaN(novoValor) || !user) return;
    const valor = Number(novoValor);
    const total = reserva + valor;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        reservaEmergencia: total
      });
      setReserva(total);
      setNovoValor("");
      setShowAdd(false);
    } catch (e) {
      console.error("Erro ao atualizar reserva:", e);
      alert("Erro ao salvar. Tente novamente.");
    }
  }

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

  async function handleSair() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (e) {
      console.error("Erro ao sair:", e);
      alert("Não foi possível sair agora. Tente novamente.");
    }
  }

  async function handleExportBackup() {
    if (!user) return;
    setBackupLoading(true);
    try {
      await exportUserData(user.uid);
    } catch (error) {
      alert("Erro ao exportar backup: " + error.message);
    } finally {
      setBackupLoading(false);
    }
  }

  async function handleImportBackup(event) {
    const file = event.target.files[0];
    if (!file || !user) return;

    if (!window.confirm("Isso irá sobrescrever seus dados atuais com as informações do backup. Deseja continuar?")) {
      event.target.value = "";
      return;
    }

    setBackupLoading(true);
    try {
      await importUserData(user.uid, file);
      alert("Backup restaurado com sucesso! A página será recarregada.");
      window.location.reload();
    } catch (error) {
      alert("Erro ao importar backup: " + error.message);
    } finally {
      setBackupLoading(false);
      event.target.value = "";
    }
  }

  async function handleResetAccount() {
    if (!user) return;
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
        reiniciadoEm: new Date()
      });
      
      alert("Sua conta foi reiniciada com sucesso!");
      navigate("/setup");
    } catch (error) {
      console.error("Erro ao reiniciar conta:", error);
      alert("Erro ao reiniciar conta. Tente novamente.");
    } finally {
      setBackupLoading(false);
      setShowResetConfirm(false);
    }
  }

  const cardBase = "rounded-[32px] bg-surface-lowest dark:bg-surface-high border border-default shadow-xl dark:shadow-none backdrop-blur-xl transition-all duration-300";

  const Item = ({ icon, title, subtitle, onClick, danger, loading: itemLoading, rightElement }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={itemLoading}
      className={`w-full text-left ${cardBase} p-6 active:scale-[0.99] transition disabled:opacity-50 group`}
      aria-label={title}
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
            ) : icon}
          </div>

          <div className="min-w-0">
            <div
              className={`text-sm font-black uppercase tracking-tight ${
                danger ? "text-error" : "text-on-surface"
              }`}
            >
              {title}
            </div>
            {subtitle ? (
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant line-clamp-1">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <div className={`${danger ? "text-error/80" : "text-on-surface-variant"}`}>
          {rightElement || <CaretRight size={18} weight="bold" />}
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden md:overflow-auto transition-colors duration-300">
      {/* Background Premium (apenas no escuro) */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/20 via-purple-500/15 to-blue-500/15 blur-2xl " />
      </div>

      <div
        className={`relative z-10 w-full max-w-2xl mx-auto px-6 pt-8 pb-32 md:pb-8 transition-all duration-500
        ${entered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-surface-lowest dark:bg-surface-high border border-default flex items-center justify-center active:scale-95 transition-all md:hidden shadow-sm dark:shadow-none"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">Perfil</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Gerenciamento de conta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className={`${cardBase} p-8`}>
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 rounded-[20px] bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center shadow-inner">
                  <span className="text-xl text-on-surface font-black">{iniciais}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-lg text-on-surface font-black uppercase tracking-tight truncate">{nome}</div>
                  <div className="text-xs text-on-surface-variant font-medium truncate">{email}</div>
                </div>
              </div>
              {uid && (
                <div className="mt-6 pt-6 border-t border-default">
                  <p className="text-[8px] text-on-surface-disabled font-black uppercase tracking-widest">Identificador Único</p>
                  <p className="text-[10px] text-on-surface-variant font-mono break-all mt-1">{uid}</p>
                </div>
              )}
            </div>

            <div className={`${cardBase} p-8`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-info-bg border border-info/20 flex items-center justify-center text-info">
                    <Bank size={24} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Reserva Atual</h3>
                    <p className="text-2xl font-black text-on-surface">R$ {reserva.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdd(!showAdd)}
                  className="h-10 w-10 rounded-xl bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center text-on-surface hover:scale-110 transition shadow-sm"
                >
                  <Plus size={20} weight="bold" />
                </button>
              </div>

              {showAdd && (
                <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={novoValor}
                      onChange={(e) => setNovoValor(e.target.value)}
                      className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleAddReserva}
                    className="w-full py-4 rounded-2xl bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  >
                    Confirmar Aporte
                  </button>
                </div>
              )}

              <div className="pt-6 border-t border-default">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Meta Sugerida</span>
                  <span className="text-[10px] font-black text-on-surface uppercase">R$ {metaSugerida.toLocaleString('pt-BR')}</span>
                </div>
                <div className="h-2 w-full bg-surface-high dark:bg-surface-highest rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-info transition-all duration-1000"
                    style={{ width: `${Math.min((reserva / (metaSugerida || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 mb-2">Preferências</h3>
            
            <Item
              icon={isDark ? <Moon size={22} weight="bold" /> : <Sun size={22} weight="bold" />}
              title="Tema da Interface"
              subtitle={isDark ? "Modo Escuro Ativado" : "Modo Claro Ativado"}
              onClick={toggleTheme}
              rightElement={
                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDark ? 'bg-on-surface' : 'bg-on-surface-disabled'}`}>
                  <div className={`w-4 h-4 bg-surface-lowest rounded-full transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              }
            />

            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-2 mt-6 mb-2">Dados e Segurança</h3>

            <Item
              icon={<DownloadSimple size={22} weight="bold" />}
              title="Exportar Backup"
              subtitle="Salvar dados em arquivo JSON"
              onClick={handleExportBackup}
              loading={backupLoading}
            />

            <Item
              icon={<UploadSimple size={22} weight="bold" />}
              title="Importar Backup"
              subtitle="Restaurar dados de arquivo"
              onClick={() => fileInputRef.current?.click()}
              loading={backupLoading}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />

            <Item
              icon={<Warning size={22} weight="bold" />}
              title="Reiniciar Conta"
              subtitle="Limpar todos os lançamentos"
              danger
              onClick={() => setShowResetConfirm(true)}
            />

            <Item
              icon={<SignOut size={22} weight="bold" />}
              title="Sair da Conta"
              onClick={handleSair}
            />
          </div>
        </div>

        {/* Modal de Confirmação de Reset */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className={`${cardBase} w-full max-w-sm p-8 text-center`}>
              <div className="h-16 w-16 rounded-full bg-error-bg border border-error/20 flex items-center justify-center text-error mx-auto mb-6">
                <Warning size={32} weight="bold" />
              </div>
              <h3 className="text-xl font-black text-on-surface uppercase tracking-tight mb-2">Tem certeza?</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-8">
                Esta ação irá apagar permanentemente todo o seu histórico financeiro. Não é possível desfazer.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleResetAccount}
                  className="w-full py-4 rounded-2xl bg-error text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Sim, Reiniciar Tudo
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-4 rounded-2xl bg-surface-high dark:bg-surface-highest text-on-surface font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="mt-12 text-center text-[10px] font-black text-on-surface-disabled uppercase tracking-[0.3em]">
          ZoeFinan • Versão 1.1.0 • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
