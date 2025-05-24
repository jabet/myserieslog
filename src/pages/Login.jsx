import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Login() {
  const [modo, setModo] = useState("login"); // 'login' o 'registro'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Si ya está logueado, redirigir
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/");
    });
  }, [navigate]);

  // Handler para login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Correo o contraseña incorrectos.");
    } else {
      navigate("/");
    }
  };

  // Handler para registro
  const handleRegistro = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Error al registrar usuario.");
    } else {
      setModo("login");
      navigate("/");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white shadow p-6 rounded w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {modo === "login" ? "Iniciar sesión" : "Registrarse"}
          </h2>

          {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

          <form onSubmit={modo === "login" ? handleLogin : handleRegistro}>
            <label className="block mb-2 text-sm">Correo electrónico</label>
            <input
              type="email"
              className="w-full p-2 border rounded mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />

            <label className="block mb-2 text-sm">Contraseña</label>
            <input
              type="password"
              className="w-full p-2 border rounded mb-4"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              {modo === "login" ? "Entrar" : "Registrarse"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            {modo === "login" ? (
              <>
                ¿No tienes cuenta?{" "}
                <button
                  onClick={() => setModo("registro")}
                  className="text-blue-600 underline"
                >
                  Regístrate
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  onClick={() => setModo("login")}
                  className="text-blue-600 underline"
                >
                  Inicia sesión
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
