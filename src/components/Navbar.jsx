import Buscador from "./Buscador";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function Navbar() {
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 items-center justify-between shadow fixed top-0 w-full z-50 grid grid-cols-3">
      <div className="text-xl font-bold">
        <a href="/" alt="My Series Log; track you seies, films and animes">
          My Series Log
        </a>
      </div>
      <div className="col-span-2 flex justify-end items-center">
        <Link to="/preferencias" className="text-sm text-white hover:underline">
          Preferencias
        </Link>
        <button onClick={cerrarSesion} className="ml-4 mr-4 text-sm">
          Cerrar sesión
        </button>

        <Buscador />
      </div>
    </nav>
  );
}
