import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, ChartPie, TrendUp, Receipt } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Diagnostico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [renda, setRenda] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [comprometido, setComprometido] = useState(0);
  const [activeTab, setActiveTab] = useState("distribuicao");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const monthKey = getCurrentMonthKey();
            const monthData = data.historicoMensal?.[monthKey];

            if (monthData) {
              const totalRenda = (Number(monthData.rendaBase) || 0) + 
                                 (monthData.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);
              const totalDespesas = monthData.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
              const totalDividas = monthData.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;
              
              setRenda(totalRenda);
              setSaidas(totalDespesas + totalDividas);
              setComprometido(totalDespesas + totalDividas);
              
              // Cálculo de Score Simples
              const perc = totalRenda > 0 ? ((totalDespesas + totalDividas) / totalRenda) * 100 : 100;
              let s = 100 - perc;
              if (s < 0) s = 0;
              setScore(Math.round(s));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-on-surface-variant"></div>
      </div>
    );
  }

  const currentMonth = getCurrentMonthKey();

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 pb-32 md:pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/home")} className="h-12 w-12 bg-surface-lowest dark:bg-surface-high border border-default rounded-2xl shadow-sm dark:shadow-none transition md:hidden flex items-center justify-center">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-on-surface">Diagnóstico</h1>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Análise de Saúde Financeira</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna Esquerda: Score e Resumo */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-lowest dark:bg-surface-high border border-default p-8 rounded-[32px] shadow-xl dark:shadow-none text-center">
              <div className="relative inline-block mb-6">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-high dark:text-surface-highest" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray={339.29} strokeDashoffset={339.29 - (339.29 * score) / 100} strokeLinecap="round" className="text-accent-primary transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-black tracking-tighter text-on-surface">{score}</div>
                  <div className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Pontos</div>
                </div>
              </div>
              <h2 className="text-lg font-black text-on-surface mb-2 uppercase tracking-tight">Sua Saúde</h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {score >= 70 ? "Excelente! Você tem um ótimo controle." : score >= 40 ? "Bom, mas pode melhorar alguns pontos." : "Atenção! Suas finanças precisam de cuidado."}
              </p>
            </div>

            <div className="bg-surface-lowest dark:bg-surface-high border border-default p-8 rounded-[32px] shadow-xl dark:shadow-none">
              <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Resumo Mensal</h2>
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-on-surface-variant font-black uppercase tracking-tight">Renda Total</span>
                  <span className="text-xl font-black text-on-surface">R$ {renda.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-on-surface-variant font-black uppercase tracking-tight">Saídas Totais</span>
                  <span className="text-xl font-black text-error">R$ {saidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-5 border-t border-default flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant font-black uppercase tracking-tight">Saldo Livre</span>
                  <span className={`text-xl font-black ${renda - saidas >= 0 ? "text-success" : "text-error"}`}>R$ {(renda - saidas).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Detalhes e Gráficos */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex p-1.5 bg-surface-lowest dark:bg-surface-high border border-default rounded-2xl shadow-sm dark:shadow-none">
              {[
                { id: "distribuicao", label: "Distribuição", icon: <ChartPie size={18} /> },
                { id: "evolucao", label: "Evolução", icon: <TrendUp size={18} /> },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${activeTab === tab.id ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black shadow-lg scale-[1.02]" : "text-on-surface-variant hover:text-on-surface"}`}>
                  {tab.icon}
                  {tab.label.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="bg-surface-lowest dark:bg-surface-high border border-default p-8 rounded-[32px] shadow-xl dark:shadow-none min-h-[400px]">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-lg font-black text-on-surface uppercase tracking-tight">Distribuição de Renda</h2>
                  <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{currentMonth}</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center text-on-surface-disabled">
                  <Receipt size={24} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative h-56 w-56 mx-auto">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="24" className="text-surface-high dark:text-surface-highest" />
                    <circle cx="112" cy="112" r="90" fill="none" stroke="currentColor" strokeWidth="24" strokeDasharray={565.48} strokeDashoffset={565.48 - (565.48 * comprometido) / (renda || 1)} strokeLinecap="round" className="text-error transition-all duration-1000" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-4xl font-black text-on-surface tracking-tighter">{renda > 0 ? ((comprometido/renda)*100).toFixed(0) : 0}%</p>
                    <p className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest">Comprometido</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-info-bg border border-info/20 rounded-[24px]">
                    <p className="text-info text-xs font-bold leading-relaxed">
                      <strong className="text-info uppercase text-[10px] block mb-2 tracking-widest font-black">Recomendação Zoe:</strong> 
                      Seu comprometimento ideal deve ser de no máximo 70% da sua renda total para manter uma reserva saudável e investir no seu futuro.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full bg-surface-high dark:bg-surface-highest border border-default" />
                      <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Renda Disponível</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 rounded-full bg-error" />
                      <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Gastos Totais</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={() => navigate("/plano")} className="w-full bg-on-surface text-surface-lowest dark:bg-white dark:text-black py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[0.98] transition-transform active:scale-95">
              Ver Plano de Ação Estratégico
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
