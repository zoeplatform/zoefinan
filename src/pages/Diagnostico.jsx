import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft } from "phosphor-react";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import ScenarioSimulator from "../components/ScenarioSimulator";
import CategoryBreakdown from "../components/CategoryBreakdown";
import ActionPlan from "../components/ActionPlan";
import { calculateFinancialHealth } from "../utils/financeLogic";
import { getCurrentMonthKey } from "../utils/dateUtils";

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
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Lógica de Unificação: Priorizar dados do Controle Mensal (historicoMensal)
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
  const percentualComprometido = renda > 0 ? (comprometido / renda) * 100 : 0;

  // Score e Status de saúde
  const health = calculateFinancialHealth(renda, comprometido);
  const score = health?.score || 0;
  const status = {
    label: health?.status || "Dados insuficientes",
    color: health?.color || "text-gray-600",
    bgColor: (health?.color || "text-gray-600").replace('text', 'bg').replace('600', '50'),
    icon: health?.icon || "⚪",
    recomendacao: health?.recomendacao || "Adicione seus lançamentos no Controle Mensal para gerar seu diagnóstico."
  };

  // GERAÇÃO DINÂMICA DO PLANO DE AÇÃO
  const dynamicActions = [];
  
  if (renda === 0) {
    dynamicActions.push({
      id: "action-renda",
      title: "Defina sua Renda",
      description: "Para gerar um plano preciso, precisamos saber quanto você ganha. Adicione sua renda base no Controle Mensal.",
      priority: "high"
    });
  }

  if (totalParcelas / renda > 0.2) {
    dynamicActions.push({
      id: "action-dividas",
      title: "Reduzir Comprometimento com Dívidas",
      description: `Suas dívidas consomem ${( (totalParcelas / renda) * 100).toFixed(1)}% da sua renda. O ideal é ficar abaixo de 20%. Considere renegociar o saldo de R$ ${dividas.reduce((acc, curr) => acc + (Number(curr.saldo) || 0), 0).toLocaleString('pt-BR')}.`,
      priority: "high"
    });
  }

  if (totalDespesas / renda > 0.5) {
    dynamicActions.push({
      id: "action-despesas",
      title: "Cortar Gastos Supérfluos",
      description: `Suas despesas fixas estão em R$ ${totalDespesas.toLocaleString('pt-BR')}, representando ${( (totalDespesas / renda) * 100).toFixed(1)}% da sua renda. Tente reduzir 10% desse valor para ganhar fôlego.`,
      priority: "high"
    });
  }

  if (saldoLivre > 0) {
    const metaReserva = renda * 0.1;
    dynamicActions.push({
      id: "action-reserva",
      title: "Construir Reserva de Emergência",
      description: `Você tem um saldo livre de R$ ${saldoLivre.toLocaleString('pt-BR')}. Sugerimos separar R$ ${metaReserva.toLocaleString('pt-BR')} (10% da renda) este mês para sua segurança.`,
      priority: "medium"
    });
  }

  if (dynamicActions.length < 3 && renda > 0) {
    dynamicActions.push({
      id: "action-investir",
      title: "Planejar Investimentos",
      description: "Sua saúde financeira está estável. É o momento ideal para começar a estudar ativos que façam seu dinheiro trabalhar por você.",
      priority: "low"
    });
  }

  // Dados para gráfico
  const pieData = [
    { name: "Comprometido", value: comprometido || 0.1, fill: "#2563eb" },
    { name: "Livre", value: Math.max(saldoLivre, 0) || 0.1, fill: "#e5e7eb" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Diagnóstico Financeiro</h1>
            <p className="text-gray-600">Análise baseada nos seus lançamentos de {currentMonth}</p>
          </div>
        </div>

        {/* Score Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-sm flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none" stroke="#2563eb" strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 339.3} 339.3`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{score}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
            </div>
            <h3 className={`text-lg font-semibold ${status.color}`}>
              {status.icon} {status.label}
            </h3>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumo Financeiro</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Renda (Base + Extras)</span>
                <span className="text-lg font-semibold text-gray-900">R$ {renda.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Total de Saídas</span>
                <span className="text-lg font-semibold text-red-600">R$ {comprometido.toLocaleString("pt-BR")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Saldo Livre</span>
                <span className="text-lg font-semibold text-green-600">R$ {Math.max(saldoLivre, 0).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {["overview", "categories", "actions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab === "overview" ? "Visão Geral" : tab === "categories" ? "Categorias" : "Plano de Ação"}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Distribuição de Renda</h2>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-blue-800 text-sm leading-relaxed">
                  <strong>Recomendação:</strong> {status.recomendacao}
                </p>
              </div>
            </div>
          )}
          {activeTab === "categories" && <CategoryBreakdown categories={[
            { name: "Despesas", amount: totalDespesas, percentage: renda > 0 ? (totalDespesas / renda) * 100 : 0, ideal: 50 },
            { name: "Dívidas", amount: totalParcelas, percentage: renda > 0 ? (totalParcelas / renda) * 100 : 0, ideal: 20 }
          ]} />}
          {activeTab === "actions" && <ActionPlan actions={dynamicActions} />}
        </div>

        <div className="mt-8">
          <button
            onClick={() => navigate("/plano")}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
          >
            Ver Plano Detalhado
          </button>
        </div>
      </div>
    </div>
  );
}
