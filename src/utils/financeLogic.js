/**
 * Lógica de Saúde Financeira Não Progressiva (Revisada)
 * 
 * Premissa Corrigida:
 * - Quem ganha menos: Parâmetros MENOS rigorosos. Gastos básicos consomem a maior parte da renda (sobrevivência).
 *   Comprometimento de 70-80% pode ser a realidade mínima de sobrevivência.
 * - Quem ganha mais: Parâmetros MAIS rigorosos. Com uma renda maior, o potencial de sobra deve ser maior,
 *   logo o limite de comprometimento aceitável é menor (ex: 50%).
 */

export const calculateFinancialHealth = (renda, comprometido) => {
  if (renda <= 0) return { score: 0, status: "Dados insuficientes" };

  const percentual = (comprometido / renda) * 100;
  
  // Se não houver comprometimento, a saúde é perfeita
  if (comprometido === 0 && renda > 0) {
    return { 
      score: 100, 
      status: "Excelente", 
      color: "text-green-600", 
      icon: "💎", 
      recomendacao: "Sua saúde financeira está impecável! Sem dívidas ou despesas registradas, você tem total liberdade para investir.",
      percentual: 0 
    };
  }

  let score = 100;
  let status = "Saudável";
  let color = "text-green-600";
  let icon = "🟢";
  let recomendacao = "";

  if (renda < 3000) {
    // Renda Baixa: Limites flexíveis (Realidade de sobrevivência)
    if (percentual > 90) {
      score = 30;
      status = "Crítico";
      color = "text-red-600";
      icon = "🔴";
      recomendacao = "Seu comprometimento está altíssimo, ultrapassando 90%. Mesmo para gastos básicos, tente buscar auxílios ou rendas extras para não entrar no vermelho.";
    } else if (percentual > 75) {
      score = 60;
      status = "Atenção";
      color = "text-yellow-600";
      icon = "🟡";
      recomendacao = "Você está na faixa de sobrevivência (75-90%). É uma situação comum para sua renda, mas tente manter uma pequena reserva se possível.";
    } else {
      score = 95;
      recomendacao = "Excelente! Você está conseguindo manter seus gastos abaixo de 75% da sua renda, o que é um ótimo sinal de controle básico.";
    }
  } else if (renda <= 8000) {
    // Renda Média
    if (percentual > 75) {
      score = 30;
      status = "Crítico";
      color = "text-red-600";
      icon = "🔴";
      recomendacao = "Para sua faixa de renda, 75% de comprometimento já é considerado crítico. Reavalie gastos não essenciais.";
    } else if (percentual > 60) {
      score = 55;
      status = "Atenção";
      color = "text-yellow-600";
      icon = "🟡";
      recomendacao = "Atenção. Seu comprometimento está entre 60% e 75%. Tente reduzir para abrir espaço para investimentos.";
    } else {
      score = 90;
      recomendacao = "Bom controle financeiro. Você tem uma margem saudável para o seu nível de renda.";
    }
  } else {
    // Renda Alta: Limites rigorosos (Foco em construção de patrimônio)
    if (percentual > 65) {
      score = 25;
      status = "Crítico";
      color = "text-red-600";
      icon = "🔴";
      recomendacao = "Atenção! Com sua renda, ter mais de 65% comprometido indica um padrão de vida que pode estar sufocando sua capacidade de investir.";
    } else if (percentual > 50) {
      score = 50;
      status = "Atenção";
      color = "text-yellow-600";
      icon = "🟡";
      recomendacao = "Cuidado. Você está gastando mais de 50% da sua renda. Para o seu perfil, o ideal é que a sobra seja maior para acelerar seus planos.";
    } else {
      score = 100;
      recomendacao = "Parabéns! Sua saúde financeira está excelente. Você mantém gastos sob controle e tem alta capacidade de investimento.";
    }
  }

  return { score, status, color, icon, recomendacao, percentual };
};
