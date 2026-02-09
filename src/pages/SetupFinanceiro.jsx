import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ArrowRight, ArrowLeft, CurrencyDollar, Receipt, CreditCard, House, Phone, Drop, Lightning, ShoppingCart, Plus, Trash } from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function SetupFinanceiro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Estados para os dados
  const [renda, setRenda] = useState("");
  
  // Despesas específicas
  const [despesas, setDespesas] = useState([
    { id: 'aluguel', descricao: 'Aluguel / Moradia', valor: '', icon: <House size={20} /> },
    { id: 'luz', descricao: 'Conta de Luz', valor: '', icon: <Lightning size={20} /> },
    { id: 'agua', descricao: 'Conta de Água', valor: '', icon: <Drop size={20} /> },
    { id: 'telefone', descricao: 'Telefone / Internet', valor: '', icon: <Phone size={20} /> },
    { id: 'mercado', descricao: 'Mercado / Alimentação', valor: '', icon: <ShoppingCart size={20} /> },
  ]);

  // Dívidas
  const [dividas, setDividas] = useState([
    { id: Date.now(), credor: '', parcela: '' }
  ]);

  const handleDespesaChange = (id, valor) => {
    setDespesas(prev => prev.map(d => d.id === id ? { ...d, valor } : d));
  };

  const handleDividaChange = (id, field, value) => {
    setDividas(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const addDivida = () => {
    setDividas(prev => [...prev, { id: Date.now(), credor: '', parcela: '' }]);
  };

  const removeDivida = (id) => {
    if (dividas.length > 1) {
      setDividas(prev => prev.filter(d => d.id !== id));
    }
  };

  async function handleFinish() {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    setLoading(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const monthKey = getCurrentMonthKey();
      
      const valorRenda = Number(renda) || 0;
      
      // Filtrar apenas despesas com valor preenchido
      const despesasFiltradas = despesas
        .filter(d => Number(d.valor) > 0)
        .map(d => ({
          id: Date.now() + Math.random(),
          descricao: d.descricao,
          valor: Number(d.valor),
          data: new Date().toISOString()
        }));

      // Filtrar apenas dívidas com credor e parcela preenchidos
      const dividasFiltradas = dividas
        .filter(d => d.credor && Number(d.parcela) > 0)
        .map(d => ({
          id: Date.now() + Math.random(),
          credor: d.credor,
          parcela: Number(d.parcela),
          data: new Date().toISOString()
        }));

      const initialMonthData = {
        rendaBase: valorRenda,
        rendasExtras: [],
        despesas: despesasFiltradas,
        dividas: dividasFiltradas
      };

      await updateDoc(userRef, {
        [`historicoMensal.${monthKey}`]: initialMonthData,
        rendaMensal: valorRenda,
        despesasFixas: despesasFiltradas,
        dividas: dividasFiltradas,
        setupConcluido: true,
        atualizadoEm: new Date()
      });

      navigate("/home");
    } catch (error) {
      console.error("Erro ao salvar setup:", error);
      alert("Ocorreu um erro ao salvar suas informações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function nextStep() {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-surface text-white flex flex-col relative overflow-hidden">
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-surface-high dark:bg-surface-highest blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-gradient-to-b from-white/5 to-transparent blur-3xl opacity-50" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
        {step > 1 ? (
          <button onClick={prevStep} className="p-2 bg-surface-high dark:bg-surface-highest rounded-full hover:bg-surface-high dark:bg-surface-highest transition">
            <ArrowLeft size={24} />
          </button>
        ) : (
          <div className="w-10" />
        )}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-white" : "w-2 bg-white/20"}`} 
            />
          ))}
        </div>
        <div className="w-10" />
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 flex-1 flex flex-col px-8 pt-8 overflow-y-auto no-scrollbar">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center">
            <div className="mb-8 p-6 bg-surface-high dark:bg-surface-highest rounded-full backdrop-blur-sm border border-white/10 animate-pulse">
              <CurrencyDollar size={48} className="text-green-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Qual sua renda base?</h1>
            <p className="text-white/50 text-sm mb-10 max-w-[260px]">Informe sua renda mensal fixa aproximada.</p>
            <div className="w-full max-w-xs relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 font-bold text-xl">R$</span>
              <input
                type="number"
                autoFocus
                placeholder="Ex: 3500"
                value={renda}
                onChange={(e) => setRenda(e.target.value)}
                className="w-full bg-surface-high dark:bg-surface-highest border border-white/10 rounded-3xl py-6 pl-14 pr-6 text-2xl font-semibold outline-none focus:border-white/30 focus:bg-surface-high dark:bg-surface-highest transition-all text-white placeholder:text-white/10"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col min-h-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Suas despesas mensais</h1>
              <p className="text-white/50 text-sm">Informe seus gastos fixos aproximados.</p>
            </div>
            <div className="space-y-4 pb-10">
              {despesas.map((d) => (
                <div key={d.id} className="bg-surface-high dark:bg-surface-highest border border-white/10 rounded-2xl shadow-sm dark:shadow-none p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-surface-high dark:bg-surface-highest flex items-center justify-center text-white/70">
                    {d.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/40 uppercase font-bold tracking-wider mb-1">{d.descricao}</p>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold">R$</span>
                      <input
                        type="number"
                        placeholder="0,00"
                        value={d.valor}
                        onChange={(e) => handleDespesaChange(d.id, e.target.value)}
                        className="w-full bg-transparent border-none p-0 pl-6 text-lg font-semibold outline-none text-white placeholder:text-white/10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col min-h-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Possui dívidas?</h1>
              <p className="text-white/50 text-sm">Liste suas parcelas e empréstimos atuais.</p>
            </div>
            <div className="space-y-4 pb-10">
              {dividas.map((d) => (
                <div key={d.id} className="bg-surface-high dark:bg-surface-highest border border-white/10 rounded-2xl shadow-sm dark:shadow-none p-5 space-y-4 relative">
                  <button 
                    onClick={() => removeDivida(d.id)}
                    className="absolute top-4 right-4 text-white/20 hover:text-red-400 transition"
                  >
                    <Trash size={18} />
                  </button>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Credor / Nome</p>
                    <input
                      type="text"
                      placeholder="Ex: Banco X, Cartão Y"
                      value={d.credor}
                      onChange={(e) => handleDividaChange(d.id, 'credor', e.target.value)}
                      className="w-full bg-surface/40 border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Valor da Parcela</p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold">R$</span>
                      <input
                        type="number"
                        placeholder="0,00"
                        value={d.parcela}
                        onChange={(e) => handleDividaChange(d.id, 'parcela', e.target.value)}
                        className="w-full bg-surface/40 border border-white/10 rounded-xl p-3 pl-10 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addDivida}
                className="w-full py-4 border border-dashed border-white/20 rounded-2xl shadow-sm dark:shadow-none flex items-center justify-center gap-2 text-white/40 hover:text-white hover:border-white/40 transition"
              >
                <Plus size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Adicionar outra dívida</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Botão */}
      <div className="relative z-10 p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button
          onClick={nextStep}
          disabled={loading || (step === 1 && !renda)}
          className={`w-full py-5 rounded-full flex items-center justify-center gap-3 transition-all duration-300 ${
            (step === 1 && !renda) || loading
              ? "bg-surface-high dark:bg-surface-highest text-white/20 cursor-not-allowed"
              : "bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-bold hover:scale-[0.98] active:scale-95 shadow-xl shadow-white/10"
          }`}
        >
          {loading ? (
            <div className="h-6 w-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-lg">{step === 3 ? "Finalizar" : "Próximo"}</span>
              <ArrowRight size={20} weight="bold" />
            </>
          )}
        </button>
        <p className="mt-6 text-center text-[10px] text-white/30 uppercase tracking-widest">
          Passo {step} de 3
        </p>
      </div>
    </div>
  );
}
