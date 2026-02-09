import { useEffect, useState } from "react";
import LineChart from "../components/LineChart";
import CategoryBreakdown from "../components/CategoryBreakdown";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { formatMonthKey, getMonthList, getCurrentMonthKey } from "../utils/dateUtils";
import { TrendUp, TrendDown, CalendarBlank } from "phosphor-react";

export default function Analytics() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            const months = getMonthList(12);
            setAvailableMonths(months);
            if (!months.includes(selectedMonth)) {
              setSelectedMonth(months[months.length - 1]);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, [selectedMonth]);

  const getMonthData = () => {
    if (!userData) return null;
    return userData.historicoMensal?.[selectedMonth] || {
      rendaBase: userData.rendaMensal || 0,
      despesas: userData.despesasFixas || [],
      dividas: userData.dividas || [],
      rendasExtras: []
    };
  };

  const monthData = getMonthData();
  
  const totalIncome = (Number(monthData?.rendaBase) || 0) + 
    (monthData?.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);
  
  const totalExpenses = (monthData?.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0) + 
    (monthData?.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0);

  const categories = [
    { name: "Despesas", amount: monthData?.despesas?.reduce((acc, curr) => acc + curr.valor, 0) || 0, ideal: 50 },
    { name: "Dívidas", amount: monthData?.dividas?.reduce((acc, curr) => acc + (curr.parcela || 0), 0) || 0, ideal: 20 },
  ].map(cat => ({
    ...cat,
    percentage: totalIncome > 0 ? (cat.amount / totalIncome) * 100 : 0,
    status: (cat.amount / totalIncome) * 100 > cat.ideal ? "critical" : "ok"
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/70" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Analytics</h1>
            <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">Saúde Financeira</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <CalendarBlank size={24} weight="duotone" className="text-white/60" />
          </div>
        </header>

        {/* Seletor de Meses */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {availableMonths.map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black transition-all duration-300 whitespace-nowrap border ${
                selectedMonth === month
                  ? "bg-white text-black border-white shadow-lg shadow-white/5 scale-105"
                  : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {formatMonthKey(month).toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gráfico de Desempenho */}
          <div className="lg:col-span-8">
            <div className="bg-zinc-900/40 border border-white/10 rounded-[32px] p-7 backdrop-blur-xl shadow-2xl h-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-1">Saldo Acumulado</p>
                  <h3 className="text-3xl font-black">
                    R$ {(totalIncome - totalExpenses).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${totalIncome > totalExpenses ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {totalIncome > totalExpenses ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                  {totalIncome > 0 ? (( (totalIncome - totalExpenses) / totalIncome) * 100).toFixed(0) : 0}%
                </div>
              </div>
              <div className="h-64 w-full">
                <LineChart />
              </div>
            </div>
          </div>

          {/* Resumo e Detalhamento */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Entradas</p>
                </div>
                <p className="text-xl font-black text-white">
                  R$ {totalIncome.toLocaleString("pt-BR")}
                </p>
              </div>
              <div className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Saídas</p>
                </div>
                <p className="text-xl font-black text-white">
                  R$ {totalExpenses.toLocaleString("pt-BR")}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/60 border border-white/10 rounded-[32px] p-6">
              <CategoryBreakdown categories={categories} totalIncome={totalIncome} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
