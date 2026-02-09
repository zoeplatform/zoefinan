import { CheckCircle, Warning, WarningCircle } from "phosphor-react";

export default function CategoryBreakdown({ categories }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "ok":
        return <CheckCircle size={20} weight="fill" className="text-green-400" />;
      case "warning":
        return <Warning size={20} weight="fill" className="text-yellow-400" />;
      case "critical":
        return <WarningCircle size={20} weight="fill" className="text-red-400" />;
      default:
        return null;
    }
  };

  const getTextColor = (status) => {
    switch (status) {
      case "ok":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-white/60";
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
        return "bg-white/20";
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-4">Detalhamento por Categoria</h2>
      
      {categories.map((category) => (
        <div
          key={category.name}
          className="bg-white/5 border border-white/10 p-6 rounded-3xl group hover:border-white/20 transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-white/5`}>
                {getStatusIcon(category.status)}
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tight">{category.name}</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
                  Ideal: {category.ideal}% • Atual: {category.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-white tracking-tighter">
                R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
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
