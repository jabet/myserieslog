// Login.jsx
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import Navbar from "../components/Navbar";

export default function Login() {
  const [email, setEmail] = useState("");
  const [session, setSession] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await supabase.auth.signIn({ email });
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!session) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 mt-20">
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
          <p className="mb-4">
            Por favor, ingresa tu correo electrónico para iniciar sesión.
          </p>
          <form
            className="flex flex-col items-center justify-center h-screen bg-gray-100"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              placeholder="Email"
              className="mb-4 p-2 border border-gray-300 rounded"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-blue-600 rounded-md pl-5 pr-5 p-2">
              Enviar
            </button>
          </form>
        </div>
      </>
    );
  } else {
    return <div>Logged in!</div>;
  }
}
