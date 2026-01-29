import { House, ChartLine, Target, User, Receipt } from "phosphor-react";
import { Link } from "react-router-dom";

export default function BottomNav({ active }) {
  const isActive = (key) => active === key;

  const itemClass = (key) =>
    [
      "grid place-items-center h-11 w-11 rounded-2xl transition",
      isActive(key)
        ? "bg-white text-black"
        : "text-white/70 hover:text-white hover:bg-white/10",
    ].join(" ");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-xl px-6 pb-6">
        <div className="rounded-3xl border border-white/12 bg-black/60 backdrop-blur p-3 flex justify-around">
          <Link to="/home" className={itemClass("home")} aria-label="Home">
            <House size={22} />
          </Link>

          <Link
            to="/diagnostico"
            className={itemClass("diagnostico")}
            aria-label="Diagnóstico"
          >
            <ChartLine size={22} />
          </Link>

          <Link
            to="/lancamentos"
            className={itemClass("lancamentos")}
            aria-label="Lançamentos"
          >
            <Receipt size={22} />
          </Link>

          <Link to="/plano" className={itemClass("plano")} aria-label="Plano">
            <Target size={22} />
          </Link>

          <Link to="/perfil" className={itemClass("perfil")} aria-label="Perfil">
            <User size={22} />
          </Link>
        </div>
      </div>
    </nav>
  );
}