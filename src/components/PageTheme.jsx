import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const ROUTE_THEME = [
  { match: (p) => p === "/" || p.startsWith("/login") || p.startsWith("/cadastro") || p.startsWith("/setup"), theme: "theme-auth" },
  { match: (p) => p.startsWith("/home"), theme: "theme-home" },
  { match: (p) => p.startsWith("/analytics"), theme: "theme-analytics" },
  { match: (p) => p.startsWith("/renda"), theme: "theme-renda" },
  { match: (p) => p.startsWith("/despesas"), theme: "theme-despesas" },
  { match: (p) => p.startsWith("/dividas"), theme: "theme-dividas" },
  { match: (p) => p.startsWith("/diagnostico"), theme: "theme-diagnostico" },
  { match: (p) => p.startsWith("/plano"), theme: "theme-plano" },
  { match: (p) => p.startsWith("/artigos") || p.startsWith("/artigo"), theme: "theme-artigos" },
  { match: (p) => p.startsWith("/perfil"), theme: "theme-perfil" },
  { match: (p) => p.startsWith("/lancamentos"), theme: "theme-lancamentos" },
];

function getTheme(pathname) {
  return ROUTE_THEME.find((r) => r.match(pathname))?.theme ?? "theme-default";
}

export default function PageTheme({ children }) {
  const { pathname } = useLocation();
  const isAuthPage = ["/", "/login", "/cadastro", "/setup"].some(path => pathname === path || (path !== "/" && pathname.startsWith(path)));
  
  // Mapeamento de rotas para o BottomNav
  const getActiveTab = (path) => {
    if (path.startsWith("/home")) return "home";
    if (path.startsWith("/diagnostico")) return "diagnostico";
    if (path.startsWith("/lancamentos")) return "lancamentos";
    if (path.startsWith("/plano")) return "plano";
    if (path.startsWith("/perfil")) return "perfil";
    return "";
  };

  useEffect(() => {
    const body = document.body;
    body.classList.forEach((c) => {
      if (c.startsWith("theme-")) body.classList.remove(c);
    });
    body.classList.add(getTheme(pathname));
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-black">
      {!isAuthPage && <Sidebar />}
      <main className={`flex-1 w-full ${!isAuthPage ? "md:pb-0" : ""}`}>
        {children}
      </main>
      {!isAuthPage && (
        <div className="md:hidden">
          <BottomNav active={getActiveTab(pathname)} />
        </div>
      )}
    </div>
  );
}
