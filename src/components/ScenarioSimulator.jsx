import { useState } from "react";
import { X } from "phosphor-react";

export default function ScenarioSimulator({
  currentExpense,
  currentIncome,
  onClose,
  expenseName,
}) {
  const [reduction, setReduction] = useState(10);

  const newExpense = currentExpense * (1 - reduction / 100);
  const savedAmount = currentExpense - newExpense;
  const impactPercentage = currentIncome > 0 ? (savedAmount / currentIncome) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md p-8 bg-surface-lowest border border-default rounded-[40px] shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-black uppercase tracking-tight text-on-surface">Simulador</h2>
          <button onClick={onClose} className="p-2 bg-surface-high dark:bg-surface-highest rounded-full text-on-surface-variant hover:text-on-surface transition-colors">
            <X size={20} weight="bold" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Informações Atuais */}
          <div className="bg-surface-low dark:bg-surface-high border border-default p-6 rounded-3xl">
            <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest mb-2">Despesa Atual: {expenseName}</p>
            <p className="text-3xl font-black text-on-surface tracking-tighter">
              R$ {currentExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Slider de Redução */}
          <div>
            <div className="flex justify-between mb-4">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Redução Desejada</label>
              <span className="text-sm font-black text-info">{reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={reduction}
              onChange={(e) => setReduction(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-high dark:bg-surface-highest rounded-lg appearance-none cursor-pointer accent-info"
            />
          </div>

          {/* Resultado da Simulação */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-bold">Nova Despesa</span>
              <span className="text-sm font-black text-on-surface">
                R$ {newExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-bold">Economia Mensal</span>
              <span className="text-sm font-black text-success">
                R$ {savedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant font-bold">Impacto na Renda</span>
              <span className="text-sm font-black text-info">+{impactPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Projeção Anual */}
          <div className="bg-info-bg p-6 rounded-3xl border border-info/20">
            <p className="text-[10px] text-info font-black uppercase tracking-widest mb-1">Economia Anual Estimada</p>
            <p className="text-3xl font-black text-on-surface tracking-tighter">
              R$ {(savedAmount * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-surface-high dark:bg-surface-highest text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-surface-highest transition-all"
            >
              Fechar
            </button>
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-on-surface text-surface-lowest text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-[0.98] transition-all active:scale-95"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
