import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Target, Lightning, ListChecks } from "phosphor-react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Plano() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) setData(docSnap.data());
        } catch (error) {
          console.error("Erro ao buscar plano:", error);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white/70">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white/30 mr-3" />
        Carregando seu plano...
      </div>
    );
  }

  // Lógica de Dados Dinâmicos (Mesma do Diagnóstico)
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

  // Reserva de emergência (Meta: 6 meses de despesas fixas)
  const metaReserva = totalDespesas * 6;
  const sugestaoReservaMensal = renda > 0 ? renda * 0.15 : 0; // Sugere 15% da renda

  // Corte de gastos
  const limiteGastos = renda * 0.5;
  const excessoGastos = totalDespesas > limiteGastos ? totalDespesas - limiteGastos : 0;

  // Ataque às dívidas
  const ataqueDividas = saldoLivre > 0 ? saldoLivre * 0.6 : 0;

  const cardBase = "rounded-3xl bg-zinc-900/60 border border-white/10 p-6 backdrop-blur-md shadow-xl";

  return (
    <div className="min-h-screen bg-black px-6 pt-8 pb-32 relative overflow-hidden">
      {/* Background Premium */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[10%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-b from-orange-500/20 via-purple-500/15 to-blue-500/15 blur-[100px] opacity-40" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">Plano Estratégico</h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Personalizado para {currentMonth}</p>
          </div>
        </div>

        {/* Reserva de Emergência */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <ShieldCheck size={24} weight="duotone" />
              </div>
              <h3 className="text-sm font-black text-white/90 uppercase tracking-wider">Reserva de Segurança</h3>
            </div>
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase">Meta 6 Meses</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase font-black mb-1">Meta Total</p>
              <p className="text-lg font-black text-white">R$ {metaReserva.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <p className="text-[10px] text-white/30 uppercase font-black mb-1">Aporte Mensal</p>
              <p className="text-lg font-black text-green-400">R$ {sugestaoReservaMensal.toLocaleString("pt-BR")}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/50 leading-relaxed">
            Com base em suas despesas de R$ {totalDespesas.toLocaleString('pt-BR')}, sua meta é ter 6 meses de cobertura para imprevistos.
          </p>
        </div>

        {/* Controle de Gastos */}
        <div className={cardBase}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Target size={24} weight="duotone" />
              </div>
              <h3 className="text-sm font-black text-white/90 uppercase tracking-wider">Otimização de Gastos</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Total de Despesas Fixas</span>
              <span className="font-bold text-white">R$ {totalDespesas.toLocaleString("pt-BR")}</span>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${excessoGastos > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min((totalDespesas / (renda || 1)) * 100, 100)}%` }}
              />
            </div>
            {excessoGastos > 0 ? (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs text-red-200 leading-relaxed">
                  Você está acima do limite ideal de 50%. Tente reduzir <span className="font-black">R$ {excessoGastos.toLocaleString("pt-BR")}</span> em gastos não essenciais.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-green-200 leading-relaxed">
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
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lightning size={24} weight="duotone" />
              </div>
              <h3 className="text-sm font-black text-white/90 uppercase tracking-wider">Aceleração Financeira</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/50">Saldo Livre Disponível</span>
              <span className="font-black text-green-400">R$ {saldoLivre.toLocaleString("pt-BR")}</span>
            </div>
            
            {dividas.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-white/50">Sugerimos usar 60% do seu saldo livre (<span className="text-white font-bold">R$ {ataqueDividas.toLocaleString('pt-BR')}</span>) para quitar as dívidas abaixo na ordem sugerida:</p>
                <div className="space-y-2">
                  {dividas
                    .slice()
                    .sort((a, b) => (Number(a?.saldo) || 0) - (Number(b?.saldo) || 0))
                    .map((d, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-white/20">{idx + 1}º</span>
                          <span className="text-sm font-bold text-white/80">{d.credor}</span>
                        </div>
                        <span className="text-xs font-black text-white">R$ {(Number(d?.saldo) || 0).toLocaleString("pt-BR")}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-200 leading-relaxed">
                  Você não possui dívidas ativas! Use seu saldo livre de <span className="font-black">R$ {saldoLivre.toLocaleString('pt-BR')}</span> para acelerar sua reserva ou começar a investir.
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full rounded-3xl bg-white text-black py-5 font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-white/5"
        >
          Finalizar Consultoria
        </button>
      </div>
    </div>
  );
}
