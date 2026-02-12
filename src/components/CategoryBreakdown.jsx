import { CheckCircle, Warning, WarningCircle } from "phosphor-react";

export default function CategoryBreakdown({ categories }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return <CheckCircle size={20} weight="fill" className="text-success" />;
      case "warning":
        return <Warning size={20} weight="fill" className="text-warning" />;
      case "critical":
        return <WarningCircle size={20} weight="fill" className="text-error" />;
      default:
        return null;
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case "ok":
        return "text-success";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-error";
      default:
        return "text-on-surface-variant";
    }
  };

  const getBarColor = (status) => {
    switch (status) {
      case "ok":
        return "bg-success";
      case "warning":
        return "bg-warning";
      case "critical":
        return "bg-error";
      default:
        return "bg-surface-highest";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">Detalhamento por Categoria</h2>
      
      {categories.map((category) => (
        <div
          key={category.name}
          className="bg-surface-lowest border border-default p-6 rounded-3xl group hover:border-on-surface/10 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-surface-high dark:bg-surface-highest`}>
                {getStatusIcon(category.status)}
              </div>
              <div>
                <h3 className="text-sm font-black text-on-surface uppercase tracking-tight">{category.name}</h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">
                  Ideal: {category.ideal}% • Atual: {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-on-surface tracking-tighter">
                R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-high dark:bg-surface-highest rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${getBarColor(category.status)}`}
              style={{ width: `${Math.min(category.percentage, 100)}%` }}
            />
          </div>

          {/* Status Message */}
          {category.status !== "ok" && (
            <div className={`mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${getTextColor(category.status)}`}>
               <span>{category.status === "warning" ? "⚠️ ALERTA:" : "🚨 CRÍTICO:"}</span>
               <span className="opacity-80">
                  {((category.percentage - category.ideal) / category.ideal * 100).toFixed(0)}% ACIMA DO LIMITE IDEAL
               </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
