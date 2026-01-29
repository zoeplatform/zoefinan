// OBS: o pacote `phosphor-react` (v1.x) não exporta `AlertCircle`.
// Para o estado "critical" usamos `WarningCircle` (ícone semelhante).
import { CheckCircle, Warning, WarningCircle } from "phosphor-react";

/**
 * Componente de Detalhamento de Categorias
 * Mostra quais categorias estão dentro ou fora do orçamento ideal
 */

export default function CategoryBreakdown({ categories, totalIncome }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return <CheckCircle size={20} className="text-green-400" />;
      case "warning":
        return <Warning size={20} className="text-yellow-400" />;
      case "critical":
        return <WarningCircle size={20} className="text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ok":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "critical":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case "ok":
        return "text-green-700";
      case "warning":
        return "text-yellow-700";
      case "critical":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case "ok":
        return "bg-green-400";
      case "warning":
        return "bg-yellow-400";
      case "critical":
        return "bg-red-400";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">Detalhamento</h2>
      
      {categories.map((category) => (
        <div
          key={category.name}
          className={`p-4 border border-white/10 rounded-2xl bg-white/5 mb-3`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {getStatusIcon(category.status)}
              <div>
                <h3 className="font-medium text-white">{category.name}</h3>
                <p className="text-sm text-white/60">
                  Ideal: {category.ideal}% | Atual: {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <span className="text-lg font-semibold text-white">
              R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${getBarColor(category.status)}`}
              style={{ width: `${Math.min(category.percentage, 100)}%` }}
            />
          </div>

          {/* Status Message */}
          {category.status !== "ok" && (
            <div className={`mt-3 text-sm ${getTextColor(category.status)}`}>
              {category.status === "warning" && (
                <p>⚠️ Esta categoria está {((category.percentage - category.ideal) / category.ideal * 100).toFixed(0)}% acima do ideal.</p>
              )}
              {category.status === "critical" && (
                <p>🚨 Esta categoria está {((category.percentage - category.ideal) / category.ideal * 100).toFixed(0)}% acima do ideal. Ação urgente recomendada.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
