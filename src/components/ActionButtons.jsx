import { Plus, ChartLine, CreditCard, Receipt } from "phosphor-react";
import { useNavigate } from "react-router-dom";

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-[24px] border border-default bg-surface-lowest dark:bg-surface-high p-5 shadow-md dark:shadow-none backdrop-blur-xl transition-all duration-300 hover:bg-surface-low dark:hover:bg-surface-highest group"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-surface-high dark:bg-surface-highest border border-default grid place-items-center text-on-surface group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-xs font-black text-on-surface uppercase tracking-tight">{label}</p>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Acessar</p>
        </div>
      </div>
    </button>
  );
}

export default function ActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      <ActionButton
        onClick={() => navigate("/despesas")}
        icon={<Receipt size={22} weight="bold" />}
        label="Despesas Fixas"
      />
      <ActionButton
        onClick={() => navigate("/dividas")}
        icon={<CreditCard size={22} weight="bold" />}
        label="Minhas Dívidas"
      />
      <ActionButton
        onClick={() => navigate("/diagnostico")}
        icon={<ChartLine size={22} weight="bold" />}
        label="Diagnóstico"
      />
      <ActionButton
        onClick={() => navigate("/lancamentos")}
        icon={<Plus size={22} weight="bold" />}
        label="Novo Lançamento"
      />
    </div>
  );
}
