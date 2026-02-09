import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Receipt, CreditCard, TrendUp, Plus } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";
import { useNavigate } from "react-router-dom";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const currentMonth = getCurrentMonthKey();
            const monthData = data.historicoMensal?.[currentMonth];

            if (monthData) {
              const despesas = (monthData.despesas || []).map((d) => ({
                ...d,
                tipo: "despesa",
                data: d.data || new Date().toISOString(),
              }));

              const dividas = (monthData.dividas || []).map((d) => ({
                ...d,
                descricao: d.credor,
                valor: d.parcela,
                tipo: "divida",
                data: d.data || new Date().toISOString(),
              }));

              const rendas = (monthData.rendasExtras || []).map((r) => ({
                ...r,
                tipo: "renda",
                data: r.data || new Date().toISOString(),
              }));

              const todas = [...despesas, ...dividas, ...rendas].sort((a, b) => {
                const dateA = new Date(a.data || 0);
                const dateB = new Date(b.data || 0);
                return dateB - dateA;
              });

              setTransactions(todas.slice(0, 5));
            } else {
              const despesas = (data.despesasFixas || []).map((d) => ({
                ...d,
                tipo: "despesa",
                data: data.atualizadoEm?.toDate?.() || new Date(),
              }));

              const dividas = (data.dividas || []).map((d) => ({
                ...d,
                descricao: d.credor,
                valor: d.parcela,
                tipo: "divida",
                data: data.atualizadoEm?.toDate?.() || new Date(),
              }));

              const todas = [...despesas, ...dividas].sort((a, b) => (b.id || 0) - (a.id || 0));
              setTransactions(todas.slice(0, 5));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar transações:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-on-surface-variant mx-auto mb-4" />
        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest">Carregando lançamentos...</p>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-default bg-surface-lowest dark:bg-surface-high p-8 shadow-xl dark:shadow-none transition-all duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-on-surface uppercase tracking-tighter">Atividade Recente</h3>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Últimos lançamentos</p>
        </div>
        <button 
          onClick={() => navigate("/lancamentos")}
          className="h-10 w-10 rounded-xl bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center text-on-surface hover:scale-110 transition-all"
        >
          <Plus size={20} weight="bold" />
        </button>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-default bg-surface-low dark:bg-black/10 p-8 text-center">
            <p className="text-xs font-bold text-on-surface-medium uppercase tracking-tight">Nenhum lançamento encontrado</p>
            <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-widest">Adicione despesas para ver seu histórico</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id ?? `${t.tipo}-${t.descricao}-${t.valor}`}
              className="flex justify-between items-center p-4 rounded-2xl bg-surface-low dark:bg-black/10 border border-default group hover:bg-surface-high dark:hover:bg-surface-low transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl border border-default flex items-center justify-center ${
                  t.tipo === 'renda' ? 'bg-success-bg text-success' : 
                  t.tipo === 'divida' ? 'bg-info-bg text-info' : 
                  'bg-surface-high dark:bg-surface-highest text-on-surface-medium'
                }`}>
                  {t.tipo === "despesa" ? <Receipt size={20} /> : t.tipo === "divida" ? <CreditCard size={20} /> : <TrendUp size={20} />}
                </div>

                <div>
                  <p className="text-sm font-black text-on-surface uppercase tracking-tight">
                    {t.descricao}
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                    {t.tipo === "despesa" ? "Despesa" : t.tipo === "divida" ? "Dívida" : "Renda Extra"}
                  </p>
                </div>
              </div>

              <span className={`text-sm font-black ${t.tipo === 'renda' ? 'text-success' : 'text-on-surface'}`}>
                {t.tipo === 'renda' ? '+' : '-'} R$ {Number(t.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => navigate("/lancamentos")}
        className="w-full mt-8 py-4 rounded-2xl border border-default bg-surface-high dark:bg-surface-highest text-[10px] font-black text-on-surface-medium uppercase tracking-[0.2em] hover:bg-on-surface hover:text-surface-lowest dark:hover:bg-white dark:hover:text-black transition-all"
      >
        Ver Extrato Completo
      </button>
    </div>
  );
}
