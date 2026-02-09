import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);

  const slides = useMemo(
    () => [
      {
        titulo: "Gerencie suas finanças.",
        destaque: "Controle suas economias.",
        texto:
          "Acompanhe seus gastos, organize sua rotina financeira e avance com clareza — sem complicação.",
      },
      {
        titulo: "Tenha visão clara.",
        destaque: "Decida melhor.",
        texto:
          "Em poucos minutos, você entende sua situação e monta um plano simples para evoluir mês a mês.",
      },
      {
        titulo: "Tudo pronto.",
        destaque: "Vamos começar?",
        texto:
          "Crie sua conta ou entre para iniciar sua jornada rumo à saúde financeira agora mesmo.",
      },
    ],
    []
  );

  const isLast = slide === slides.length - 1;

  function avancar() {
    if (!isLast) setSlide((s) => s + 1);
    else navigate("/login");
  }

  function pular() {
    navigate("/login");
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-surface transition-colors duration-300">
      {/* Background animado */}
      <div className="pointer-events-none absolute inset-0">
        {/* Orbes secundários */}
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-surface-high dark:bg-surface-highest blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full bg-surface-high dark:bg-surface-highest blur-3xl" />

        {/* ORBE PRINCIPAL ANIMADO */}
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2">
          <div className="h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/70 via-purple-500/55 to-blue-500/55 opacity-70 blur-[2px] animate-orb" />
          <div className="absolute inset-0 rounded-full bg-surface/40 blur-2xl" />
        </div>

        {/* Linhas decorativas */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[-10%] top-[12%] h-[2px] w-[70%] rotate-12 bg-on-surface/10 blur-[0.5px]" />
          <div className="absolute right-[-15%] top-[32%] h-[2px] w-[75%] -rotate-12 bg-on-surface/15 blur-[0.5px]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-8 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tighter text-on-surface uppercase">
            ZoeFinan
          </h1>

          <button
            onClick={pular}
            className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition"
          >
            Pular
          </button>
        </div>

        {/* Texto */}
        <div className="flex-1 flex items-end">
          <div className="w-full max-w-md pb-10">
            <h2 className="text-[32px] leading-tight font-black text-on-surface tracking-tighter uppercase">
              {slides[slide].titulo}
              <br />
              <span className="text-on-surface-variant">
                {slides[slide].destaque}
              </span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-on-surface-medium font-medium">
              {slides[slide].texto}
            </p>
          </div>
        </div>

        {/* Indicadores + Botão */}
        <div>
          <div className="flex justify-center gap-2 mb-8">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === slide
                    ? "bg-on-surface w-8"
                    : "bg-on-surface-disabled w-2"
                }`}
              />
            ))}
          </div>

          <button 
            onClick={avancar} 
            className="w-full py-5 rounded-[24px] bg-on-surface text-surface-lowest dark:bg-white dark:text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:scale-[0.98] active:scale-95 transition-all"
          >
            <span>
              {isLast ? "Vamos começar" : "Próximo Passo"}
            </span>
            <span className="text-lg">→</span>
          </button>

          <p className="mt-6 text-center text-[10px] font-black text-on-surface-disabled uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} ZoeFinan • Jornada Financeira
          </p>
        </div>
      </div>
    </div>
  );
}
