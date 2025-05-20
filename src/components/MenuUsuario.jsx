import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function MenuUsuario({ usuario, perfil }) {
  const [abierto, setAbierto] = useState(false);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="relative z-50">
      {/* Botón hamburguesa */}
      <button
        onClick={() => setAbierto(true)}
        className="block text-white focus:outline-none w-full sm:w-auto"
      >
        <div className="flex items-center gap-2 justify-start">
          <span className="hidden sm:inline">
            {usuario
              ? `👋 Hola, ${perfil?.nick || "Usuario"}`
              : "👋 Bienvenido"}
          </span>
          {usuario && perfil?.avatar ? (
            <img
              src={perfil.avatar}
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-white"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
              {usuario && perfil?.nick?.[0]
                ? perfil.nick[0].toUpperCase()
                : "≡"}
            </div>
          )}
        </div>
      </button>

      {/* Fondo oscurecido */}
      {abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-0 z-40"
          onClick={() => setAbierto(false)}
        ></div>
      )}

      {/* Menú lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
          ${abierto ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 border-b font-semibold text-gray-800">
          {usuario ? `👋 Hola, ${perfil?.nick || "Usuario"}` : "👋 Bienvenido"}
        </div>
        <ul className="p-4 space-y-4">
          {usuario ? (
            <>
              <li>
                <Link
                  to="/preferencias"
                  onClick={() => setAbierto(false)}
                  className="block text-gray-800 hover:text-blue-600"
                >
                  Preferencias
                </Link>
              </li>
              <li>
                <button
                  onClick={cerrarSesion}
                  className="text-left w-full text-red-600 hover:text-red-700"
                >
                  Cerrar sesión
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                to="/login"
                onClick={() => setAbierto(false)}
                className="block text-blue-600 hover:text-blue-800"
              >
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
