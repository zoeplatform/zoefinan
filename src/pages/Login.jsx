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
    <div className="min-h-screen flex items-center justify-center bg-surface px-6 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Identidade / Glow */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 h-28 w-28 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 shadow-xl" />
          <h1 className="text-3xl font-black text-on-surface tracking-tighter uppercase">ZoeFinan</h1>
          <p className="mt-2 text-sm text-on-surface-variant font-medium">
            Acesse sua conta e acompanhe suas finanças
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="rounded-[32px] bg-surface-lowest dark:bg-surface-high border border-default p-8 shadow-xl dark:shadow-none transition-all duration-300"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full rounded-2xl bg-surface-low dark:bg-black/10 border border-default px-4 py-4 text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-strong transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-2xl bg-surface-low dark:bg-black/10 border border-default px-4 py-4 text-on-surface placeholder:text-on-surface-disabled focus:outline-none focus:border-strong transition-all"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {erro && (
            <div className="mt-4 p-3 rounded-xl bg-error-bg border border-error/20 text-xs text-error font-bold text-center animate-in fade-in slide-in-from-top-1">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-on-surface text-surface-lowest dark:bg-white dark:text-black py-4 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[0.98] active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar na Conta"}
            {!loading && <ArrowRight size={18} weight="bold" />}
          </button>

          {/* Botão/Link para Cadastro */}
          <div className="mt-8 pt-6 border-t border-default text-center">
            <p className="text-sm text-on-surface-variant">
              Não tem uma conta?{" "}
              <Link
                to="/cadastro"
                className="text-on-surface font-black uppercase text-xs tracking-widest hover:underline underline-offset-4"
              >
                Criar agora
              </Link>
            </p>
          </div>
        </form>

        {/* Rodapé */}
        <p className="mt-8 text-center text-[10px] font-black text-on-surface-disabled uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} ZoeFinan • Versão 1.1.0
        </p>
      </div>
    </div>
  );
}
