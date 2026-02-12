import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Plus, Trash, Receipt } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Despesas() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
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
            const monthData = userData.historicoMensal?.[currentMonth]?.despesas;
            const baseData = userData.despesasFixas;
            setLista(monthData || baseData || []);
          }
        } catch (error) {
          console.error("Erro ao carregar despesas:", error);
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
        despesasFixas: novaLista,
        [`historicoMensal.${currentMonth}`]: {
          ...currentMonthData,
          despesas: novaLista
        },
        atualizadoEm: new Date()
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Erro ao salvar no banco de dados.");
    }
  }

  const adicionarDespesa = async () => {
    if (!descricao || !valor) return;

    const nova = {
      id: Date.now(),
      descricao,
      valor: Number(valor),
      data: new Date().toISOString()
    };

    const novaLista = [...lista, nova];
    setLista(novaLista);
    setDescricao("");
    setValor("");
    await sincronizarDados(novaLista);
  };

  const removerDespesa = async (id) => {
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

  const total = lista.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  return (
    <div className="min-h-screen bg-surface px-6 pt-8 pb-32 relative overflow-hidden transition-colors duration-300">
      {/* Background Premium (apenas no escuro) */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-orange-500/10 via-purple-500/10 to-blue-500/10 blur-[100px] opacity-30" />
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
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">Despesas Fixas</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Gestão de Custos Mensais</p>
          </div>
        </div>

        {/* Card de Adição */}
        <div className="rounded-[32px] --app-background dark:bg-surface-high border border-default p-8 shadow-xl dark:shadow-none mb-8">
          <h2 className="text-[10px] font-black text-on-surface-variant mb-5 uppercase tracking-[0.2em]">Nova Despesa</h2>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Aluguel, Internet, Academia"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Valor Mensal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                <input
                  type="number"
                  placeholder="0,00"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 pl-10 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none"
                />
              </div>
            </div>
            <button
              onClick={adicionarDespesa}
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
            <p className="text-[10px] text-on-surface-variant uppercase font-black">Total Mensal</p>
            <p className="text-xl font-black text-on-surface">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        {/* Listagem */}
        <div className="space-y-3">
          {lista.length === 0 ? (
            <div className="text-center py-16 bg-surface-low dark:bg-surface-high rounded-[32px] border border-dashed border-default">
              <Receipt size={32} className="mx-auto text-on-surface-disabled mb-3" />
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Nenhuma despesa registrada</p>
            </div>
          ) : (
            lista.map((item) => (
              <div key={item.id} className="group relative rounded-2xl --app-background dark:bg-surface-high border border-default p-5 flex justify-between items-center hover:border-strong transition-all shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-surface-high dark:bg-surface-highest flex items-center justify-center text-on-surface-variant group-hover:text-on-surface transition-colors">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-on-surface uppercase tracking-tight">{item.descricao}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Recorrente</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-on-surface">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <button 
                    onClick={() => removerDespesa(item.id)}
                    className="p-2 text-on-surface-disabled hover:text-error hover:bg-error-bg rounded-xl transition-all"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => navigate("/lancamentos")}
          className="w-full mt-10 rounded-[24px] bg-surface-high dark:bg-surface-highest border border-default text-on-surface-medium py-5 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-on-surface hover:text-surface-lowest dark:hover:bg-white dark:hover:text-black"
        >
          Ir para Controle Mensal
        </button>
      </div>
    </div>
  );
}
