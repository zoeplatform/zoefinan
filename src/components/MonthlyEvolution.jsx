/**
 * COMPONENTE: MonthlyEvolution
 * DESCRIÇÃO: Gráfico de área que exibe a evolução mensal de entradas e saídas.
 * ---------------------------------------------------------
 */

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { formatMonthKey } from "../utils/dateUtils";

export default function MonthlyEvolution({ monthlyData }) {
  // Caso não haja dados, exibe um estado vazio amigável
  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="bg-surface-low dark:bg-white/5 border border-default border-dashed p-8 rounded-3xl text-center">
        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Sem dados históricos suficientes</p>
      </div>
    );
  }

  /**
   * CustomTooltip: Estilização do balão que aparece ao passar o mouse no gráfico
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-on-surface border border-default p-4 rounded-2xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-surface-lowest/60 uppercase font-black mb-2">
            {formatMonthKey(label)}
          </p>
          <div className="space-y-1">
            <p className="text-sm font-bold text-success">
              Entradas: R$ {payload[0].value.toLocaleString('pt-BR')}
            </p>
            <p className="text-sm font-bold text-error">
              Saídas: R$ {payload[1].value.toLocaleString('pt-BR')}
            </p>
            <div className="pt-2 mt-2 border-t border-surface-lowest/10">
              <p className="text-sm font-black text-surface-lowest">
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
      {/* HEADER DO GRÁFICO: Título e Legenda */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-on-surface uppercase tracking-tight">Evolução Mensal</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-info" />
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Entradas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-error" />
            <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Saídas</span>
          </div>
        </div>
      </div>

      {/* CONTAINER DO GRÁFICO: Área de renderização do Recharts */}
      <div className="h-[300px] w-full bg-surface-low dark:bg-white/5 border border-default p-6 rounded-[32px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--info)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--info)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--error)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--error)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => formatMonthKey(value).split(' ')[0].substring(0, 3).toUpperCase()}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 700 }}
              tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="entradas" 
              stroke="var(--info)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEntradas)" 
              animationDuration={1500}
              animationBegin={200}
            />
            <Area 
              type="monotone" 
              dataKey="saidas" 
              stroke="var(--error)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSaidas)" 
              animationDuration={1500}
              animationBegin={400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RODAPÉ DO GRÁFICO: Comparativo com o mês anterior */}
      <div className="grid grid-cols-2 gap-4">
        {monthlyData.slice(-2).map((item, index) => {
          const prevItem = index > 0 ? monthlyData[monthlyData.length - 2] : null;
          const currentSaldo = item.entradas - item.saidas;
          const prevSaldo = prevItem ? prevItem.entradas - prevItem.saidas : null;
          const diff = prevSaldo !== null ? currentSaldo - prevSaldo : null;

          return (
            <div key={item.month} className="bg-surface-lowest border border-default p-5 rounded-3xl shadow-sm dark:shadow-none">
              <p className="text-[10px] text-on-surface-variant font-black uppercase mb-1 tracking-widest">{formatMonthKey(item.month)}</p>
              <p className="text-xl font-black text-on-surface">R$ {currentSaldo.toLocaleString('pt-BR')}</p>
              {diff !== null && (
                <p className={`text-[10px] font-bold mt-1 ${diff >= 0 ? 'text-success' : 'text-error'}`}>
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
