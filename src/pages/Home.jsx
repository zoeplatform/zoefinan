/**
 * PÁGINA: Home (Início)
 * DESCRIÇÃO: Dashboard principal com resumo de saldo, ações rápidas e últimos lançamentos.
 * ---------------------------------------------------------
 */

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
        const totalRenda =
          (Number(monthData.rendaBase) || 0) +
          (monthData.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);

        const totalDespesas = monthData.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
        const totalDividas = monthData.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;

        setSaldoCalculado(totalRenda - (totalDespesas + totalDividas));
      } else {
        const totalRenda = Number(userData.rendaMensal) || 0;
        const totalDespesas =
          userData.despesasFixas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
        const totalDividas =
          userData.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;

        setSaldoCalculado(totalRenda - totalDespesas - totalDividas);
      }
    }
  }, [userData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-app-background pb-24 md:pb-8 transition-colors duration-300">
      {/* BACKGROUND: Elementos visuais premium (apenas no escuro) */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />

        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[-10%] top-[14%] h-[2px] w-[70%] rotate-12 bg-white/10 blur-[0.5px]" />
          <div className="absolute right-[-15%] top-[34%] h-[2px] w-[75%] -rotate-12 bg-white/10 blur-[0.5px]" />
        </div>
      </div>

      <div className="relative z-10 px-6 pt-8 max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-on-surface uppercase">ZoeFinan</h1>
            <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">
              Visão geral da conta
            </p>
          </div>

          <button
            onClick={() => auth.signOut()}
            className="md:hidden rounded-2xl border border-default bg-surface-low px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-on-surface-medium backdrop-blur hover:bg-surface-high transition shadow-sm dark:shadow-none"
          >
            Sair
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-8">
            <BalanceCard balance={saldoCalculado} />
            <ActionButtons />

            <div className="mt-4">
              <button
                onClick={() => navigate("/artigos")}
                className="w-full rounded-[24px] border border-default card-home px-6 py-6 text-left transition hover:opacity-90 shadow-md dark:shadow-none group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-on-surface uppercase tracking-tight">📚 Saúde Financeira</p>
                    <p className="text-xs text-on-surface-variant mt-1 font-medium">
                      Dicas práticas para evoluir seu planejamento
                    </p>
                  </div>
                  <span className="h-12 w-12 grid place-items-center rounded-2xl border border-default bg-white/20 dark:bg-surface text-on-surface group-hover:scale-110 transition-transform">
                    →
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <TransactionsList />
          </div>
        </div>
      </div>
    </div>
  );
}
