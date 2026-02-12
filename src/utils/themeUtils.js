/**
 * ZoeFinan - Utilitários de Tema e Cores
 * ---------------------------------------------------------
 * Este arquivo contém funções para gerenciar a aparência dinâmica da aplicação.
 */

/**
 * Lista de cores vibrantes para cards (Tema Claro)
 * Baseado na paleta fornecida pelo usuário.
 */
export const DYNAMIC_CARD_COLORS = [
  { bg: 'bg-[#3B82F6]', text: 'text-white', name: 'blue' },
  { bg: 'bg-[#22C55E]', text: 'text-white', name: 'green' },
  { bg: 'bg-[#F97316]', text: 'text-white', name: 'orange' },
  { bg: 'bg-[#8B5CF6]', text: 'text-white', name: 'purple' },
  { bg: 'bg-[#FACC15]', text: 'text-black', name: 'yellow' },
];

/**
 * Retorna uma cor aleatória da paleta dinâmica.
 * @param {string} seed - Uma string opcional para garantir que o mesmo card sempre tenha a mesma cor.
 * @returns {object} Objeto com classes de fundo e texto.
 */
export const getRandomCardColor = (seed) => {
  const index = seed 
    ? Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DYNAMIC_CARD_COLORS.length
    : Math.floor(Math.random() * DYNAMIC_CARD_COLORS.length);
  
  return DYNAMIC_CARD_COLORS[index];
};

/**
 * Documentação de Estrutura de Cores para Desenvolvedores
 * ---------------------------------------------------------
 * Use estas variáveis CSS em vez de cores hexadecimais fixas:
 * 
 * --surface-lowest: Fundo de cards (Branco no claro, Preto no escuro)
 * --on-surface: Cor de texto principal
 * --accent-primary: Cor de destaque (Azul no claro, Branco no escuro)
 * 
 * Exemplo de uso no Tailwind:
 * <div className="--app-background text-on-surface border-default">
 */
