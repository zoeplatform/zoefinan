import { House, ChartLine, Target, User, Receipt } from "phosphor-react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path) => pathname === path;

  const itemClass = (path) =>
    [
      "grid place-items-center h-11 w-11 rounded-2xl transition-all duration-300",
      isActive(path)
        ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black shadow-md scale-110"
        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-high dark:hover:bg-surface-highest",
    ].join(" ");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-xl px-6 pb-6">
        <div className="rounded-3xl border border-default bg-surface-lowest/90 dark:bg-surface-high/80 backdrop-blur-lg p-3 flex justify-around shadow-xl dark:shadow-none">
          <Link to="/home" className={itemClass("/home")} aria-label="Home">
            <House size={22} weight={isActive("/home") ? "fill" : "regular"} />
          </Link>

          <Link
            to="/diagnostico"
            className={itemClass("/diagnostico")}
            aria-label="Diagnóstico"
          >
            <ChartLine size={22} weight={isActive("/diagnostico") ? "fill" : "regular"} />
          </Link>

          <Link
            to="/lancamentos"
            className={itemClass("/lancamentos")}
            aria-label="Lançamentos"
          >
            <Receipt size={22} weight={isActive("/lancamentos") ? "fill" : "regular"} />
          </Link>

          <Link to="/plano" className={itemClass("/plano")} aria-label="Plano">
            <Target size={22} weight={isActive("/plano") ? "fill" : "regular"} />
          </Link>

          <Link to="/perfil" className={itemClass("/perfil")} aria-label="Perfil">
            <User size={22} weight={isActive("/perfil") ? "fill" : "regular"} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
