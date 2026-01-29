// src/pages/Artigo.jsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "phosphor-react";

const artigos = [
  {
    id: "1",
    categoria: "Mentalidade",
    titulo: "O perigo das dívidas",
    tempo: "4 min de leitura",
    verso: { texto: "O rico domina sobre os pobres; o que toma emprestado é servo do que empresta.", ref: "Provérbios 22:7" },
    conteudo: [
      {
        tipo: "p",
        texto:
          "Dívida não é só um número: ela mexe com sua paz, suas escolhas e até sua identidade. Quando o orçamento fica apertado, a ansiedade aumenta e qualquer imprevisto vira uma crise.",
      },
      { tipo: "h2", texto: "Por que a dívida é tão perigosa?" },
      {
        tipo: "ul",
        itens: [
          "Ela reduz sua liberdade: parte do seu mês já está comprometida.",
          "Ela corrói sua paz: a mente fica presa no “como vou pagar?”.",
          "Ela impede progresso: sobra pouco (ou nada) para construir reserva e investir.",
        ],
      },
      {
        tipo: "blockquote",
        texto:
          "Dívida é um tipo de “barulho” financeiro: mesmo quando você não está pensando nela, ela está lá consumindo energia.",
      },
      { tipo: "h2", texto: "O que fazer na prática" },
      {
        tipo: "p",
        texto:
          "Comece pelo simples: liste todas as dívidas (credor, saldo, parcela e juros). Depois, pare de criar novas dívidas — isso é essencial. Em seguida, escolha uma estratégia (menor saldo primeiro ou maior juros primeiro) e ataque com consistência.",
      },
      { tipo: "h3", texto: "Uma regra que ajuda" },
      {
        tipo: "p",
        texto:
          "Se você tem saldo livre, direcione uma parte para acelerar o pagamento das dívidas. O objetivo é ganhar fôlego rápido e reduzir parcelas mensais.",
      },
      { tipo: "hr" },
      {
        tipo: "callout",
        titulo: "Aplicação rápida",
        texto:
          "Hoje, escolha 1 dívida e faça uma ação concreta: negociar taxa, antecipar parcela, ou definir um valor fixo extra por mês.",
      },
    ],
  },
  {
    id: "2",
    categoria: "Planejamento",
    titulo: "Reserva de emergência",
    tempo: "5 min de leitura",
    verso: { texto: "O prudente vê o mal e esconde-se; mas os simples passam e sofrem a pena.", ref: "Provérbios 22:3" },
    conteudo: [
      {
        tipo: "p",
        texto:
          "Reserva de emergência é o que separa um imprevisto comum de um desastre financeiro. Ela te protege quando o inesperado acontece: doença, desemprego, conserto, queda de renda.",
      },
      { tipo: "h2", texto: "Qual é a meta ideal?" },
      {
        tipo: "p",
        texto:
          "Uma boa referência é guardar entre 3 e 6 meses do seu custo de vida. Se sua renda é instável, mire mais alto. Se é bem estável, 3 meses já melhora muito sua segurança.",
      },
      { tipo: "h2", texto: "Como construir sem sofrimento" },
      {
        tipo: "ul",
        itens: [
          "Defina um valor mensal automático (ex.: 10% da renda).",
          "Comece pequeno, mas comece: R$ 50–100 por mês já cria hábito.",
          "Deixe separado (não misture com conta do dia a dia).",
        ],
      },
      {
        tipo: "blockquote",
        texto:
          "Reserva não é luxo. É estrutura. Ela compra tranquilidade e tempo para decidir com sabedoria.",
      },
      { tipo: "callout", titulo: "Aplicação rápida", texto: "Abra uma conta separada (ou caixinha) e programe um depósito automático para todo mês." },
    ],
  },
  {
    id: "3",
    categoria: "Ação",
    titulo: "Como renegociar dívidas",
    tempo: "6 min de leitura",
    verso: { texto: "Os planos do diligente tendem à abundância, mas a pressa excessiva, à pobreza.", ref: "Provérbios 21:5" },
    conteudo: [
      { tipo: "p", texto: "Renegociar não é “dar calote”. É organizar a casa para pagar de forma possível, com menos juros e mais previsibilidade." },
      { tipo: "h2", texto: "Antes de negociar, prepare isso" },
      { tipo: "ul", itens: ["Quanto você pode pagar por mês (valor realista).", "Quanto é o saldo total e quais são os juros.", "O que você quer: desconto à vista, redução de juros, parcelamento menor."] },
      { tipo: "h2", texto: "Durante a negociação" },
      { tipo: "p", texto: "Seja objetivo e peça proposta por escrito. Compare cenários (à vista vs parcelado). Se a parcela proposta apertar demais, você volta ao ciclo de endividamento." },
      { tipo: "blockquote", texto: "A melhor negociação é a que cabe no seu mês — não a que parece bonita no papel." },
      { tipo: "callout", titulo: "Aplicação rápida", texto: "Escolha 1 credor hoje e peça: (1) desconto à vista e (2) opção parcelada com menor juros. Compare e decida." },
    ],
  },
];

export default function Artigo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const artigo = useMemo(
    () => artigos.find((a) => a.id === String(id)),
    [id]
  );

  if (!artigo) {
    return (
      <div className="min-h-screen bg-black px-6 pt-8 pb-24 text-white/70">
        <button
          onClick={() => navigate("/artigos")}
          className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-[0.98] transition"
          type="button"
          aria-label="Voltar"
        >
          <ArrowLeft size={18} className="text-white/85" />
        </button>
        <p className="mt-6">Artigo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 pt-8 pb-24 relative overflow-hidden">
      {/* Glow discreto (igual ao resto) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute left-1/2 top-[18%] -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-gradient-to-b from-orange-400/35 via-purple-500/25 to-blue-500/25 blur-2xl opacity-60" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/artigos")}
            className="h-10 w-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center active:scale-[0.98] transition"
            aria-label="Voltar"
            type="button"
          >
            <ArrowLeft size={18} className="text-white/85" />
          </button>

          <h1 className="text-3xl font-semibold text-white">ZoeFinan</h1>
        </div>

        {/* Conteúdo em “bloco” */}
        <article className="rounded-2xl bg-zinc-900/80 border border-white/10 p-6 prose-article">
          <h1>{artigo.titulo}</h1>

          {/* Versículo em destaque */}
          <blockquote>
            <p>“{artigo.verso.texto}”</p>
            <p className="muted mt-2">{artigo.verso.ref}</p>
          </blockquote>

          {artigo.conteudo.map((b, idx) => {
            if (b.tipo === "h2") return <h2 key={idx}>{b.texto}</h2>;
            if (b.tipo === "h3") return <h3 key={idx}>{b.texto}</h3>;
            if (b.tipo === "p") return <p key={idx}>{b.texto}</p>;
            if (b.tipo === "hr") return <hr key={idx} />;
            if (b.tipo === "ul")
              return (
                <ul key={idx}>
                  {b.itens.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              );
            if (b.tipo === "blockquote")
              return (
                <blockquote key={idx}>
                  <p>{b.texto}</p>
                </blockquote>
              );
            if (b.tipo === "callout")
              return (
                <div key={idx} className="callout">
                  <div className="callout-title">{b.titulo}</div>
                  <div className="callout-text">{b.texto}</div>
                </div>
              );
            return null;
          })}
        </article>

        <button
          onClick={() => navigate("/artigos")}
          className="mt-5 w-full rounded-2xl bg-white text-black p-4 font-semibold active:scale-[0.99] transition"
          type="button"
        >
          Voltar para Educação
        </button>
      </div>
    </div>
  );
}