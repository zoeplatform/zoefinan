export default function BalanceCard({ balance }) {
  const formattedBalance =
    balance !== undefined
      ? balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";

  const isNegative = typeof balance === "number" && balance < 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-zinc-900/70 p-5 shadow-lg backdrop-blur mb-4">
      {/* linha de destaque */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 opacity-80" />

      <p className="text-sm text-white/60">Saldo livre estimado</p>

      <h3 className={`mt-2 text-3xl font-semibold ${isNegative ? "text-red-400" : "text-white"}`}>
        {formattedBalance}
      </h3>

      <p className="mt-2 text-xs text-white/50">
        Baseado em sua renda e despesas fixas
      </p>
    </div>
  );
}