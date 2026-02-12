/**
 * PÁGINA: Plano Estratégico
 * DESCRIÇÃO: Apresenta o plano de ação personalizado com base nos dados financeiros do usuário.
 * ---------------------------------------------------------
 */

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Target, Lightning, Warning, Handshake } from "phosphor-react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentMonthKey } from "../utils/dateUtils";
import { getRandomCardColor } from "../utils/themeUtils";

export default function Plano() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cores dinâmicas para os cards de plano (mantemos para uso futuro/acentos)
  const cardColors = useMemo(
    () => ({
      reserva: getRandomCardColor("reserva"),
      controle: getRandomCardColor("controle"),
      aceleracao: getRandomCardColor("aceleracao"),
    }),
    []
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const userRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) setData(docSnap.data());
        else navigate("/setup");
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-app-background flex items-center justify-center text-on-surface-variant">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-on-surface-variant mr-3" />
        Carregando seu plano...
      </div>
    );
  }

  /*
     LÓGICA DE CÁLCULO: Processamento dos dados para o plano
     -------------------------------------------------------
  */
  const currentMonth = getCurrentMonthKey();
  const monthData = data?.historicoMensal?.[currentMonth];

  const rendaBaseMes = Number(monthData?.rendaBase) || 0;
  const rendasExtrasMes =
    monthData?.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
  const renda = (rendaBaseMes + rendasExtrasMes) || Number(data?.rendaMensal) || 0;

  const despesas =
    monthData?.despesas && monthData.despesas.length > 0 ? monthData.despesas : data?.despesasFixas || [];

  const dividas =
    monthData?.dividas && monthData.dividas.length > 0 ? monthData.dividas : data?.dividas || [];

  // Categorias de sobrevivência
  const categoriasSobrevivencia = ["alimentação", "moradia", "água", "luz", "aluguel", "energia", "internet"];

  const despesasSobrevivencia = despesas
    .filter((d) => categoriasSobrevivencia.some((cat) => d.descricao?.toLowerCase().includes(cat)))
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const totalDespesas = despesas.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
  const outrasDespesas = Math.max(totalDespesas - despesasSobrevivencia, 0);

  // Dívidas e parcelas
  const totalParcelas = dividas.reduce((acc, d) => acc + (Number(d.parcela) || 0), 0);

  // Saldo após sobreviver
  const saldoAposSobrevivencia = renda - despesasSobrevivencia;

  // Sugestão reserva mensal (exemplo: 10% do que sobrar, mínimo 50)
  const sugestaoReservaMensal = Math.max(Math.floor((saldoAposSobrevivencia * 0.1) / 10) * 10, 50);

  // Ataque às dívidas (saldo livre após sobreviver e parcelas)
  const ataqueDividas = Math.max(saldoAposSobrevivencia - totalParcelas - outrasDespesas, 0);

  // Dívidas não parceladas (se houver "saldo")
  const dividasNaoParceladas = dividas.filter((d) => Number(d.saldo) > 0 && !Number(d.parcela));

  return (
    <div className="min-h-screen bg-app-background px-6 pt-8 pb-32 md:pb-8 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate("/home")}
            className="h-12 w-12 rounded-2xl bg-surface-high border border-default flex items-center justify-center hover:bg-surface-highest transition"
          >
            <ArrowLeft size={20} className="text-on-surface" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-on-surface tracking-tight uppercase">Plano Estratégico</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">
              Foco em Quitação e Sobrevivência
            </p>
          </div>
        </div>

        {/* ALERTA DE ORÇAMENTO BAIXO */}
        {saldoAposSobrevivencia < outrasDespesas + totalParcelas && (
          <div className="mb-8 p-6 rounded-[32px] bg-error-bg border border-error/20 flex items-start gap-4 animate-pulse">
            <Warning size={32} className="text-error shrink-0" weight="fill" />
            <div>
              <h4 className="text-sm font-black text-error uppercase tracking-tight">Alerta de Orçamento Crítico</h4>
              <p className="text-xs text-error/80 mt-1 leading-relaxed">
                Sua renda atual mal cobre as despesas de sobrevivência e parcelas.{" "}
                <strong>Não utilize seu saldo de alimentação/moradia para pagar dívidas totais agora.</strong> Foque em
                renegociar o que não está parcelado.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: Reserva de Segurança */}
          <div
            className={`rounded-[32px] border border-default p-8 shadow-xl dark:shadow-none h-full transition-all duration-300 
            card-plan bg-surface-high dark:bg-surface-high`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-info-bg border border-info/20 flex items-center justify-center text-info dark:bg-white/10 dark:border-white/10 dark:text-white">
                  <ShieldCheck size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface dark:text-on-surface uppercase tracking-wider">
                  Segurança
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-highest dark:bg-surface-highest p-4 rounded-2xl border border-default">
                <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant uppercase font-black mb-1">
                  Custo de Sobrevivência
                </p>
                <p className="text-lg font-black text-on-surface dark:text-on-surface">
                  R$ {(despesasSobrevivencia || 0).toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="bg-surface-highest dark:bg-surface-highest p-4 rounded-2xl border border-default">
                <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant uppercase font-black mb-1">
                  Aporte Sugerido
                </p>
                <p className="text-lg font-black text-on-surface dark:text-success">
                  R$ {(sugestaoReservaMensal || 0).toLocaleString("pt-BR")}
                </p>
              </div>

              <p className="text-xs text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                Priorize manter R$ {(despesasSobrevivencia || 0).toLocaleString("pt-BR")} intocáveis para o básico.
              </p>
            </div>
          </div>

          {/* CARD 2: Otimização */}
          <div
            className={`rounded-[32px] border border-default p-8 shadow-xl dark:shadow-none h-full transition-all duration-300 
            card-plan bg-surface-high dark:bg-surface-high`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning-bg border border-warning/20 flex items-center justify-center text-warning dark:bg-white/10 dark:border-white/10 dark:text-white">
                  <Target size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface dark:text-on-surface uppercase tracking-wider">
                  Otimização
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant dark:text-on-surface-variant">Outras Despesas</span>
                <span className="font-bold text-on-surface dark:text-on-surface">
                  R$ {(outrasDespesas || 0).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="w-full bg-surface-highest dark:bg-surface-highest h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    outrasDespesas > renda * 0.2 ? "bg-red-400" : "bg-green-400"
                  }`}
                  style={{ width: `${Math.min((outrasDespesas / (renda || 1)) * 100, 100)}%` }}
                />
              </div>

              <p className="text-xs text-on-surface-variant dark:text-on-surface-variant leading-relaxed">
                Tente manter gastos não essenciais abaixo de 20% da renda para sobrar para as dívidas.
              </p>
            </div>
          </div>

          {/* CARD 3: Aceleração (Dívidas) */}
          <div
            className={`rounded-[32px] border border-default p-8 shadow-xl dark:shadow-none h-full transition-all duration-300 
            card-plan bg-surface-high dark:bg-surface-high`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary dark:bg-white/10 dark:border-white/10 dark:text-white">
                  <Lightning size={24} weight="duotone" />
                </div>
                <h3 className="text-sm font-black text-on-surface dark:text-on-surface uppercase tracking-wider">
                  Quitação
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant dark:text-on-surface-variant">Saldo para Ataque</span>
                <span className="font-black text-on-surface dark:text-success">
                  R$ {(ataqueDividas || 0).toLocaleString("pt-BR")}
                </span>
              </div>

              {dividas.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-[200px] overflow-y-auto no-scrollbar">
                    {dividasNaoParceladas.map((d, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-error-bg/20 border border-error/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-error uppercase">Renegociar</span>
                          <Handshake size={16} className="text-error" />
                        </div>
                        <p className="text-sm font-bold text-on-surface dark:text-on-surface">{d.credor}</p>
                        <p className="text-[10px] text-on-surface-variant dark:text-on-surface-variant mt-1">
                          Esta dívida não está parcelada. Entre em contato para transformar o saldo de R${" "}
                          {(d.saldo || 0).toLocaleString("pt-BR")} em parcelas que caibam no seu saldo livre.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant dark:text-on-surface-variant">
                  Você não possui dívidas ativas para atacar no momento. Parabéns!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* BOTÃO DE AÇÃO */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/lancamentos")}
            className="w-full bg-on-surface text-surface-lowest dark:bg-white dark:text-black py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[0.99] transition-all active:scale-95"
          >
            Atualizar Meus Lançamentos
          </button>
        </div>
      </div>
    </div>
  );
}
