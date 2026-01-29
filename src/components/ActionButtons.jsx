import { Plus, ChartLine, CreditCard, Receipt } from "phosphor-react";
import { useNavigate } from "react-router-dom";

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="card-pill border border-white/12 bg-zinc-900/70 p-4 shadow-sm backdrop-blur transition hover:bg-zinc-900/90"
    >
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-gradient-to-br from-orange-400/60 via-purple-500/50 to-blue-500/50 border border-white/10 grid place-items-center text-white">
          {icon}
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="text-xs text-white/55 mt-0.5">Acessar</p>
        </div>
      </div>
    </button>
  );
}

export default function ActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 gap-3 my-4">
      <ActionButton
        onClick={() => navigate("/despesas")}
        icon={<Receipt size={20} />}
        label="Despesas Fixas"
      />
      <ActionButton
        onClick={() => navigate("/dividas")}
        icon={<CreditCard size={20} />}
        label="Dívidas"
      />
      <ActionButton
        onClick={() => navigate("/diagnostico")}
        icon={<ChartLine size={20} />}
        label="Diagnóstico"
      />

      <ActionButton
        onClick={() => navigate("/lancamentos")}
        icon={<Receipt size={20} />}
        label="Controle Mensal"
      />
    </div>
  );
}