import { CheckCircle, Circle, Warning, Info, TrendUp } from "phosphor-react";

export default function ActionPlan({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
        <Info size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Nenhuma ação recomendada no momento. Continue acompanhando seus gastos!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Seu Plano de Ação Personalizado</h2>
      {actions.map((action) => (
        <div 
          key={action.id} 
          className={`bg-white p-5 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md ${
            action.priority === 'high' ? 'border-red-500' : 
            action.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`mt-1 ${
              action.priority === 'high' ? 'text-red-500' : 
              action.priority === 'medium' ? 'text-yellow-600' : 'text-blue-500'
            }`}>
              {action.priority === 'high' ? <Warning size={24} weight="fill" /> : <TrendUp size={24} weight="bold" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900">{action.title}</h3>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${
                  action.priority === 'high' ? 'bg-red-100 text-red-700' : 
                  action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  Prioridade {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {action.description}
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                <Circle size={14} />
                Pendente
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
