import Buscador from "./Buscador";
import { supabase } from "../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function Navbar() {
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between shadow fixed top-0 w-full z-50">
      <div className="text-xl font-bold">
        <a href="/">🎬 MiCatálogo</a>
      </div>
      <div className="w-1/2">
        <Link to="/preferencias" className="text-sm text-white hover:underline">
          Usuario
        </Link>
        <button onClick={cerrarSesion} className="ml-4 text-sm underline">
          Cerrar sesión
        </button>

        <Buscador />
      </div>
    </nav>
  );
}
