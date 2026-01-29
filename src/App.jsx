import { Routes, Route } from "react-router-dom";

import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";
import Analytics from "./pages/Analytics";
// import Renda from "./pages/Renda"; // Removido para unificação de fluxos
import Despesas from "./pages/Despesas";
import Dividas from "./pages/Dividas";
import Diagnostico from "./pages/Diagnostico";
import Plano from "./pages/Plano";
import Artigos from "./pages/Artigos";
import Artigo from "./pages/Artigo";
import Perfil from "./pages/Perfil";
import Lancamentos from "./pages/Lancamentos";
import PrivateRoute from "./components/PrivateRoute";
import PageTheme from "./components/PageTheme";

export default function App() {
  return (
    <PageTheme>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />

        {/* Rotas Privadas */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        {/* <Route path="/renda" element={<PrivateRoute><Renda /></PrivateRoute>} /> -- Removido */}
        <Route path="/despesas" element={<PrivateRoute><Despesas /></PrivateRoute>} />
        <Route path="/dividas" element={<PrivateRoute><Dividas /></PrivateRoute>} />
        <Route path="/diagnostico" element={<PrivateRoute><Diagnostico /></PrivateRoute>} />
        <Route path="/plano" element={<PrivateRoute><Plano /></PrivateRoute>} />
        <Route path="/artigos" element={<PrivateRoute><Artigos /></PrivateRoute>} />
        <Route path="/artigo/:id" element={<PrivateRoute><Artigo /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/lancamentos" element={<PrivateRoute><Lancamentos /></PrivateRoute>} />
      </Routes>
    </PageTheme>
  );
}