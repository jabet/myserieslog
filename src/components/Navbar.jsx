import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Buscador from "./Buscador";

export default function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nick")
          .eq("id", user.id)
          .single();
        setPerfil(data);
      }
    });
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 items-center justify-between shadow fixed top-0 w-full z-50 grid grid-cols-3">
      <div className="text-xl font-bold">
        <Link to="/" alt="My Series Log; track your series, films and animes">
          My Series Log
        </Link>
      </div>
      <div className="col-span-2 flex justify-end items-center gap-4">
        {usuario ? (
          <>
            <span className="text-sm text-gray-300">
              Hola{perfil?.nick ? `, ${perfil.nick}` : ""} 👋
            </span>
            <Link to="/preferencias" className="text-sm text-white hover:underline">
              Preferencias
            </Link>
            <button onClick={cerrarSesion} className="text-sm">
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-white hover:underline">
            Iniciar sesión
          </Link>
        )}
        <Buscador />
      </div>
    </nav>
  );
}
