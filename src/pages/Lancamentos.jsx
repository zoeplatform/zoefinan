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
    <div className="h-screen flex items-center justify-center bg-surface text-on-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-on-surface-variant" />
    </div>
  );

  const cardClass = "bg-surface-lowest dark:bg-surface-high border border-default p-6 rounded-[32px] shadow-xl dark:shadow-none transition-all duration-300";
  const inputClass = "w-full bg-surface-low dark:bg-black/10 border border-default rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none";

  return (
    <div className="min-h-screen bg-surface text-on-surface p-6 pb-32 md:pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/home")} className="h-12 w-12 bg-surface-lowest dark:bg-surface-high border border-default rounded-2xl md:hidden shadow-sm dark:shadow-none flex items-center justify-center">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-on-surface">Lançamentos</h1>
          <div className="w-10 md:hidden" />
        </div>

        {/* Seletor de Mês */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 text-on-surface-variant">
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
                    ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black border-on-surface shadow-lg scale-105" 
                    : "bg-surface-lowest dark:bg-surface-high text-on-surface-variant border-default hover:bg-surface-high dark:hover:bg-surface-highest hover:text-on-surface shadow-sm dark:shadow-none"
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
            <div className={cardClass}>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black mb-3">Renda Base do Mês</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                  <input
                    type="number"
                    value={rendaBaseInput}
                    onChange={(e) => setRendaBaseInput(e.target.value)}
                    className={inputClass + " pl-10"}
                  />
                </div>
                <button 
                  onClick={handleUpdateRendaBase}
                  className="bg-on-surface text-surface-lowest dark:bg-white dark:text-black px-6 rounded-2xl font-black text-[10px] hover:scale-95 transition-transform shadow-lg"
                >
                  ATUALIZAR
                </button>
              </div>
            </div>

            {/* Resumo do Mês */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-lowest dark:bg-surface-high p-5 rounded-[24px] border border-default shadow-xl dark:shadow-none">
                <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-black">Entradas</p>
                <p className="text-lg font-black text-success">R$ {totalRenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-surface-lowest dark:bg-surface-high p-5 rounded-[24px] border border-default shadow-xl dark:shadow-none">
                <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-widest font-black">Saídas</p>
                <p className="text-lg font-black text-error">R$ {(totalDespesas + totalDividas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="col-span-2 bg-surface-lowest dark:bg-surface-high p-6 rounded-[32px] border border-default shadow-xl dark:shadow-none">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-black">Saldo Disponível</p>
                    <p className={`text-3xl font-black mt-1 tracking-tighter ${saldo >= 0 ? "text-on-surface" : "text-error"}`}>
                      R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border border-default ${saldo >= 0 ? "bg-success-bg text-success" : "bg-error-bg text-error"}`}>
                    <TrendUp size={28} weight="bold" className={saldo < 0 ? "rotate-180" : ""} />
                  </div>
                </div>
              </div>
            </div>

            {/* Formulário de Adição */}
            <div className="bg-surface-lowest dark:bg-surface-high p-8 rounded-[32px] border border-default shadow-xl dark:shadow-none">
              <h2 className="text-[10px] font-black text-on-surface-variant mb-6 uppercase tracking-[0.2em]">Novo Lançamento</h2>
              <div className="space-y-5">
                <div className="flex p-1.5 bg-surface-low dark:bg-black/10 rounded-2xl border border-default">
                  {[
                    { id: "despesa", label: "DESPESA" },
                    { id: "rendaExtra", label: "RENDA" },
                    { id: "divida", label: "DÍVIDA" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTipo(t.id)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${
                        tipo === t.id 
                          ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black shadow-lg scale-[1.02]" 
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Descrição</label>
                    <input
                      type="text"
                      placeholder={tipo === "divida" ? "Credor / Nome da Dívida" : "Ex: Supermercado, Aluguel..."}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Valor</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                      <input
                        type="number"
                        placeholder="0,00"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        className={inputClass + " pl-10"}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleAdd}
                  disabled={saving}
                  className="w-full py-5 rounded-2xl bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[0.98] active:scale-95 transition-all shadow-lg disabled:opacity-50"
                >
                  <Plus weight="bold" size={18} />
                  {saving ? "SALVANDO..." : "CONFIRMAR LANÇAMENTO"}
                </button>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Listagem */}
          <div className="lg:col-span-7">
            <div className="bg-surface-lowest dark:bg-surface-high rounded-[32px] border border-default shadow-xl dark:shadow-none p-8 min-h-[600px]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-black text-on-surface uppercase tracking-tighter">Histórico Detalhado</h3>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Movimentações de {formatMonthKey(selectedMonth)}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-surface-high dark:bg-surface-highest border border-default flex items-center justify-center text-on-surface-disabled">
                  <Receipt size={20} />
                </div>
              </div>

              <div className="space-y-4">
                {todosLancamentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="h-20 w-20 rounded-full bg-surface-low dark:bg-black/10 flex items-center justify-center mb-4 border border-dashed border-default">
                      <Receipt size={32} className="text-on-surface-disabled" />
                    </div>
                    <p className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Nenhum lançamento neste período</p>
                  </div>
                ) : (
                  todosLancamentos.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between p-5 rounded-2xl bg-surface-low dark:bg-black/10 border border-default hover:border-strong transition-all shadow-sm dark:shadow-none">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center border border-default ${
                          item.tipo === 'renda' ? 'bg-success-bg text-success' : 
                          item.tipo === 'divida' ? 'bg-info-bg text-info' : 
                          'bg-surface-high dark:bg-surface-highest text-on-surface-medium'
                        }`}>
                          {item.tipo === 'renda' ? <TrendUp size={22} /> : item.tipo === 'divida' ? <CreditCard size={22} /> : <Receipt size={22} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-on-surface uppercase tracking-tight">{item.descricao}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                            {item.tipo === 'renda' ? 'Entrada' : item.tipo === 'divida' ? 'Dívida' : 'Despesa'} • {new Date(item.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <p className={`text-sm font-black ${item.tipo === 'renda' ? 'text-success' : 'text-on-surface'}`}>
                          {item.tipo === 'renda' ? '+' : '-'} R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <button 
                          onClick={() => handleRemove(item.id, item.listType)}
                          className="p-2.5 text-on-surface-disabled hover:text-error hover:bg-error-bg rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash size={18} />
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
