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
  const [novoValor, setNovoValor] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        carregarReserva(u.uid);
      } else {
        navigate("/login");
      }
    });

    const raf = requestAnimationFrame(() => setEntered(true));
    
    async function carregarReserva(uid) {
      try {
        const userRef = doc(db, "usuarios", uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setReserva(docSnap.data().reservaEmergencia || 0);
        }
      } catch (e) {
        console.error("Erro ao carregar reserva:", e);
      } finally {
        setLoading(false);
      }
    }

    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [navigate]);

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

  const cardBase = "rounded-2xl bg-zinc-900/80 border border-white/10";

  const Item = ({ icon, title, subtitle, onClick, danger, loading: itemLoading }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={itemLoading}
      className={`w-full text-left ${cardBase} p-5 active:scale-[0.99] transition disabled:opacity-50`}
      aria-label={title}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`mt-0.5 h-10 w-10 rounded-xl flex items-center justify-center border ${
              danger
                ? "bg-red-500/10 border-red-500/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            {itemLoading ? (
              <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : icon}
          </div>

          <div className="min-w-0">
            <div
              className={`text-[15px] font-semibold leading-snug ${
                danger ? "text-red-200" : "text-white"
              }`}
            >
              {title}
            </div>
            {subtitle ? (
              <div className="mt-1 text-sm text-white/55 line-clamp-1">
                {subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <div className={`${danger ? "text-red-200/80" : "text-white/70"}`}>
          <CaretRight size={18} />
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-black relative overflow-hidden md:overflow-auto">
      {/* Background Premium */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/20 via-purple-500/15 to-blue-500/15 blur-2xl opacity-55" />
      </div>

      {/* Layout Mobile (Drawer) vs Desktop (Centered) */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-auto px-6 pt-8 pb-32 md:pb-8 transition-all duration-500
        ${entered ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all md:hidden"
            aria-label="Voltar"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Perfil</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Gerenciamento de conta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna 1: Dados do Usuário e Reserva */}
          <div className="space-y-6">
            {/* Card do Usuário */}
            <div className={`${cardBase} p-6`}>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                  <span className="text-xl text-white font-black">{iniciais}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-lg text-white font-bold leading-tight truncate">{nome}</div>
                  <div className="text-sm text-white/40 truncate">{email}</div>
                </div>
              </div>
              {uid && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">Identificador Único</p>
                  <p className="text-[10px] text-white/30 font-mono break-all">{uid}</p>
                </div>
              )}
            </div>

            {/* Reserva de Emergência */}
            <div className={`${cardBase} p-6 bg-gradient-to-br from-zinc-900/90 to-zinc-950`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Bank size={20} />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest">Reserva Atual</h3>
                    <p className="text-2xl font-black text-white">R$ {reserva.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAdd(!showAdd)}
                  className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white active:scale-95 transition"
                >
                  <Plus size={20} />
                </button>
              </div>

              {showAdd && (
                <div className="space-y-3 mt-4 pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="number"
                    value={novoValor}
                    onChange={(e) => setNovoValor(e.target.value)}
                    placeholder="Valor para adicionar"
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-all"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowAdd(false)} className="flex-1 bg-white/5 text-white/60 text-[10px] font-black p-3 rounded-xl border border-white/5">CANCELAR</button>
                    <button onClick={handleAddReserva} className="flex-1 bg-white text-black text-[10px] font-black p-3 rounded-xl">CONFIRMAR</button>
                  </div>
                </div>
              )}
              
              <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min((reserva / 10000) * 100, 100)}%` }} />
              </div>
              <p className="text-[8px] text-white/20 mt-2 text-right uppercase font-black tracking-widest">Meta sugerida: R$ 10.000,00</p>
            </div>
          </div>

          {/* Coluna 2: Ações e Backup */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-1">Dados e Segurança</h3>
              
              <Item
                icon={<DownloadSimple size={18} className="text-white/80" />}
                title="Exportar Backup"
                subtitle="Salvar dados em arquivo JSON"
                onClick={handleExportBackup}
                loading={backupLoading}
              />

              <Item
                icon={<UploadSimple size={18} className="text-white/80" />}
                title="Importar Backup"
                subtitle="Restaurar dados salvos"
                onClick={() => fileInputRef.current?.click()}
                loading={backupLoading}
              />
              <input type="file" ref={fileInputRef} onChange={handleImportBackup} accept=".json" className="hidden" />

              <Item
                icon={<Trash size={18} className="text-red-400" />}
                title="Reiniciar Conta"
                subtitle="Apagar tudo e começar do zero"
                onClick={() => setShowResetConfirm(true)}
                danger
              />

              <Item
                icon={<SignOut size={18} className="text-red-200/90" />}
                title="Sair da Sessão"
                subtitle="Encerrar acesso atual"
                onClick={handleSair}
                danger
              />
            </div>

            <div className="pt-4 text-center md:text-left">
              <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">ZoeFinan • Versão 1.0.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowResetConfirm(false)} />
          <div className="relative w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto mb-6">
              <Warning size={32} weight="bold" />
            </div>
            <h2 className="text-xl font-black text-white text-center mb-2 uppercase tracking-tighter">Reiniciar Conta?</h2>
            <p className="text-white/40 text-xs text-center mb-8 leading-relaxed">Esta ação é irreversível. Todos os seus lançamentos, históricos e configurações serão apagados permanentemente.</p>
            <div className="space-y-3">
              <button onClick={handleResetAccount} disabled={backupLoading} className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition active:scale-95 disabled:opacity-50 uppercase text-[10px] tracking-widest">{backupLoading ? "Reiniciando..." : "Sim, apagar tudo"}</button>
              <button onClick={() => setShowResetConfirm(false)} className="w-full py-4 bg-white/5 text-white/60 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition uppercase text-[10px] tracking-widest">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
