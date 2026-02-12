/**
 * PÁGINA: Lançamentos
 * DESCRIÇÃO: Gestão de entradas, saídas e dívidas com histórico mensal detalhado.
 * ---------------------------------------------------------
 */

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Plus, Trash, Receipt, TrendUp, CreditCard, CalendarBlank, Info } from "phosphor-react";
import { getCurrentMonthKey, formatMonthKey, getMonthList } from "../utils/dateUtils";
import { getRandomCardColor } from "../utils/themeUtils";

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

  // Cores dinâmicas para os cards de resumo
  const summaryColors = useMemo(() => ({
    entradas: getRandomCardColor("entradas"),
    saidas: getRandomCardColor("saidas"),
    saldo: getRandomCardColor("saldo_lancamentos"),
  }), []);

  // Estados do formulário
  const [desc, setDesc] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("despesa"); // despesa, rendaExtra, divida
  const [rendaBaseInput, setRendaBaseInput] = useState("");
  
  // Novos estados para dívidas
  const [isParcelada, setIsParcelada] = useState(false);
  const [valorParcela, setValorParcela] = useState("");

  /* 
     CARREGAMENTO DE DADOS: Busca informações do mês selecionado
     -------------------------------------------------------
  */
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

  /* 
     AÇÕES: Adicionar, remover e atualizar dados
     -------------------------------------------------------
  */
  const handleAdd = async () => {
    if (!desc || !valor) return;
    
    const novoItem = {
      id: Date.now(),
      data: new Date().toISOString()
    };

    const newData = { ...data };
    if (tipo === "despesa") {
      novoItem.descricao = desc;
      novoItem.valor = Number(valor);
      newData.despesas = [...(newData.despesas || []), novoItem];
    } else if (tipo === "rendaExtra") {
      novoItem.descricao = desc;
      novoItem.valor = Number(valor);
      newData.rendasExtras = [...(newData.rendasExtras || []), novoItem];
    } else if (tipo === "divida") {
      novoItem.credor = desc;
      novoItem.saldo = Number(valor);
      novoItem.isParcelada = isParcelada;
      novoItem.parcela = isParcelada ? Number(valorParcela) : Number(valor);
      newData.dividas = [...(newData.dividas || []), novoItem];
    }

    setData(newData);
    setDesc("");
    setValor("");
    setValorParcela("");
    setIsParcelada(false);
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

  /* 
     CÁLCULOS: Totais e saldo do período
     -------------------------------------------------------
  */
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
    <div className="h-screen flex items-center justify-center bg-app-background text-on-surface">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-on-surface-variant" />
    </div>
  );

  // Classes utilitárias para manter o código limpo
  const cardClass = "card-lanc border border-default p-6 rounded-[32px] shadow-xl dark:shadow-none transition-all duration-300";
  const inputClass = "w-full bg-surface-lowest dark:bg-black/10 border border-default rounded-2xl p-4 text-sm text-on-surface placeholder:text-on-surface-disabled focus:border-strong transition-all outline-none";

  return (
    <div className="min-h-screen bg-app-background text-on-surface p-6 pb-32 md:pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER: Título e navegação mobile */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/home")} className="h-12 w-12 bg-surface-low dark:bg-surface-high border border-default rounded-2xl md:hidden shadow-sm dark:shadow-none flex items-center justify-center">
            <ArrowLeft size={24} className="text-on-surface" />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-on-surface">Lançamentos</h1>
          <div className="w-10 md:hidden" />
        </div>

        {/* SELETOR: Escolha do mês de referência */}
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
                    : "bg-surface-low dark:bg-surface-high text-on-surface-variant border-default hover:bg-surface-high dark:hover:bg-surface-highest hover:text-on-surface shadow-sm dark:shadow-none"
                }`}
              >
                {formatMonthKey(month)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUNA ESQUERDA: Formulários e Resumo */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* CARD: Renda Base */}
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
                  className="btn-lanc-primary px-6 rounded-2xl font-black text-[10px] hover:scale-95 transition-transform shadow-lg"
                >
                  ATUALIZAR
                </button>
              </div>
            </div>

            {/* GRID: Resumo de Entradas/Saídas com cores dinâmicas */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-5 rounded-[24px] border border-default shadow-xl dark:shadow-none dark:bg-surface-high ${summaryColors.entradas.bg}`}>
                <p className={`text-[10px] mb-1 uppercase tracking-widest font-black dark:text-on-surface-variant ${summaryColors.entradas.text} opacity-80`}>Entradas</p>
                <p className={`text-lg font-black dark:text-success ${summaryColors.entradas.text}`}>R$ {totalRenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className={`p-5 rounded-[24px] border border-default shadow-xl dark:shadow-none dark:bg-surface-high ${summaryColors.saidas.bg}`}>
                <p className={`text-[10px] mb-1 uppercase tracking-widest font-black dark:text-on-surface-variant ${summaryColors.saidas.text} opacity-80`}>Saídas</p>
                <p className={`text-lg font-black dark:text-error ${summaryColors.saidas.text}`}>R$ {(totalDespesas + totalDividas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className={`col-span-2 p-6 rounded-[32px] border border-default shadow-xl dark:shadow-none dark:bg-surface-high ${summaryColors.saldo.bg}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-[10px] mb-1 uppercase tracking-widest font-black dark:text-on-surface-variant ${summaryColors.saldo.text} opacity-80`}>Saldo Livre</p>
                    <p className={`text-2xl font-black ${saldo >= 0 ? (summaryColors.saldo.text + ' dark:text-success') : 'text-error'}`}>R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM: Novo Lançamento */}
            <div className={cardClass}>
              <h2 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Novo Lançamento</h2>
              <div className="space-y-4">
                <div className="flex p-1 bg-surface-lowest dark:bg-black/20 rounded-2xl border border-default">
                  {[
                    { id: 'despesa', label: 'Gasto' },
                    { id: 'rendaExtra', label: 'Renda' },
                    { id: 'divida', label: 'Dívida' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTipo(t.id)}
                      className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${tipo === t.id ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black shadow-md" : "text-on-surface-variant"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder={tipo === 'divida' ? "Nome do Credor (ex: Cartão Nubank)" : "Descrição do Lançamento"}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className={inputClass}
                />

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                    <input
                      type="number"
                      placeholder={tipo === 'divida' ? "Valor Total" : "Valor"}
                      value={valor}
                      onChange={(e) => setValor(e.target.value)}
                      className={inputClass + " pl-10"}
                    />
                  </div>
                </div>

                {tipo === 'divida' && (
                  <div className="pt-2 space-y-4">
                    <button 
                      onClick={() => setIsParcelada(!isParcelada)}
                      className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isParcelada ? "border-on-surface bg-on-surface/5" : "border-default bg-transparent"}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Dívida Parcelada?</span>
                      <div className={`h-5 w-10 rounded-full relative transition-colors ${isParcelada ? "bg-on-surface" : "bg-surface-high"}`}>
                        <div className={`h-3 w-3 rounded-full bg-white absolute top-1 transition-all ${isParcelada ? "left-6" : "left-1"}`} />
                      </div>
                    </button>

                    {isParcelada && (
                      <div className="relative animate-in slide-in-from-top-2 duration-300">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled text-sm font-bold">R$</span>
                        <input
                          type="number"
                          placeholder="Valor da Parcela Mensal"
                          value={valorParcela}
                          onChange={(e) => setValorParcela(e.target.value)}
                          className={inputClass + " pl-10"}
                        />
                        <p className="text-[8px] text-on-surface-variant font-bold uppercase mt-2 px-1">Este valor será subtraído do seu saldo mensal</p>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={handleAdd}
                  disabled={saving || !desc || !valor}
                  className="w-full btn-lanc-primary py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {saving ? <div className="h-4 w-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Plus size={18} weight="bold" />}
                  Confirmar Lançamento
                </button>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: Histórico */}
          <div className="lg:col-span-7">
            <div className={cardClass + " min-h-[600px]"}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-black text-on-surface uppercase tracking-tight">Extrato do Período</h2>
                  <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Movimentações de {formatMonthKey(selectedMonth)}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-surface-low dark:bg-surface-high border border-default flex items-center justify-center text-on-surface-variant">
                  <Receipt size={24} />
                </div>
              </div>

              <div className="space-y-4">
                {todosLancamentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <Info size={48} weight="thin" />
                    <p className="text-sm font-bold uppercase tracking-widest mt-4">Nenhum registro</p>
                    <p className="text-[10px] mt-1">Adicione seus gastos e ganhos para começar</p>
                  </div>
                ) : (
                  todosLancamentos.map((item) => (
                    <div 
                      key={item.id}
                      className="group flex items-center justify-between p-5 rounded-[24px] bg-surface-lowest dark:bg-black/10 border border-default hover:border-strong transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border border-default ${
                          item.tipo === 'renda' ? 'bg-success-bg text-success' : 
                          item.tipo === 'divida' ? 'bg-info-bg text-info' : 
                          'bg-surface-low dark:bg-surface-high text-on-surface-variant'
                        }`}>
                          {item.tipo === 'renda' ? <TrendUp size={22} /> : item.tipo === 'divida' ? <CreditCard size={22} /> : <Receipt size={22} />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-on-surface uppercase tracking-tight">{item.descricao || item.credor}</p>
                          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                            {item.tipo === 'renda' ? 'Renda Extra' : item.tipo === 'divida' ? 'Dívida / Parcelamento' : 'Gasto Mensal'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className={`text-sm font-black ${item.tipo === 'renda' ? 'text-success' : 'text-on-surface'}`}>
                          {item.tipo === 'renda' ? '+' : '-'} R$ {Number(item.valor || item.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        <button 
                          onClick={() => handleRemove(item.id, item.listType)}
                          className="h-10 w-10 rounded-xl bg-error-bg text-error opacity-0 group-hover:opacity-100 transition-all hover:scale-110 flex items-center justify-center"
                        >
                          <Trash size={18} weight="bold" />
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
