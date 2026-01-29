import { useState } from "react";
import { X } from "phosphor-react";

/**
 * Componente de Simulador de Cenários
 * Permite ao usuário visualizar o impacto de reduzir despesas
 */

export default function ScenarioSimulator({
  currentExpense,
  currentIncome,
  onClose,
  expenseName,
}) {
  const [reduction, setReduction] = useState(10);

  const newExpense = currentExpense * (1 - reduction / 100);
  const savedAmount = currentExpense - newExpense;
  const impactPercentage = (savedAmount / currentIncome) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Simulador de Cenários</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Informações Atuais */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Despesa Atual: {expenseName}</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ {currentExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Slider de Redução */}
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Redução</label>
              <span className="text-sm font-semibold text-blue-600">{reduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={reduction}
              onChange={(e) => setReduction(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Resultado da Simulação */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nova Despesa</span>
              <span className="font-semibold text-gray-900">
                R$ {newExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Economia Mensal</span>
              <span className="font-semibold text-green-600">
                R$ {savedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Impacto na Renda</span>
              <span className="font-semibold text-blue-600">+{impactPercentage.toFixed(1)}%</span>
            </div>
          </div>

          {/* Projeção Anual */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Economia Anual Estimada</p>
            <p className="text-2xl font-bold text-blue-900">
              R$ {(savedAmount * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition">
              Aplicar Mudança
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
