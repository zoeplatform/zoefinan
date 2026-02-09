import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatMonthKey } from "../utils/dateUtils";

export default function MonthlyEvolution({ monthlyData }) {
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
        <p className="text-white/40">Sem dados históricos suficientes para exibir a evolução.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-white/40 uppercase font-black mb-2">{formatMonthKey(label)}</p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-green-400">
              Entradas: R$ {payload[0].value.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm font-bold text-red-400">
              Saídas: R$ {payload[1].value.toLocaleString('pt-BR')}
            </p>
            <div className="pt-2 mt-2 border-t border-white/5">
              <p className="text-sm font-black text-white">
                Saldo: R$ {(payload[0].value - payload[1].value).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Evolução Mensal</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-white/40 font-black uppercase">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-white/40 font-black uppercase">Saídas</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full bg-white/5 border border-white/10 p-6 rounded-[32px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => formatMonthKey(value).split(' ')[0].substring(0, 3).toUpperCase()}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="entradas" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEntradas)" 
            />
            <Area 
              type="monotone" 
              dataKey="saidas" 
              stroke="#ef4444" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSaidas)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {monthlyData.slice(-2).map((item, index) => {
          const prevItem = index > 0 ? monthlyData[monthlyData.length - 2] : null;
          const currentSaldo = item.entradas - item.saidas;
          const prevSaldo = prevItem ? prevItem.entradas - prevItem.saidas : null;
          const diff = prevSaldo !== null ? currentSaldo - prevSaldo : null;

          return (
            <div key={item.month} className="bg-white/5 border border-white/10 p-5 rounded-3xl">
              <p className="text-[10px] text-white/40 font-black uppercase mb-1">{formatMonthKey(item.month)}</p>
              <p className="text-xl font-black text-white">R$ {currentSaldo.toLocaleString('pt-BR')}</p>
              {diff !== null && (
                <p className={`text-[10px] font-bold mt-1 ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toLocaleString('pt-BR')} vs mês anterior
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
