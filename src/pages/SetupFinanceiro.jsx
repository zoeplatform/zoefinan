import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import {
  ArrowRight,
  ArrowLeft,
  CurrencyDollar,
  House,
  Phone,
  Drop,
  Lightning,
  ShoppingCart,
  Plus,
  Trash,
  CreditCard,
  Info,
} from "phosphor-react";
import { getCurrentMonthKey } from "../utils/dateUtils";

export default function SetupFinanceiro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Estados para os dados
  const [renda, setRenda] = useState("");

  // Despesas específicas
  const [despesas, setDespesas] = useState([
    { id: "aluguel", descricao: "Aluguel / Moradia", valor: "", Icon: House },
    { id: "luz", descricao: "Conta de Luz", valor: "", Icon: Lightning },
    { id: "agua", descricao: "Conta de Água", valor: "", Icon: Drop },
    { id: "telefone", descricao: "Telefone / Internet", valor: "", Icon: Phone },
    { id: "mercado", descricao: "Mercado / Alimentação", valor: "", Icon: ShoppingCart },
  ]);

  // Dívidas - Atualizado para incluir isParcelada e saldo
  const [dividas, setDividas] = useState([{ id: Date.now(), credor: "", saldo: "", parcela: "", isParcelada: false }]);

  const canGoNext = useMemo(() => {
    if (loading) return false;
    if (step === 1) return Boolean(String(renda).trim());
    return true;
  }, [loading, renda, step]);

  const handleDespesaChange = (id, valor) => {
    setDespesas((prev) => prev.map((d) => (d.id === id ? { ...d, valor } : d)));
  };

  const handleDividaChange = (id, field, value) => {
    setDividas((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const addDivida = () => {
    setDividas((prev) => [...prev, { id: Date.now() + Math.random(), credor: "", saldo: "", parcela: "", isParcelada: false }]);
  };

  const removeDivida = (id) => {
    if (dividas.length > 1) setDividas((prev) => prev.filter((d) => d.id !== id));
  };

  async function handleFinish() {
    const user = auth.currentUser;
    if (!user) return navigate("/login");

    setLoading(true);
    try {
      const userRef = doc(db, "usuarios", user.uid);
      const monthKey = getCurrentMonthKey();

      const valorRenda = Number(renda) || 0;

      const despesasFiltradas = despesas
        .filter((d) => Number(d.valor) > 0)
        .map((d) => ({
          id: Date.now() + Math.random(),
          descricao: d.descricao,
          valor: Number(d.valor),
          data: new Date().toISOString(),
        }));

      const dividasFiltradas = dividas
        .filter((d) => d.credor && Number(d.saldo) > 0)
        .map((d) => ({
          id: Date.now() + Math.random(),
          credor: d.credor,
          saldo: Number(d.saldo),
          isParcelada: d.isParcelada,
          parcela: d.isParcelada ? Number(d.parcela) : Number(d.saldo),
          data: new Date().toISOString(),
        }));

      const initialMonthData = {
        rendaBase: valorRenda,
        rendasExtras: [],
        despesas: despesasFiltradas,
        dividas: dividasFiltradas,
      };

      await updateDoc(userRef, {
        [`historicoMensal.${monthKey}`]: initialMonthData,
        rendaMensal: valorRenda,
        despesasFixas: despesasFiltradas,
        dividas: dividasFiltradas,
        setupConcluido: true,
        atualizadoEm: new Date(),
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
    if (step < 3) setStep((s) => s + 1);
    else handleFinish();
  }

  function prevStep() {
    if (step > 1) setStep((s) => s - 1);
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface dark:text-white flex flex-col relative overflow-hidden">
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-surface-high dark:bg-surface-highest blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-black/5 to-transparent dark:from-white/5 blur-3xl opacity-60" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={prevStep}
            className="p-2 rounded-full border border-default bg-surface-high dark:bg-surface-highest dark:border-white/10 hover:opacity-90 transition"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} className="text-on-surface dark:text-white" />
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex gap-1.5 items-center">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={[
                "h-1.5 rounded-full transition-all duration-500",
                i === step
                  ? "w-8 bg-on-surface dark:bg-white"
                  : "w-2 bg-on-surface-disabled dark:bg-white/20",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="w-10" />
      </div>

      {/* Conteúdo Central */}
      <div className="relative z-10 flex-1 flex flex-col px-8 pt-8 overflow-y-auto no-scrollbar">
        {step === 1 && (
          <div className="flex flex-col items-center justify-center min-h-full text-center">
            <div className="mb-8 p-6 bg-surface-high dark:bg-surface-highest rounded-full backdrop-blur-sm border border-default dark:border-white/10">
              <CurrencyDollar size={48} className="text-success" />
            </div>

            <h1 className="text-3xl font-bold mb-3 tracking-tight text-on-surface dark:text-white">
              Qual sua renda base?
            </h1>
            <p className="text-on-surface-variant dark:text-white/60 text-sm mb-10 max-w-[260px]">
              Informe sua renda mensal fixa aproximada.
            </p>

            <div className="w-full max-w-xs relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-white/40 font-bold text-xl">
                R$
              </span>
              <input
                type="number"
                autoFocus
                placeholder="Ex: 3500"
                value={renda}
                onChange={(e) => setRenda(e.target.value)}
                className="w-full bg-surface-highest dark:bg-surface-highest border border-default dark:border-white/10 rounded-3xl py-6 pl-14 pr-6 text-2xl font-semibold outline-none focus:border-strong dark:focus:border-white/30 transition-all text-on-surface dark:text-white placeholder:text-on-surface-disabled dark:placeholder:text-white/30"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col min-h-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2 text-on-surface dark:text-white">
                Suas despesas mensais
              </h1>
              <p className="text-on-surface-variant dark:text-white/60 text-sm">
                Informe seus gastos fixos aproximados.
              </p>
            </div>

            <div className="space-y-4 pb-10">
              {despesas.map((d) => {
                const Icon = d.Icon;
                return (
                  <div
                    key={d.id}
                    className="bg-surface-high dark:bg-surface-highest border border-default dark:border-white/10 rounded-2xl p-4 flex items-center gap-4"
                  >
                    <div className="h-10 w-10 rounded-xl bg-surface-highest dark:bg-surface-highest flex items-center justify-center border border-subtle dark:border-white/10">
                      <Icon size={20} className="text-on-surface-medium dark:text-white/70" />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs text-on-surface-variant dark:text-white/50 uppercase font-bold tracking-wider mb-1">
                        {d.descricao}
                      </p>

                      <div className="relative">
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-disabled dark:text-white/30 text-sm font-bold">
                          R$
                        </span>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={d.valor}
                          onChange={(e) => handleDespesaChange(d.id, e.target.value)}
                          className="w-full bg-transparent border-none p-0 pl-6 text-lg font-semibold outline-none text-on-surface dark:text-white placeholder:text-on-surface-disabled dark:placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col min-h-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2 text-on-surface dark:text-white">Possui dívidas?</h1>
              <p className="text-on-surface-variant dark:text-white/60 text-sm">
                Liste suas parcelas e empréstimos atuais.
              </p>
            </div>

            <div className="space-y-4 pb-10">
              {dividas.map((d) => (
                <div
                  key={d.id}
                  className="bg-surface-high dark:bg-surface-highest border border-default dark:border-white/10 rounded-2xl p-5 space-y-4 relative"
                >
                  <button
                    onClick={() => removeDivida(d.id)}
                    className="absolute top-4 right-4 text-on-surface-disabled dark:text-white/30 hover:text-error transition"
                    aria-label="Remover dívida"
                  >
                    <Trash size={18} />
                  </button>

                  <div>
                    <p className="text-[10px] text-on-surface-variant dark:text-white/50 uppercase font-black tracking-widest mb-2">
                      Credor / Nome
                    </p>
                    <input
                      type="text"
                      placeholder="Ex: Banco X, Cartão Y"
                      value={d.credor}
                      onChange={(e) => handleDividaChange(d.id, "credor", e.target.value)}
                      className="w-full bg-surface-highest dark:bg-surface/40 border border-default dark:border-white/10 rounded-xl p-3 text-sm outline-none focus:border-strong dark:focus:border-white/30 text-on-surface dark:text-white placeholder:text-on-surface-disabled dark:placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] text-on-surface-variant dark:text-white/50 uppercase font-black tracking-widest mb-2">
                      Valor Total Devedor
                    </p>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled dark:text-white/30 text-sm font-bold">
                        R$
                      </span>
                      <input
                        type="number"
                        placeholder="0,00"
                        value={d.saldo}
                        onChange={(e) => handleDividaChange(d.id, "saldo", e.target.value)}
                        className="w-full bg-surface-highest dark:bg-surface/40 border border-default dark:border-white/10 rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-strong dark:focus:border-white/30 text-on-surface dark:text-white placeholder:text-on-surface-disabled dark:placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-highest dark:bg-surface/20 rounded-xl border border-default dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-on-surface-variant dark:text-white/40" />
                      <span className="text-[10px] font-black text-on-surface-variant dark:text-white/50 uppercase tracking-widest">Parcelada?</span>
                    </div>
                    <button 
                      onClick={() => handleDividaChange(d.id, "isParcelada", !d.isParcelada)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${d.isParcelada ? 'bg-success' : 'bg-on-surface-disabled dark:bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${d.isParcelada ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>

                  {d.isParcelada && (
                    <div className="animate-in zoom-in-95">
                      <p className="text-[10px] text-on-surface-variant dark:text-white/50 uppercase font-black tracking-widest mb-2">
                        Valor da Parcela Mensal
                      </p>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-disabled dark:text-white/30 text-sm font-bold">
                          R$
                        </span>
                        <input
                          type="number"
                          placeholder="0,00"
                          value={d.parcela}
                          onChange={(e) => handleDividaChange(d.id, "parcela", e.target.value)}
                          className="w-full bg-surface-highest dark:bg-surface/40 border border-success/30 dark:border-success/20 rounded-xl py-3 pl-10 pr-3 text-sm outline-none focus:border-success text-on-surface dark:text-white placeholder:text-on-surface-disabled dark:placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addDivida}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-default dark:border-white/10 text-on-surface-variant dark:text-white/40 flex items-center justify-center gap-2 hover:bg-surface-high dark:hover:bg-surface-highest transition"
              >
                <Plus size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Adicionar Outra</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Navegação */}
      <div className="relative z-10 p-8">
        <button
          onClick={nextStep}
          disabled={!canGoNext}
          className={[
            "w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-xl",
            canGoNext
              ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black active:scale-95"
              : "bg-on-surface-disabled dark:bg-white/10 text-on-surface-variant dark:text-white/20 cursor-not-allowed",
          ].join(" ")}
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {step === 3 ? "Concluir Setup" : "Continuar"}
              <ArrowRight size={18} weight="bold" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
