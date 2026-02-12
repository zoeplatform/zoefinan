// src/pages/Artigos.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CaretRight } from "phosphor-react";

const artigos = [
  {
    id: 1,
    titulo: "O perigo das dívidas",
    resumo:
      "Como as dívidas roubam sua liberdade financeira e o que a Bíblia diz sobre isso.",
    categoria: "Mentalidade",
  },
  {
    id: 2,
    titulo: "Reserva de emergência",
    resumo:
      "Por que todo cristão deve se preparar para os anos de escassez como José no Egito.",
    categoria: "Planejamento",
  },
  {
    id: 3,
    titulo: "Como renegociar dívidas",
    resumo:
      "Passos práticos e estratégicos para sair do vermelho e recuperar sua paz financeira.",
    categoria: "Ação",
  },
];

export default function Artigos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-app-background px-6 pt-8 pb-24 relative overflow-hidden transition-colors duration-300">
      {/* Glow discreto (consistência visual) - apenas no escuro */}
      <div className="pointer-events-none absolute inset-0 dark:block hidden">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/20 via-purple-500/15 to-blue-500/15 blur-2xl opacity-55" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="h-10 w-10 rounded-full bg-surface-low dark:bg-surface-high border border-default flex items-center justify-center active:scale-[0.98] transition shadow-sm dark:shadow-none"
            aria-label="Voltar"
            type="button"
          >
            <ArrowLeft size={18} className="text-on-surface" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-on-surface tracking-tight">
              Educação
            </h1>
            <p className="text-xs text-on-surface-variant">
              Aprenda a dominar suas finanças
            </p>
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-3">
          {artigos.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate(`/artigo/${a.id}`)}
              className="w-full text-left rounded-2xl card-art border border-default p-5 active:scale-[0.99] transition shadow-sm dark:shadow-none hover:bg-surface-low dark:hover:bg-surface-highest"
              type="button"
              aria-label={`Abrir artigo: ${a.titulo}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center rounded-full bg-surface-high dark:bg-surface-highest px-3 py-1 text-[11px] font-medium text-on-surface-medium">
                    {a.categoria}
                  </span>

                  <h2 className="mt-3 text-[17px] font-semibold text-on-surface leading-snug">
                    {a.titulo}
                  </h2>

                  <p className="mt-2 text-sm text-on-surface-variant leading-relaxed line-clamp-2">
                    {a.resumo}
                  </p>
                </div>

                <div className="mt-1 flex items-center text-on-surface-variant">
                  <CaretRight size={18} />
                </div>
              </div>

              <div className="mt-4 text-sm font-semibold text-on-surface">
                Ler artigo
              </div>
            </button>
          ))}
        </div>

        {/* Dica do dia */}
        <div className="mt-8 rounded-2xl card-art border border-default p-5 shadow-sm dark:shadow-none">
          <h3 className="font-semibold text-on-surface">Dica do dia 💡</h3>
          <p className="mt-2 text-sm text-on-surface-medium leading-relaxed">
            “O que trabalha com mão remissa empobrece, mas a mão dos diligentes enriquece.”
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">Provérbios 10:4</p>
        </div>
      </div>
    </div>
  );
}
