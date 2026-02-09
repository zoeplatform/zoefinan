import { useEffect, useState } from "react";
import BalanceCard from "../components/BalanceCard";
import ActionButtons from "../components/ActionButtons";
import TransactionsList from "../components/TransactionsList";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saldoCalculado, setSaldoCalculado] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Verificação de registros iniciais
            const monthKey = getCurrentMonthKey();
            const hasMonthData = data.historicoMensal && data.historicoMensal[monthKey];
            const hasSetup = data.setupConcluido;

            if (!hasSetup && !hasMonthData) {
              navigate("/setup");
              return;
            }

            setUserData(data);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userData) {
      const monthKey = getCurrentMonthKey();
      const monthData = userData.historicoMensal?.[monthKey];

      if (monthData) {
        const totalRenda = (Number(monthData.rendaBase) || 0) + 
                           (monthData.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);
        
        const totalDespesas = monthData.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
        const totalDividas = monthData.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;
        
        const totalSaidas = totalDespesas + totalDividas;
        setSaldoCalculado(totalRenda - totalSaidas);
      } else {
        // Fallback para dados sincronizados no perfil
        const totalRenda = Number(userData.rendaMensal) || 0;
        const totalDespesas = userData.despesasFixas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
        const totalDividas = userData.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;
        
        setSaldoCalculado(totalRenda - totalDespesas - totalDividas);
      }
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/70" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black pb-24 md:pb-8">
      {/* Background premium (mesma identidade do onboarding) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />

        {/* Orbe animado */}
        <div className="absolute left-1/2 top-[6%] -translate-x-1/2">
          <div className="h-[460px] w-[460px] rounded-full bg-gradient-to-b from-orange-400/55 via-purple-500/45 to-blue-500/45 opacity-70 blur-[2px] animate-orb" />
          <div className="absolute inset-0 rounded-full bg-black/55 blur-2xl" />
        </div>

        {/* linhas suaves */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute left-[-10%] top-[14%] h-[2px] w-[70%] rotate-12 bg-white/20 blur-[0.5px]" />
          <div className="absolute right-[-15%] top-[34%] h-[2px] w-[75%] -rotate-12 bg-white/15 blur-[0.5px]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 px-6 pt-8 max-w-5xl mx-auto">
        {/* Header padronizado */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              ZoeFinan
            </h1>
            <p className="text-sm text-white/60 mt-1">Visão geral</p>
          </div>

          <button
            onClick={() => auth.signOut()}
            className="md:hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur hover:bg-white/10 transition"
          >
            Sair
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            {/* Card principal */}
            <BalanceCard balance={saldoCalculado} />

            {/* Ações */}
            <ActionButtons />
            
            {/* Artigos */}
            <div className="mt-4">
              <button
                onClick={() => navigate("/artigos")}
                className="w-full card-pill border border-white/12 bg-white/5 px-5 py-4 text-left backdrop-blur transition hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      📚 Artigos sobre Saúde Financeira
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Dicas práticas para evoluir seu planejamento
                    </p>
                  </div>
                  <span className="h-10 w-10 grid place-items-center rounded-full border border-white/15 bg-white/10 text-white">
                    →
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Últimos lançamentos */}
            <TransactionsList />
          </div>
        </div>
      </div>
    </div>
  );
}
