import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Receipt, CreditCard, TrendUp } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
              // Fallback para dados fixos se não houver histórico do mês atual
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
      <p className="text-center text-white/60 text-sm py-6">
        Carregando lançamentos...
      </p>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Últimos Lançamentos
      </h3>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="card-pill border border-dashed border-white/15 bg-white/5 p-5 text-center backdrop-blur">
            <p className="text-sm text-white/70">Nenhum lançamento encontrado.</p>
            <p className="text-xs text-white/50 mt-1">
              Adicione despesas ou dívidas para ver seu histórico aqui.
            </p>
          </div>
        ) : (
          transactions.map((t) => (
            <div
              key={t.id ?? `${t.tipo}-${t.descricao}-${t.valor}`}
              className="flex justify-between items-center card-pill border border-white/12 bg-zinc-900/70 p-4 shadow-sm backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <div className={`h-11 w-11 rounded-xl border border-white/10 bg-white/5 grid place-items-center ${t.tipo === 'renda' ? 'text-green-400' : 'text-white'}`}>
                  {t.tipo === "despesa" ? <Receipt size={20} /> : t.tipo === "divida" ? <CreditCard size={20} /> : <TrendUp size={20} />}
                </div>

                <div>
                  <p className="font-semibold text-sm text-white">
                    {t.descricao}
                  </p>
                  <p className="text-[10px] text-white/55 uppercase tracking-wide">
                    {t.tipo === "despesa" ? "Despesa" : t.tipo === "divida" ? "Parcela de Dívida" : "Renda Extra"}
                  </p>
                </div>
              </div>

              <span className={`font-semibold text-sm ${t.tipo === 'renda' ? 'text-green-400' : 'text-red-300'}`}>
                {t.tipo === 'renda' ? '+' : '-'} R$ {Number(t.valor || 0).toLocaleString("pt-BR")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
