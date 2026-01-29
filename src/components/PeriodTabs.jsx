
export default function PeriodTabs() {
  return (
    <div className="flex space-x-2 mb-4">
      {["Semana","Mês","Ano"].map((t,i)=>(
        <button key={i} className="px-3 py-1 rounded-full bg-white shadow text-xs">{t}</button>
      ))}
    </div>
  );
}
