import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "phosphor-react";

export default function Cadastro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();
    setErro("");

    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, senha);

      // cria documento do usuário no Firestore
      await setDoc(doc(db, "usuarios", userCred.user.uid), {
        email,
        criadoEm: new Date(),
      });

      navigate("/lancamentos");
    } catch (error) {
      setErro("Erro ao cadastrar: " + (error?.message || "tente novamente"));
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
          <h1 className="text-3xl font-semibold text-white">Criar conta</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Comece agora e organize suas finanças em um só lugar
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleCadastro}
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
            />

            <input
              type="password"
              placeholder="Senha"
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirmar senha"
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="mt-4 text-sm text-red-500">{erro}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-black transition hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Criando..." : "Criar conta"}
            <ArrowRight size={18} />
          </button>

          <p className="mt-4 text-center text-sm text-zinc-400">
            Já tem conta?{" "}
            <Link
              to="/login"
              className="text-white underline underline-offset-4 hover:opacity-90"
            >
              Entrar
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