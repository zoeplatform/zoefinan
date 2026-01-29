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
    <div className="min-h-screen bg-black px-6 pt-8 pb-24 relative overflow-hidden">
      {/* Glow discreto (consistência visual) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/35 via-purple-500/25 to-blue-500/25 blur-2xl opacity-60" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/home")}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-[0.98] transition"
            aria-label="Voltar"
            type="button"
          >
            <ArrowLeft size={18} className="text-white/85" />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              Educação
            </h1>
            <p className="text-xs text-white/55">
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
              className="w-full text-left rounded-2xl bg-zinc-900/80 border border-white/10 p-5 active:scale-[0.99] transition"
              type="button"
              aria-label={`Abrir artigo: ${a.titulo}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white/70">
                    {a.categoria}
                  </span>

                  <h2 className="mt-3 text-[17px] font-semibold text-white leading-snug">
                    {a.titulo}
                  </h2>

                  <p className="mt-2 text-sm text-white/60 leading-relaxed line-clamp-2">
                    {a.resumo}
                  </p>
                </div>

                <div className="mt-1 flex items-center text-white/70">
                  <CaretRight size={18} />
                </div>
              </div>

              <div className="mt-4 text-sm font-semibold text-white/85">
                Ler artigo
              </div>
            </button>
          ))}
        </div>

        {/* Dica do dia (mais clean) */}
        <div className="mt-8 rounded-2xl bg-zinc-900/80 border border-white/10 p-5">
          <h3 className="font-semibold text-white">Dica do dia 💡</h3>
          <p className="mt-2 text-sm text-white/60 leading-relaxed">
            “O que trabalha com mão remissa empobrece, mas a mão dos diligentes enriquece.”
          </p>
          <p className="mt-2 text-xs text-white/45">Provérbios 10:4</p>
        </div>
      </div>
    </div>
  );
}