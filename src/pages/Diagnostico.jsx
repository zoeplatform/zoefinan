import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, ChartPieSlice, ChartLineUp, ListChecks } from "phosphor-react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import MonthlyEvolution from "../components/MonthlyEvolution";
import ActionPlan from "../components/ActionPlan";
import { calculateFinancialHealth } from "../utils/financeLogic";
import { getCurrentMonthKey, getMonthList } from "../utils/dateUtils";

export default function Diagnostico() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setData(docSnap.data());
          }
        } catch (error) {
          console.error("Erro ao buscar diagnóstico:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/70"></div>
      </div>
    );
  }

  const currentMonth = getCurrentMonthKey();
  const monthData = data?.historicoMensal?.[currentMonth];

  const rendaBaseMes = Number(monthData?.rendaBase) || 0;
  const rendasExtrasMes = monthData?.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
  const renda = (rendaBaseMes + rendasExtrasMes) || Number(data?.rendaMensal) || 0;
  
  const despesasFixas = (monthData?.despesas && monthData.despesas.length > 0) 
    ? monthData.despesas 
    : (data?.despesasFixas || []);
    
  const dividas = (monthData?.dividas && monthData.dividas.length > 0)
    ? monthData.dividas
    : (data?.dividas || []);

  const totalDespesas = Array.isArray(despesasFixas)
    ? despesasFixas.reduce((sum, d) => sum + (Number(d.valor) || 0), 0)
    : 0;
  const totalParcelas = Array.isArray(dividas)
    ? dividas.reduce((sum, d) => sum + (Number(d.parcela) || 0), 0)
    : 0;

  const comprometido = totalDespesas + totalParcelas;
  const saldoLivre = renda - comprometido;

  const health = calculateFinancialHealth(renda, comprometido);
  const score = health?.score || 0;
  const status = {
    label: health?.status || "Dados insuficientes",
    color: health?.color || "text-gray-400",
    icon: health?.icon || "⚪",
    recomendacao: health?.recomendacao || "Adicione seus lançamentos no Controle Mensal para gerar seu diagnóstico."
  };

  const months = getMonthList(6);
  const evolutionData = months.map(m => {
    const mData = data?.historicoMensal?.[m];
    if (mData) {
      const rBase = Number(mData?.rendaBase) || 0;
      const rExtra = mData?.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
      const dFixa = mData?.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
      const dDiv = mData?.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;
      return { month: m, entradas: rBase + rExtra, saidas: dFixa + dDiv };
    }
    if (m === currentMonth) {
      return { month: m, entradas: renda, saidas: comprometido };
    }
    return { month: m, entradas: 0, saidas: 0 };
  }).filter(item => item.entradas > 0 || item.saidas > 0);

  const dynamicActions = [];
  if (renda === 0) {
    dynamicActions.push({ id: "action-renda", title: "Defina sua Renda", description: "Adicione sua renda base no Controle Mensal.", priority: "high" });
  }
  if (renda > 0 && totalParcelas / renda > 0.2) {
    dynamicActions.push({ id: "action-dividas", title: "Reduzir Dívidas", description: `Suas dívidas consomem ${( (totalParcelas / renda) * 100).toFixed(1)}% da sua renda.`, priority: "high" });
  }
  if (renda > 0 && totalDespesas / renda > 0.5) {
    dynamicActions.push({ id: "action-despesas", title: "Cortar Gastos", description: `Suas despesas representam ${( (totalDespesas / renda) * 100).toFixed(1)}% da sua renda.`, priority: "high" });
  }
  if (saldoLivre > 0) {
    dynamicActions.push({ id: "action-reserva", title: "Reserva de Emergência", description: `Você tem R$ ${saldoLivre.toLocaleString('pt-BR')} livres. Separe 10% para segurança.`, priority: "medium" });
  }

  const pieData = [
    { name: "Comprometido", value: comprometido || 0, fill: "#3b82f6" },
    { name: "Livre", value: Math.max(saldoLivre, 0) || (renda === 0 ? 1 : 0), fill: "rgba(255,255,255,0.1)" },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/home")} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition md:hidden">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Diagnóstico</h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Análise de Saúde Financeira</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Score e Resumo */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <ChartPieSlice size={80} weight="fill" />
              </div>
              <div className="relative w-40 h-40 mb-6">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray={`${(score / 100) * 339.3} 339.3`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-black tracking-tighter">{score}</div>
                    <div className="text-[10px] text-white/40 font-black uppercase tracking-widest">Pontos</div>
                  </div>
                </div>
              </div>
              <h3 className={`text-sm font-black uppercase tracking-widest flex items-center gap-2 ${status.color}`}>
                {status.icon} {status.label}
              </h3>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[32px]">
              <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Resumo Mensal</h2>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60 font-medium">Renda Total</span>
                  <span className="text-xl font-black">R$ {renda.toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60 font-medium">Saídas Totais</span>
                  <span className="text-xl font-black text-red-500">R$ {comprometido.toLocaleString("pt-BR")}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-sm text-white/60 font-medium">Saldo Livre</span>
                  <span className="text-xl font-black text-green-400">R$ {Math.max(saldoLivre, 0).toLocaleString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Abas e Conteúdo */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex p-1 bg-zinc-900/80 border border-white/10 rounded-2xl">
              {[
                { id: "overview", label: "VISÃO GERAL", icon: <ChartPieSlice size={16} /> },
                { id: "evolution", label: "EVOLUÇÃO", icon: <ChartLineUp size={16} /> },
                { id: "actions", label: "PLANO", icon: <ListChecks size={16} /> }
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${activeTab === tab.id ? "bg-white text-black shadow-xl scale-[1.02]" : "text-white/30 hover:text-white/60"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "overview" && (
                <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[32px]">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-bold">Distribuição de Renda</h2>
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{currentMonth}</span>
                  </div>
                  <div className="h-[300px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <div className="text-center">
                          <p className="text-3xl font-black">{renda > 0 ? ((comprometido/renda)*100).toFixed(0) : 0}%</p>
                          <p className="text-[8px] text-white/40 font-black uppercase">Comprometido</p>
                       </div>
                    </div>
                  </div>
                  <div className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <p className="text-blue-200 text-xs font-medium leading-relaxed">
                      <strong className="text-blue-400 uppercase text-[10px] block mb-1 tracking-widest">Recomendação:</strong> 
                      {status.recomendacao}
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === "evolution" && <MonthlyEvolution monthlyData={evolutionData} />}

              {activeTab === "actions" && (
                <div className="space-y-6">
                   <ActionPlan actions={dynamicActions} />
                   <button onClick={() => navigate("/plano")} className="w-full bg-white text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[0.98] transition-transform active:scale-95">
                    Ver Plano Detalhado
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
