import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import useUsuario from "../hooks/useUsuario";

export default function MenuLateralUsuario({ abierto, setAbierto }) {
  const { usuario, perfil } = useUsuario();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
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
        <div className="p-4 border-b font-semibold text-gray-800 flex items-center justify-between">
          <span>
            {usuario ? `👋 Hola, ${perfil?.nick || "Usuario"}` : "👋 Bienvenido"}
          </span>
          <button
            onClick={() => setAbierto(false)}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        <ul className="p-4 space-y-4">
          <li>
            <Link
              to="/"
              onClick={() => setAbierto(false)}
              className="block text-gray-800 hover:text-blue-600"
            >
              Inicio
            </Link>
          </li>
          {usuario && (
            <li>
              <Link
                to="/perfil"
                onClick={() => setAbierto(false)}
                className="block text-gray-800 hover:text-blue-600"
              >
                Mi perfil
              </Link>
            </li>
          )}
          <li>
            <Link
              to="/catalogo"
              onClick={() => setAbierto(false)}
              className="block text-gray-800 hover:text-blue-600"
            >
              Catálogo
            </Link>
          </li>
          <li>
            <Link
              to="/pro"
              onClick={() => setAbierto(false)}
              className="block text-gray-800 hover:text-blue-600"
            >
              Ventajas PRO
            </Link>
          </li>
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
    </>
  );
}