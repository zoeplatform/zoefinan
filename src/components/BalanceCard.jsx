export default function BalanceCard({ balance }) {
  const formattedBalance =
    balance !== undefined
      ? balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  const isNegative = typeof balance === "number" && balance < 0;

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-default bg-surface-lowest dark:bg-surface-high p-8 shadow-xl dark:shadow-none backdrop-blur-xl transition-all duration-300">
      {/* linha de destaque premium */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-purple-600 to-blue-600 opacity-90" />

      <div className="flex items-center gap-2 mb-2">
        <div className={`h-2 w-2 rounded-full ${isNegative ? 'bg-error animate-pulse' : 'bg-success'}`} />
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Saldo livre estimado</p>
      </div>

      <h3 className={`text-4xl font-black tracking-tighter ${isNegative ? "text-error" : "text-on-surface"}`}>
        {formattedBalance}
      </h3>

      <div className="mt-6 pt-6 border-t border-default">
        <p className="text-[10px] font-bold text-on-surface-disabled uppercase tracking-widest">
          Baseado em sua renda e despesas fixas do mês
        </p>
      </div>

      {/* Decoração de fundo sutil */}
      <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-on-surface/5 blur-3xl" />
    </div>
  );
}
