import { House, ChartLine, Target, User, Receipt, SignOut, BookOpen } from "phosphor-react";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";

export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    { path: "/home", icon: House, label: "Início", id: "home" },
    { path: "/diagnostico", icon: ChartLine, label: "Diagnóstico", id: "diagnostico" },
    { path: "/lancamentos", icon: Receipt, label: "Lançamentos", id: "lancamentos" },
    { path: "/plano", icon: Target, label: "Plano", id: "plano" },
    { path: "/artigos", icon: BookOpen, label: "Artigos", id: "artigos" },
    { path: "/perfil", icon: User, label: "Perfil", id: "perfil" },
  ];

  const isActive = (path) => pathname === path;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-surface-highest dark:bg-surface-low border-r border-default p-6 z-50 transition-colors duration-300">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-black text-on-surface tracking-tighter uppercase">ZoeFinan</h1>
        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.2em]">Sua Saúde Financeira</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const ActiveIcon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${
                active
                  ? "bg-on-surface text-surface-lowest dark:bg-white dark:text-black shadow-lg"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-high dark:hover:bg-surface-highest"
              }`}
            >
              <ActiveIcon size={22} weight={active ? "fill" : "regular"} />
              <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-default">
        <button
          onClick={() => auth.signOut()}
          className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/5 transition-all group"
        >
          <SignOut size={22} />
          <span className="text-sm font-bold uppercase tracking-widest">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
