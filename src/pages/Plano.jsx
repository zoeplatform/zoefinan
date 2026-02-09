import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Target, Lightning } from "phosphor-react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Plano() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) setData(docSnap.data());
        } catch (error) {
          console.error("Erro ao buscar plano:", error);
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
      <div className="h-screen bg-surface flex items-center justify-center text-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-on-surface-variant mr-3" />
        Carregando seu plano...
      </div>
    );
  }

  const currentMonth = getCurrentMonthKey();
  const monthData = data?.historicoMensal?.[currentMonth];

  const rendaBaseMes = Number(monthData?.rendaBase) || 0;
  const rendasExtrasMes = monthData?.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
  const renda = (rendaBaseMes + rendasExtrasMes) || Number(data?.rendaMensal) || 0;
  
  const despesas = (monthData?.despesas && monthData.despesas.length > 0) 
    ? monthData.despesas 
    : (data?.despesasFixas || []);
    
  const dividas = (monthData?.dividas && monthData.dividas.length > 0)
    ? monthData.dividas
    : (data?.dividas || []);

  const totalDespesas = despesas.reduce((sum, d) => sum + (Number(d?.valor) || 0), 0);
  const totalParcelas = dividas.reduce((sum, d) => sum + (Number(d?.parcela) || 0), 0);

  const comprometido = totalDespesas + totalParcelas;
  const saldoLivre = Math.max(renda - comprometido, 0);

  const metaReserva = totalDespesas * 6;
  const sugestaoReservaMensal = renda > 0 ? renda * 0.15 : 0;

  const limiteGastos = renda * 0.5;
  const excessoGastos = totalDespesas > limiteGastos ? totalDespesas - limiteGastos : 0;

  const ataqueDividas = saldoLivre > 0 ? saldoLivre * 0.6 : 0;

  const cardBase = "rounded-[32px] bg-surface-lowest dark:bg-surface-high border border-default p-8 shadow-xl dark:shadow-none h-full transition-all duration-300";

  return (
    <div className="min-h-screen bg-surface px-6 pt-8 pb-32 md:pb-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Premium (apenas no escuro) */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-orange-500/20 via-purple-500/15 to-blue-500/15 blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl shadow-sm dark:shadow-none bg-surface-lowest dark:bg-surface-high border border-default flex items-center justify-center active:scale-95 transition-all md:hidden"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">Plano Estratégico</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Personalizado para {currentMonth}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reserva de Emergência */}
          <div className={cardBase}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-info-bg border border-info/20 flex items-center justify-center text-info">
                  <ShieldCheck size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Reserva de Segurança</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-low dark:bg-black/10 p-4 rounded-2xl border border-default">
                <p className="text-[10px] text-on-surface-variant uppercase font-black mb-1">Meta Total (6 meses)</p>
                <p className="text-lg font-black text-on-surface">R$ {metaReserva.toLocaleString("pt-BR")}</p>
              </div>
              <div className="bg-surface-low dark:bg-black/10 p-4 rounded-2xl border border-default">
                <p className="text-[10px] text-on-surface-variant uppercase font-black mb-1">Aporte Mensal Sugerido</p>
                <p className="text-lg font-black text-success">R$ {sugestaoReservaMensal.toLocaleString("pt-BR")}</p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Com base em suas despesas de R$ {totalDespesas.toLocaleString('pt-BR')}, sua meta é ter 6 meses de cobertura para imprevistos.
              </p>
            </div>
          </div>

          {/* Controle de Gastos */}
          <div className={cardBase}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning-bg border border-warning/20 flex items-center justify-center text-warning">
                  <Target size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Otimização de Gastos</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Total de Despesas Fixas</span>
                <span className="font-bold text-on-surface">R$ {totalDespesas.toLocaleString("pt-BR")}</span>
              </div>
              <div className="w-full bg-surface-high dark:bg-surface-highest h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${excessoGastos > 0 ? 'bg-error' : 'bg-success'}`}
                  style={{ width: `${Math.min((totalDespesas / (renda || 1)) * 100, 100)}%` }}
                />
              </div>
              {excessoGastos > 0 ? (
                <div className="p-4 rounded-2xl bg-error-bg border border-error/20">
                  <p className="text-xs text-error leading-relaxed">
                    Você está acima do limite ideal de 50%. Tente reduzir <span className="font-black">R$ {excessoGastos.toLocaleString("pt-BR")}</span> em gastos não essenciais.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-success-bg border border-success/20">
                  <p className="text-xs text-success leading-relaxed">
                    Excelente! Seus gastos fixos representam {((totalDespesas / (renda || 1)) * 100).toFixed(0)}% da sua renda, o que é muito saudável.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dívidas */}
          <div className={cardBase}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Lightning size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-wider">Aceleração Financeira</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant">Saldo Livre Disponível</span>
                <span className="font-black text-success">R$ {saldoLivre.toLocaleString("pt-BR")}</span>
              </div>
              
              {dividas.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-on-surface-variant">Sugerimos usar 60% do seu saldo livre (<span className="text-on-surface font-bold">R$ {ataqueDividas.toLocaleString('pt-BR')}</span>) para quitar as dívidas abaixo na ordem sugerida:</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                    {dividas
                      .slice()
                      .sort((a, b) => (Number(a?.saldo) || 0) - (Number(b?.saldo) || 0))
                      .map((d, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-surface-low dark:bg-surface-highest border border-default">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-on-surface-disabled">{idx + 1}º</span>
                            <span className="text-sm font-bold text-on-surface-medium">{d.credor}</span>
                          </div>
                          <span className="text-xs font-black text-on-surface">R$ {(Number(d?.saldo) || 0).toLocaleString("pt-BR")}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-info-bg border border-info/20">
                  <p className="text-xs text-info leading-relaxed">
                    Você não possui dívidas ativas! Use seu saldo livre de <span className="font-black">R$ {saldoLivre.toLocaleString('pt-BR')}</span> para acelerar sua reserva ou começar a investir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full mt-10 rounded-[24px] bg-on-surface text-surface-lowest dark:bg-white dark:text-black py-5 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl"
        >
          Finalizar Consultoria
        </button>
      </div>
    </div>
  );
}
