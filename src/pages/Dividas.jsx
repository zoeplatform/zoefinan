import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Plus, Trash, CreditCard, Info } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Dividas() {
  const [credor, setCredor] = useState("");
  const [saldo, setSaldo] = useState("");
  const [parcela, setParcela] = useState("");
  const [isParcelada, setIsParcelada] = useState(false);
  const [lista, setLista] = useState([]);
  const [fetching, setFetching] = useState(true);

  const navigate = useNavigate();
  const currentMonth = getCurrentMonthKey();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const monthData = userData.historicoMensal?.[currentMonth]?.dividas;
            const baseData = userData.dividas;
            setLista(monthData || baseData || []);
          }
        } catch (error) {
          console.error("Erro ao carregar dívidas:", error);
        }
      } else {
        navigate("/login");
      }
      setFetching(false);
    });

    return () => unsubscribe();
  }, [currentMonth, navigate]);

  async function sincronizarDados(novaLista) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(userRef);
      const userData = docSnap.data() || {};
      const currentMonthData = userData.historicoMensal?.[currentMonth] || {};
      
      await updateDoc(userRef, {
        dividas: novaLista,
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
    if (!credor || !saldo) return;
    if (isParcelada && !parcela) return;

    const nova = {
      id: Date.now(),
      credor,
      saldo: Number(saldo),
      parcela: isParcelada ? Number(parcela) : Number(saldo),
      isParcelada,
      data: new Date().toISOString()
    };

    const novaLista = [...lista, nova];
    setLista(novaLista);
    setCredor("");
    setSaldo("");
    setParcela("");
    setIsParcelada(false);
    await sincronizarDados(novaLista);
  };

  const removerDivida = async (id) => {
    const novaLista = lista.filter(item => item.id !== id);
    setLista(novaLista);
    await sincronizarDados(novaLista);
  };

  if (fetching) {
    return (
      <div className="h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-on-surface-variant mr-3" />
        Carregando...
      </div>
    );
  }

  const totalComprometido = lista.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0);

  return (
    <div className="min-h-screen bg-surface px-6 pt-8 pb-32 relative overflow-hidden transition-colors duration-300">
      {/* Background Premium */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-purple-500/10 via-blue-500/10 to-pink-500/10 blur-[100px] opacity-30" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl shadow-sm dark:shadow-none --app-background dark:bg-surface-high border border-default flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">Dívidas Atuais</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Gestão de Passivos</p>
          </div>
        </div>

        {/* Card de Adição */}
        <div className="rounded-[32px] --app-background dark:bg-surface-high border border-default p-8 shadow-xl dark:shadow-none mb-8">
          <h2 className="text-[10px] font-black text-on-surface-variant mb-5 uppercase tracking-[0.2em]">Novo Compromisso</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Credor</label>
              <input
                type="text"
                placeholder="Credor (ex: Banco X, Cartão Y)"
                value={credor}
                onChange={(e) => setCredor(e.target.value)}
                className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Saldo Total Devedor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={saldo}
                  onChange={(e) => setSaldo(e.target.value)}
                  className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-low dark:bg-surface-highest rounded-2xl border border-default">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-on-surface-variant" />
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest cursor-pointer">Esta dívida é parcelada?</label>
              </div>
              <button 
                onClick={() => setIsParcelada(!isParcelada)}
                className={`w-12 h-6 rounded-full transition-colors relative ${isParcelada ? 'bg-success' : 'bg-on-surface-disabled'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isParcelada ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {isParcelada && (
              <div className="space-y-1 animate-in zoom-in-95">
                <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Valor da Parcela Mensal</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={parcela}
                    onChange={(e) => setParcela(e.target.value)}
                    className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none"
                  />
                </div>
              </div>
            )}

            <button
              onClick={adicionarDivida}
              className="w-full py-5 mt-2 rounded-2xl bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all shadow-lg"
            >
              <Plus weight="bold" size={16} />
              ADICIONAR À LISTA
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Sua Lista</h3>
          <div className="text-right">
            <p className="text-[10px] text-on-surface-variant uppercase font-black">Comprometimento Mensal</p>
            <p className="text-xl font-black text-error">R$ {(totalComprometido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Listagem */}
        <div className="space-y-3">
          {lista.length === 0 ? (
            <div className="text-center py-16 bg-surface-low dark:bg-surface-high rounded-[32px] border border-dashed border-default">
              <CreditCard size={32} className="mx-auto text-on-surface-disabled mb-3" />
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Nenhuma dívida registrada</p>
            </div>
          ) : (
            lista.map((item) => (
              <div key={item.id} className="group relative rounded-2xl --app-background dark:bg-surface-high border border-default p-6 hover:border-strong transition-all shadow-sm dark:shadow-none">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-surface-high dark:bg-surface-highest flex items-center justify-center text-on-surface-variant group-hover:text-on-surface transition-colors">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-on-surface uppercase tracking-tight">{item.credor}</p>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.isParcelada ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
                        {item.isParcelada ? 'Parcelada' : 'Valor Total'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removerDivida(item.id)}
                    className="p-2 text-on-surface-disabled hover:text-error hover:bg-error-bg rounded-xl transition-all"
                  >
                    <Trash size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-default">
                  <div>
                    <p className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest">Saldo Total</p>
                    <p className="text-sm font-black text-on-surface-medium">R$ {(item.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest">Comprometimento</p>
                    <p className="text-sm font-black text-on-surface">R$ {(item.parcela || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => navigate("/diagnostico")}
          className="w-full mt-10 rounded-[24px] bg-on-surface text-surface-lowest dark:bg-white dark:text-black py-5 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl"
        >
          Gerar Diagnóstico
        </button>
      </div>
    </div>
  );
}
