import { CheckCircle, Circle, Warning, Info, TrendUp } from "phosphor-react";

export default function ActionPlan({ actions }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[32px] text-center">
        <Info size={48} className="mx-auto text-white/20 mb-4" />
        <p className="text-white/40 text-sm font-medium">Nenhuma ação recomendada no momento. Continue acompanhando seus gastos!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white mb-6">Plano de Ação Personalizado</h2>
      {actions.map((action) => (
        <div 
          key={action.id} 
          className={`bg-zinc-900/50 p-6 rounded-[32px] border border-white/10 transition-all hover:border-white/20 group`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl ${
              action.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
              action.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'
            }`}>
              {action.priority === 'high' ? <Warning size={24} weight="fill" /> : <TrendUp size={24} weight="bold" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-white text-sm uppercase tracking-tight">{action.title}</h3>
                <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                  action.priority === 'high' ? 'bg-red-500 text-white' : 
                  action.priority === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                }`}>
                  {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-4">
                {action.description}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">
                <Circle size={12} weight="bold" />
                Pendente
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
