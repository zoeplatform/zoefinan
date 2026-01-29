
export default function CategoryList() {
  const data = [
    { name: "Mercado", value: "R$ 806" },
    { name: "Transporte", value: "R$ 405" }
  ];

  return (
    <div className="mt-4 space-y-2">
      {data.map((item,i)=>(
        <div key={i} className="flex justify-between p-3 bg-white rounded-xl shadow text-sm">
          <span>{item.name}</span>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
