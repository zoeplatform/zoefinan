import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Plus, Trash, CreditCard, Info, Warning } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Dividas() {
  const [credor, setCredor] = useState("");
  const [saldo, setSaldo] = useState("");
  const [parcela, setParcela] = useState("");
  const [renegociada, setRenegociada] = useState(false);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();
  const currentMonth = getCurrentMonthKey();

  useEffect(() => {
    async function carregarDados() {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Prioriza dados do histórico mensal para manter coesão
            const monthData = userData.historicoMensal?.[currentMonth]?.dividas;
            const baseData = userData.dividas;
            setLista(monthData || baseData || []);
          }
        } catch (error) {
          console.error("Erro ao carregar dívidas:", error);
        }
      }
      setFetching(false);
    }
    carregarDados();
  }, [currentMonth]);

  async function sincronizarDados(novaLista) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(userRef);
      const userData = docSnap.data() || {};
      
      const currentMonthData = userData.historicoMensal?.[currentMonth] || {};
      
      await updateDoc(userRef, {
        // Atualiza no perfil base
        dividas: novaLista,
        // Atualiza no histórico do mês atual
        [`historicoMensal.${currentMonth}`]: {
          ...currentMonthData,
          dividas: novaLista
        },
        atualizadoEm: new Date()
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  }

  const adicionarDivida = async () => {
    if (!credor || !saldo || !parcela) return;

    const nova = {
      id: Date.now(),
      credor,
      saldo: Number(saldo),
      parcela: Number(parcela),
      renegociada,
      data: new Date().toISOString()
    };

    const novaLista = [...lista, nova];
    setLista(novaLista);
    setCredor("");
    setSaldo("");
    setParcela("");
    setRenegociada(false);
    await sincronizarDados(novaLista);
  };

  const removerDivida = async (id) => {
    const novaLista = lista.filter(item => item.id !== id);
    setLista(novaLista);
    await sincronizarDados(novaLista);
  };

  if (fetching) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white/70">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/30 mr-3" />
        Carregando...
      </div>
    );
  }

  const totalParcelas = lista.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0);

  return (
    <div className="min-h-screen bg-black px-6 pt-8 pb-32 relative overflow-hidden">
      {/* Background Premium */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-purple-500/10 via-blue-500/10 to-pink-500/10 blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Dívidas Atuais</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Gestão de Passivos</p>
          </div>
        </div>

        {/* Card de Adição */}
        <div className="rounded-3xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl mb-8">
          <h2 className="text-[10px] font-black text-white/30 mb-5 uppercase tracking-[0.2em]">Novo Compromisso</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Credor (ex: Banco X, Cartão Y)"
              value={credor}
              onChange={(e) => setCredor(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold">SALDO R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-16 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold">PARCELA R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={parcela}
                  onChange={(e) => setParcela(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-16 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <input
                type="checkbox"
                id="renegociada"
                checked={renegociada}
                onChange={(e) => setRenegociada(e.target.checked)}
                className="w-5 h-5 rounded-lg bg-black border-white/10 text-white focus:ring-0"
              />
              <label htmlFor="renegociada" className="text-xs font-bold text-white/60 uppercase tracking-widest cursor-pointer">Já foi renegociada?</label>
            </div>

            <button
              onClick={adicionarDivida}
              className="w-full py-4 rounded-2xl bg-white text-black font-black text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all"
            >
              <Plus weight="bold" size={16} />
              ADICIONAR À LISTA
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Sua Lista</h3>
          <div className="text-right">
            <p className="text-[10px] text-white/30 uppercase font-black">Comprometimento Mensal</p>
            <p className="text-lg font-black text-red-400">R$ {totalParcelas.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Listagem */}
        <div className="space-y-3">
          {lista.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <CreditCard size={32} className="mx-auto text-white/10 mb-3" />
              <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Nenhuma dívida registrada</p>
            </div>
          ) : (
            lista.map((item) => (
              <div key={item.id} className="group relative rounded-2xl bg-zinc-900/40 border border-white/5 p-5 hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white transition-colors">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90">{item.credor}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.renegociada ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {item.renegociada ? 'Renegociada' : 'Valor Bruto'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removerDivida(item.id)}
                    className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div>
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Saldo Total</p>
                    <p className="text-sm font-black text-white/80">R$ {item.saldo.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">Parcela Mensal</p>
                    <p className="text-sm font-black text-white">R$ {item.parcela.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => navigate("/diagnostico")}
          className="w-full mt-10 rounded-3xl bg-white text-black py-5 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-white/5"
        >
          Gerar Diagnóstico
        </button>
      </div>
    </div>
  );
}
