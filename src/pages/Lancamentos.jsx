import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Plus, Trash, Receipt, TrendUp, CreditCard, CalendarBlank } from "phosphor-react";
import { getCurrentMonthKey, formatMonthKey, getMonthList } from "../utils/dateUtils";

export default function Lancamentos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const monthData = userData.historicoMensal?.[selectedMonth] || {
              rendaBase: userData.rendaMensal || 0,
              rendasExtras: [],
              despesas: [],
              dividas: []
            };
            setData(monthData);
            setRendaBaseInput((monthData.rendaBase || 0).toString());
          }
        } catch (error) {
          console.error("Erro ao buscar lançamentos:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
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
      newData.despesas = [...(newData.despesas || []), novoItem];
    } else if (tipo === "rendaExtra") {
      novoItem.descricao = desc;
      newData.rendasExtras = [...(newData.rendasExtras || []), novoItem];
    } else if (tipo === "divida") {
      novoItem.credor = desc;
      novoItem.parcela = Number(valor);
      newData.dividas = [...(newData.dividas || []), novoItem];
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
      await updateDoc(userRef, {
        [`historicoMensal.${selectedMonth}`]: updatedData,
        atualizadoEm: new Date()
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalRenda = (Number(data.rendaBase) || 0) + (data.rendasExtras?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0);
  const totalDespesas = data.despesas?.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0) || 0;
  const totalDividas = data.dividas?.reduce((acc, curr) => acc + (Number(curr.parcela) || 0), 0) || 0;
  const saldo = totalRenda - totalDespesas - totalDividas;

  const todosLancamentos = [
    ...(data.rendasExtras || []).map(r => ({ ...r, tipo: 'renda', listType: 'rendasExtras' })),
    ...(data.despesas || []).map(d => ({ ...d, tipo: 'despesa', listType: 'despesas' })),
    ...(data.dividas || []).map(v => ({ ...v, tipo: 'divida', descricao: v.credor, valor: v.parcela, listType: 'dividas' }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data));

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/70" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/home")} className="p-2 bg-white/5 rounded-full md:hidden">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Lançamentos</h1>
          <div className="w-10 md:hidden" />
        </div>

        {/* Seletor de Mês */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-white/40">
            <CalendarBlank size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Selecione o Período</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {getMonthList(12).map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs transition-all duration-300 border ${
                  selectedMonth === month 
                    ? "bg-white text-black font-bold border-white shadow-lg shadow-white/10 scale-105" 
                    : "bg-zinc-900/50 text-white/40 border-white/5 hover:bg-white/5 hover:text-white/60"
                }`}
              >
                {formatMonthKey(month)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Coluna da Esquerda: Formulários e Resumo */}
          <div className="lg:col-span-5 space-y-6">
            {/* Renda Base do Mês */}
            <div className="bg-zinc-900/60 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="bg-zinc-900/80 p-6 rounded-[32px] border border-white/10 shadow-2xl">
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
                  <input
                    type="text"
                    placeholder={tipo === "divida" ? "Credor / Nome da Dívida" : "Descrição"}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:border-white/30 transition-all outline-none"
                  />
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
          </div>

          {/* Coluna da Direita: Lista de Lançamentos */}
          <div className="lg:col-span-7">
            <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-6 h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Histórico do Período</h2>
                <span className="text-[10px] font-black text-white/20">{todosLancamentos.length} ITENS</span>
              </div>

              <div className="space-y-3">
                {todosLancamentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white/10">
                    <Receipt size={48} weight="thin" />
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest">Nenhum lançamento este mês</p>
                  </div>
                ) : (
                  todosLancamentos.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          item.tipo === 'renda' ? 'bg-green-500/10 text-green-400' : 
                          item.tipo === 'divida' ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/40'
                        }`}>
                          {item.tipo === 'renda' ? <TrendUp size={20} /> : 
                           item.tipo === 'divida' ? <CreditCard size={20} /> : <Receipt size={20} />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white/90">{item.descricao}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">
                            {new Date(item.data).toLocaleDateString('pt-BR')} • {item.tipo.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`text-sm font-black ${item.tipo === 'renda' ? 'text-green-400' : 'text-white'}`}>
                          {item.tipo === 'renda' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR')}
                        </p>
                        <button 
                          onClick={() => handleRemove(item.id, item.listType)}
                          className="p-2 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
