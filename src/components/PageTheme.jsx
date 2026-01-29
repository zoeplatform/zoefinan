import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ROUTE_THEME = [
  { match: (p) => p === "/" || p.startsWith("/login") || p.startsWith("/cadastro"), theme: "theme-auth" },
  { match: (p) => p.startsWith("/home"), theme: "theme-home" },
  { match: (p) => p.startsWith("/analytics"), theme: "theme-analytics" },
  { match: (p) => p.startsWith("/renda"), theme: "theme-renda" },
  { match: (p) => p.startsWith("/despesas"), theme: "theme-despesas" },
  { match: (p) => p.startsWith("/dividas"), theme: "theme-dividas" },
  { match: (p) => p.startsWith("/diagnostico"), theme: "theme-diagnostico" },
  { match: (p) => p.startsWith("/plano"), theme: "theme-plano" },
  { match: (p) => p.startsWith("/artigos") || p.startsWith("/artigo"), theme: "theme-artigos" },
];

function getTheme(pathname) {
  return ROUTE_THEME.find((r) => r.match(pathname))?.theme ?? "theme-default";
}

export default function PageTheme({ children }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const body = document.body;

    // remove qualquer theme-... anterior
    body.classList.forEach((c) => {
      if (c.startsWith("theme-")) body.classList.remove(c);
    });

    body.classList.add(getTheme(pathname));
  }, [pathname]);

  return children;
}