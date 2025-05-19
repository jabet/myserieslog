import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Buscador from "./Buscador";
import React from "react";
import MenuUsuario from "./MenuUsuario";

export default function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nick, avatar")
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
    <nav className="bg-gray-900 text-white px-6 py-3 shadow fixed top-0 w-full z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="text-xl font-bold">
          <Link to="/" alt="My Series Log">
            My Series Log
          </Link>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-1/2">
          <Buscador />
        </div>

        {/* Usuario */}
        <div className="hidden md:flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm hidden sm:inline">
                Hola{perfil?.nick ? `, ${perfil.nick}` : ""} 👋
              </span>
              <Link
                to="/preferencias"
                className="text-sm hover:underline hidden sm:inline"
              >
                Preferencias
              </Link>
              <button
                onClick={cerrarSesion}
                className="text-sm hidden sm:inline"
              >
                Cerrar sesión
              </button>
              {perfil?.avatar ? (
                <img
                  src={perfil.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                  {perfil?.nick?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="text-sm hover:underline">
              Iniciar sesión
            </Link>
          )}
        </div>

        {/* Menú lateral en móvil */}
        {usuario && (
          <div className="md:hidden">
            <MenuUsuario usuario={usuario} perfil={perfil} />
          </div>
        )}
      </div>
    </nav>
  );
}
