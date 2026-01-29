import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ArrowLeft, Plus, Trash, Receipt, TrendUp, CreditCard, X } from "phosphor-react";
import { getCurrentMonthKey, formatMonthKey, getMonthList } from "../utils/dateUtils";
import BottomNav from "../components/BottomNav";

export default function Lancamentos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [showCTA, setShowCTA] = useState(false);
  const [data, setData] = useState({
    rendaBase: 0,
    rendasExtras: [],
    despesas: [],
    dividas: []
  });

  // Form states
  const [desc, setDesc] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa"); // despesa, rendaExtra, divida
  const [rendaBaseInput, setRendaBaseInput] = useState("");

  useEffect(() => {
    async function fetchData() {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      try {
        const userRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const monthData = userData.historicoMensal?.[selectedMonth] || {
            rendaBase: userData.rendaMensal || 0,
            rendasExtras: [],
            despesas: userData.despesasFixas || [],
            dividas: userData.dividas || []
          };
          setData(monthData);
          setRendaBaseInput(monthData.rendaBase.toString());
        }
      } catch (error) {
        console.error("Erro ao buscar lançamentos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedMonth, navigate]);

  const handleAdd = async () => {
    if (!desc || !valor) return;
    
    const novoItem = {
      id: Date.now(),
      valor: Number(valor),
      data: new Date().toISOString()
    };

    const newData = { ...data };
    if (tipo === "despesa") {
      novoItem.descricao = desc;
      newData.despesas = [...newData.despesas, novoItem];
    } else if (tipo === "rendaExtra") {
      novoItem.descricao = desc;
      newData.rendasExtras = [...newData.rendasExtras, novoItem];
    } else if (tipo === "divida") {
      novoItem.credor = desc;
      novoItem.parcela = Number(valor);
      newData.dividas = [...newData.dividas, novoItem];
    }

    setData(newData);
    setDesc("");
    setValor("");
    await saveToFirebase(newData);
  };

  const handleRemove = async (id, listType) => {
    const newData = { ...data };
    newData[listType] = newData[listType].filter(item => item.id !== id);
    setData(newData);
    await saveToFirebase(newData);
  };

  const handleUpdateRendaBase = async () => {
    const novoValor = Number(rendaBaseInput) || 0;
    const newData = { ...data, rendaBase: novoValor };
    setData(newData);
    await saveToFirebase(newData);
  };

  const saveToFirebase = async (updatedData) => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      
      const totalRendaCalculada = (Number(updatedData.rendaBase) || 0) + 
                                  (updatedData.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);

      await updateDoc(userRef, {
        [`historicoMensal.${selectedMonth}`]: updatedData,
        rendaMensal: totalRendaCalculada,
        despesasFixas: updatedData.despesas || [],
        dividas: updatedData.dividas || [],
        atualizadoEm: new Date()
      });

      setShowCTA(true);

    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalRenda = (data.rendaBase || 0) + data.rendasExtras.reduce((acc, curr) => acc + curr.valor, 0);
  const totalDespesas = data.despesas.reduce((acc, curr) => acc + curr.valor, 0);
  const totalDividas = data.dividas.reduce((acc, curr) => acc + (curr.parcela || 0), 0);
  const saldo = totalRenda - totalDespesas - totalDividas;

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white">Carregando...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/home")} className="p-2 bg-white/5 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">Lançamentos</h1>
        <div className="w-10" />
      </div>

      {/* Seletor de Mês */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {getMonthList(12).map(month => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-xs transition-all duration-300 ${
              selectedMonth === month ? "bg-white text-black font-bold scale-105" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {formatMonthKey(month)}
          </button>
        ))}
      </div>

      {/* Renda Base do Mês */}
      <div className="bg-zinc-900/60 border border-white/10 p-5 rounded-3xl mb-6 backdrop-blur-md">
        <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black mb-3">Renda Base do Mês</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold">R$</span>
            <input
              type="number"
              value={rendaBaseInput}
              onChange={(e) => setRendaBaseInput(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-10 text-sm text-white outline-none focus:border-white/30 transition-all"
            />
          </div>
          <button 
            onClick={handleUpdateRendaBase}
            className="bg-white text-black px-6 rounded-2xl font-black text-[10px] hover:scale-95 transition-transform"
          >
            ATUALIZAR
          </button>
        </div>
      </div>

      {/* Resumo do Mês */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Entradas</p>
          <p className="text-lg font-bold text-green-400">R$ {totalRenda.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          <p className="text-[10px] text-white/40 mb-1 uppercase tracking-wider">Saídas</p>
          <p className="text-lg font-bold text-red-400">R$ {(totalDespesas + totalDividas).toLocaleString('pt-BR')}</p>
        </div>
        <div className="col-span-2 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest">Saldo Disponível</p>
              <p className={`text-2xl font-black mt-1 ${saldo >= 0 ? "text-white" : "text-red-500"}`}>
                R$ {saldo.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${saldo >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              <TrendUp size={24} weight="bold" className={saldo < 0 ? "rotate-180" : ""} />
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de Adição */}
      <div className="bg-zinc-900/80 p-6 rounded-[32px] border border-white/10 mb-8 shadow-2xl">
        <h2 className="text-[10px] font-black text-white/30 mb-5 uppercase tracking-[0.2em]">Novo Lançamento</h2>
        <div className="space-y-5">
          <div className="flex p-1 bg-black/50 rounded-2xl border border-white/5">
            {[
              { id: "despesa", label: "DESPESA" },
              { id: "rendaExtra", label: "RENDA" },
              { id: "divida", label: "DÍVIDA" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTipo(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all duration-300 ${
                  tipo === t.id 
                    ? "bg-white text-black shadow-lg scale-[1.02]" 
                    : "text-white/30 hover:text-white/60"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder={tipo === "divida" ? "Credor / Nome da Dívida" : "Descrição"}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold">R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 pl-10 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || !desc || !valor}
            className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 ${
              saving || !desc || !valor 
                ? "bg-white/5 text-white/20 cursor-not-allowed" 
                : "bg-white text-black font-black hover:scale-[0.98] active:scale-95 shadow-xl shadow-white/5"
            }`}
          >
            {saving ? (
              <div className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Plus weight="bold" size={18} />
                <span>ADICIONAR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Listagem */}
      <div className="space-y-8">
        {/* Rendas Extras */}
        {data.rendasExtras.length > 0 && (
          <div>
            <h3 className="text-[10px] font-black text-white/30 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
              <TrendUp size={14} weight="bold" className="text-green-400" /> RENDAS EXTRAS
            </h3>
            <div className="space-y-3">
              {data.rendasExtras.map(item => (
                <div key={item.id} className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                      <TrendUp size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.descricao}</p>
                      <p className="text-[10px] text-white/30">{new Date(item.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-green-400">+ R$ {item.valor.toLocaleString('pt-BR')}</span>
                    <button onClick={() => handleRemove(item.id, 'rendasExtras')} className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saídas */}
        <div>
          <h3 className="text-[10px] font-black text-white/30 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
            <Receipt size={14} weight="bold" className="text-red-400" /> SAÍDAS DO MÊS
          </h3>
          <div className="space-y-3">
            {data.despesas.map(item => (
              <div key={item.id} className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.descricao}</p>
                    <p className="text-[10px] text-white/30">Despesa Mensal</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-white">R$ {item.valor.toLocaleString('pt-BR')}</span>
                  <button onClick={() => handleRemove(item.id, 'despesas')} className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
            {data.dividas.map(item => (
              <div key={item.id} className="bg-zinc-900/30 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.credor}</p>
                    <p className="text-[10px] text-white/30">Parcela de Dívida</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-black text-red-400">R$ {item.parcela.toLocaleString('pt-BR')}</span>
                  <button onClick={() => handleRemove(item.id, 'dividas')} className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal CTA - Unificação de Fluxos */}
      {showCTA && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 p-8 rounded-[32px] max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-300">
            <button 
              onClick={() => setShowCTA(false)}
              className="absolute top-4 right-4 text-white/20 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="h-16 w-16 bg-gradient-to-br from-orange-400 via-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
              <TrendUp size={32} weight="bold" className="text-white" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">Mudanças detectadas!</h2>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Notamos mudanças nas suas finanças. Deseja gerar um novo <span className="text-white font-bold">Plano de Saúde Financeira</span> com base nesses dados?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate("/diagnostico")}
                className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[0.98] transition-transform"
              >
                GERAR NOVO PLANO
              </button>
              <button
                onClick={() => setShowCTA(false)}
                className="w-full py-4 bg-white/5 text-white/40 font-bold rounded-2xl hover:bg-white/10 transition-colors"
              >
                AGORA NÃO
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="lancamentos" />
    </div>
  );
}
