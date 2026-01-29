import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "phosphor-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      navigate("/home");
    } catch (error) {
      setErro("Email ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <div className="w-full max-w-md">
        {/* Identidade / Glow */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 h-28 w-28 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600" />
          <h1 className="text-3xl font-semibold text-white">ZoeFinan</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Acesse sua conta e acompanhe suas finanças
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-2xl bg-zinc-900 p-6 shadow-lg"
        >
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-black transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
            <ArrowRight size={18} />
          </button>

          {/* Botão/Link para Cadastro */}
          <p className="mt-4 text-center text-sm text-zinc-400">
            Não tem conta?{" "}
            <Link
              to="/cadastro"
              className="text-white underline underline-offset-4 hover:opacity-90"
            >
              Criar agora
            </Link>
          </p>
        </form>

        {/* Rodapé */}
        <p className="mt-6 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} ZoeFinance
        </p>
      </div>
    </div>
  );
}