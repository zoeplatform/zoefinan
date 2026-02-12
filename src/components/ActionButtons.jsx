/**
 * COMPONENTE: ActionButtons
 * DESCRIÇÃO: Grade de botões de ação rápida para as principais funcionalidades.
 * ---------------------------------------------------------
 */

import { Plus, ChartLine, CreditCard, Receipt } from "phosphor-react";
import { useNavigate } from "react-router-dom";
import { getRandomCardColor } from "../utils/themeUtils";
import { useMemo } from "react";

/**
 * Sub-componente para cada botão individual
 */
function ActionButton({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[24px] border border-default p-5 shadow-md dark:shadow-none backdrop-blur-xl transition-all duration-300 group
        ${color ? `dark:bg-surface-high ${color.bg}` : 'bg-surface-low dark:bg-surface-high hover:bg-surface dark:hover:bg-surface-highest'}`}
    >
      <div className="flex items-center gap-4">
        {/* ÍCONE: Container com destaque visual */}
        <div className={`h-12 w-12 rounded-2xl border border-default grid place-items-center group-hover:scale-110 transition-transform
          ${color ? 'bg-white/20 text-white dark:bg-surface-highest dark:text-on-surface' : 'bg-surface dark:bg-surface-highest text-on-surface'}`}>
          {icon}
        </div>
        
        {/* TEXTO: Rótulo e ação */}
        <div className="text-left">
          <p className={`text-xs font-black uppercase tracking-tight 
            ${color ? 'text-white dark:text-on-surface' : 'text-on-surface'}`}>
            {label}
          </p>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 
            ${color ? 'text-white/70 dark:text-on-surface-variant' : 'text-on-surface-variant'}`}>
            Acessar
          </p>
        </div>
      </div>
    </button>
  );
}

export default function ActionButtons() {
  const navigate = useNavigate();

  // Gera cores dinâmicas para cada botão para dar "ânimo" à aplicação
  const colors = useMemo(() => ({
    despesas: getRandomCardColor("despesas"),
    dividas: getRandomCardColor("dividas"),
    diagnostico: getRandomCardColor("diagnostico"),
    lancamentos: getRandomCardColor("lancamentos"),
  }), []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
      {/* BOTÃO: Despesas Fixas */}
      <ActionButton
        onClick={() => navigate("/despesas")}
        icon={<Receipt size={22} weight="bold" />}
        label="Despesas Fixas"
        color={colors.despesas}
      />
      
      {/* BOTÃO: Minhas Dívidas */}
      <ActionButton
        onClick={() => navigate("/dividas")}
        icon={<CreditCard size={22} weight="bold" />}
        label="Minhas Dívidas"
        color={colors.dividas}
      />
      
      {/* BOTÃO: Diagnóstico Financeiro */}
      <ActionButton
        onClick={() => navigate("/diagnostico")}
        icon={<ChartLine size={22} weight="bold" />}
        label="Diagnóstico"
        color={colors.diagnostico}
      />
      
      {/* BOTÃO: Novo Lançamento */}
      <ActionButton
        onClick={() => navigate("/lancamentos")}
        icon={<Plus size={22} weight="bold" />}
        label="Novo Lançamento"
        color={colors.lancamentos}
      />
    </div>
  );
}
