// src/pages/Perfil.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CaretRight,
  Gear,
  Shield,
  SignOut,
  User,
  Bank,
  Plus,
} from "phosphor-react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function Perfil() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState(0);
  const [novoValor, setNovoValor] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    // anima o drawer ao entrar
    const raf = requestAnimationFrame(() => setEntered(true));
    
    async function carregarReserva() {
      if (user) {
        const userRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setReserva(docSnap.data().reservaEmergencia || 0);
        }
      }
      setLoading(false);
    }
    carregarReserva();

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [user]);

  async function handleAddReserva() {
    if (!novoValor || isNaN(novoValor)) return;
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

  const cardBase = "rounded-2xl bg-zinc-900/80 border border-white/10";

  const Item = ({ icon, title, subtitle, onClick, danger }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left ${cardBase} p-5 active:scale-[0.99] transition`}
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
            {icon}
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
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Fundo + overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => navigate(-1)}
        role="button"
        tabIndex={0}
        aria-label="Fechar perfil"
      >
        {/* Glow discreto */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/30 via-purple-500/25 to-blue-500/25 blur-2xl opacity-55" />
          <div className="absolute inset-0 bg-black/35" />
        </div>
      </div>

      {/* Drawer (desliza para esquerda) */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-black border-l border-white/10
        transform transition-transform duration-500 ease-out
        ${entered ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="min-h-screen px-6 pt-8 pb-24 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-[0.98] transition"
              aria-label="Voltar"
              type="button"
            >
              <ArrowLeft size={18} className="text-white/85" />
            </button>

            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">
                Perfil
              </h1>
              <p className="text-xs text-white/55">Conta e configurações</p>
            </div>
          </div>

          {/* Conta */}
          <div className={`${cardBase} p-5`}>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <span className="text-white font-semibold">{iniciais}</span>
              </div>

              <div className="min-w-0">
                <div className="text-white font-semibold leading-snug">
                  {nome}
                </div>
                <div className="text-sm text-white/60 break-all">{email}</div>
                {uid ? (
                  <div className="mt-2 text-[11px] text-white/45 break-all">
                    UID: {uid}
                  </div>
                ) : null}
              </div>
            </div>

            {loading ? (
              <div className="mt-4 text-sm text-white/55">
                Carregando informações...
              </div>
            ) : null}
          </div>

          {/* Reserva de Emergência */}
          <div className={`mt-6 mb-6 ${cardBase} p-5 bg-gradient-to-br from-zinc-900/90 to-zinc-950`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bank size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white/90 uppercase tracking-wider">Reserva de Emergência</h3>
                  <p className="text-2xl font-black text-white mt-1">
                    R$ {reserva.toLocaleString('pt-BR')}
                  </p>
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
                  placeholder="Valor para adicionar R$"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-white placeholder:text-white/20 text-sm"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowAdd(false)}
                    className="flex-1 bg-white/5 text-white/60 text-xs font-bold p-3 rounded-xl border border-white/5"
                  >
                    CANCELAR
                  </button>
                  <button 
                    onClick={handleAddReserva}
                    className="flex-1 bg-white text-black text-xs font-bold p-3 rounded-xl"
                  >
                    CONFIRMAR
                  </button>
                </div>
              </div>
            )}
            
            <div className="mt-4 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-1000" 
                style={{ width: `${Math.min((reserva / 10000) * 100, 100)}%` }} 
              />
            </div>
            <p className="text-[10px] text-white/30 mt-2 text-right uppercase tracking-tighter">
              Meta sugerida: R$ 10.000,00
            </p>
          </div>

          {/* Ações */}
          <div className="mt-4 space-y-3">
            <Item
              icon={<User size={18} className="text-white/80" />}
              title="Minha conta"
              subtitle="Ver dados e preferências"
              onClick={() => alert("Em breve: edição de perfil.")}
            />

            <Item
              icon={<Gear size={18} className="text-white/80" />}
              title="Configurações"
              subtitle="Aparência, notificações e mais"
              onClick={() => alert("Em breve: configurações.")}
            />

            <Item
              icon={<Shield size={18} className="text-white/80" />}
              title="Segurança"
              subtitle="Senha e proteção da conta"
              onClick={() => alert("Em breve: segurança.")}
            />

            <Item
              icon={<SignOut size={18} className="text-red-200/90" />}
              title="Sair"
              subtitle="Encerrar sessão"
              onClick={handleSair}
              danger
            />
          </div>

          {/* Rodapé */}
          <div className="mt-8 text-xs text-white/40">
            Versão do app • 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}