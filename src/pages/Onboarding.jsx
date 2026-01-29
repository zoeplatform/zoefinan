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
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Background animado */}
      <div className="pointer-events-none absolute inset-0">
        {/* Orbes secundários */}
        <div className="absolute -top-24 -left-28 h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-28 -right-20 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />

        {/* ORBE PRINCIPAL ANIMADO */}
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2">
          <div className="h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/70 via-purple-500/55 to-blue-500/55 opacity-70 blur-[2px] animate-orb" />
          <div className="absolute inset-0 rounded-full bg-black/40 blur-2xl" />
        </div>

        {/* Linhas decorativas */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[-10%] top-[12%] h-[2px] w-[70%] rotate-12 bg-white/20 blur-[0.5px]" />
          <div className="absolute right-[-15%] top-[32%] h-[2px] w-[75%] -rotate-12 bg-white/15 blur-[0.5px]" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 pt-8 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            ZoeFinan
          </h1>

          <button
            onClick={pular}
            className="text-sm text-white/70 hover:text-white transition"
          >
            Pular
          </button>
        </div>

        {/* Texto */}
        <div className="flex-1 flex items-end">
          <div className="w-full max-w-md pb-10">
            <h2 className="text-[28px] leading-tight font-semibold text-white">
              {slides[slide].titulo}
              <br />
              <span className="text-white/90">
                {slides[slide].destaque}
              </span>
            </h2>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {slides[slide].texto}
            </p>
          </div>
        </div>

        {/* Indicadores + Botão */}
        <div>
          <div className="flex justify-center gap-2 mb-5">
            {slides.map((_, index) => (
              <span
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === slide
                    ? "bg-white w-6"
                    : "bg-white/25 w-2"
                }`}
              />
            ))}
          </div>

          <button onClick={avancar} className="onboarding__next">
            <span className="font-semibold">
              {isLast ? "Vamos começar" : "Próximo"}
            </span>
            <span className="onboarding__nextArrow">→</span>
          </button>

          <p className="mt-4 text-center text-xs text-white/50">
            Ao continuar, você inicia sua jornada financeira.
          </p>
        </div>
      </div>
    </div>
  );
}