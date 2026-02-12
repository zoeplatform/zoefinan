/**
 * COMPONENTE: BalanceCard
 * DESCRIÇÃO: Exibe o saldo principal do usuário com destaque visual.
 * ---------------------------------------------------------
 */

import { getRandomCardColor } from "../utils/themeUtils";
import { useMemo } from "react";

export default function BalanceCard({ balance }) {
  // Formatação de moeda brasileira
  const formattedBalance =
    balance !== undefined
      ? balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  const isNegative = typeof balance === "number" && balance < 0;

  // Seleciona uma cor dinâmica baseada no saldo para manter consistência
  const dynamicColor = useMemo(() => getRandomCardColor("balance"), []);

  return (
    <div className={`relative overflow-hidden rounded-[32px] border border-default p-8 shadow-xl dark:shadow-none backdrop-blur-xl transition-all duration-300 
      ${isNegative ? 'bg-surface-low dark:bg-surface-high' : `dark:bg-surface-high ${dynamicColor.bg}`}`}>
      
      {/* 
          DECORAÇÃO: Linha de destaque premium no topo.
          Aparece apenas se não for negativo ou se estiver no modo dark.
      */}
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 opacity-90 
        ${!isNegative ? 'dark:block hidden' : 'block'}`} />

      {/* STATUS: Indicador visual de saúde financeira */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-2 w-2 rounded-full ${isNegative ? 'bg-error animate-pulse' : (isNegative ? 'bg-success' : 'bg-white/80 dark:bg-success')}`} />
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] 
          ${isNegative ? 'text-on-surface-variant' : 'text-white/80 dark:text-on-surface-variant'}`}>
          Saldo livre estimado
        </p>
      </div>

      {/* VALOR: O saldo principal */}
      <h3 className={`text-4xl font-black tracking-tighter transition-colors
        ${isNegative ? "text-error" : "text-white dark:text-on-surface"}`}>
        {formattedBalance}
      </h3>

      {/* RODAPÉ: Informação de contexto */}
      <div className={`mt-6 pt-6 border-t ${isNegative ? 'border-default' : 'border-white/20 dark:border-default'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest
          ${isNegative ? 'text-on-surface-disabled' : 'text-white/60 dark:text-on-surface-disabled'}`}>
          Baseado em sua renda e despesas fixas do mês
        </p>
      </div>

      {/* DECORAÇÃO: Orbe de fundo sutil */}
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-black/10 dark:bg-on-surface/5 blur-3xl" />
    </div>
  );
}
