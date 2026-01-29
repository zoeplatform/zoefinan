export const getCurrentMonthKey = () => {
  const now = new Date();
  // Se a data atual for anterior a Janeiro de 2026, retorna 2026-01
  if (now.getFullYear() < 2026) return "2026-01";
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMonthKey = (key) => {
  const [year, month] = key.split('-');
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

export const getMonthList = (count = 6) => {
  const months = [];
  const now = new Date();
  
  // Data de referência: Janeiro de 2026
  const startYear = 2026;
  const startMonth = 0; // Janeiro é 0
  
  // Data atual (ou Jan 2026 se estivermos antes)
  let currentYear = now.getFullYear();
  let currentMonth = now.getMonth();
  
  if (currentYear < 2026) {
    currentYear = 2026;
    currentMonth = 0;
  }

  // Gerar lista de meses desde Jan 2026 até o mês atual
  let tempYear = startYear;
  let tempMonth = startMonth;

  while (tempYear < currentYear || (tempYear === currentYear && tempMonth <= currentMonth)) {
    months.push(`${tempYear}-${String(tempMonth + 1).padStart(2, '0')}`);
    tempMonth++;
    if (tempMonth > 11) {
      tempMonth = 0;
      tempYear++;
    }
  }

  // Retornar os últimos 'count' meses, mas apenas os que existem a partir de Jan 2026
  // Inverter para mostrar os mais recentes primeiro se desejar, ou manter cronológico
  return months.slice(-count);
};
