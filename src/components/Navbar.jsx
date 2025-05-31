// src/components/Navbar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Buscador from "./Buscador";
import React from "react";

export default function Navbar() {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUsuario(user);
      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("nick,role")
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
    <>
      <nav className="bg-gradient-to-b from-slate-900 to-sky-900 text-white px-6 py-3 fixed top-0 w-full z-50 flex items-center">
        {/* Menu button */}
        <button
          className="md:hidden mr-4 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>

        {/* Centered logo and search */}
        <div className="flex-1 flex flex-col items-center xl:items-start">
          <Link to="/" className="text-xl font-bold">
            My Series Log
            <span className="text-amber-300 text-[0.5em]  flex flex-col items-center justify-between">
              ALPHA
            </span>
          </Link>
          <div className="w-full mt-2 md:hidden px-4">
            <Buscador />
          </div>
        </div>

        {/* Desktop links and search */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-64">
            <Buscador />
          </div>
          {usuario ? (
            <>
              <span className="text-sm text-gray-300">
                Hola{perfil?.nick ? `, ${perfil.nick}` : ""} 👋
              </span>
              <Link to="/preferencias" className="text-sm hover:underline">
                Preferencias
              </Link>
              <Link to="/social" className="text-sm hover:underline">
                Social
              </Link>
              {usuario && perfil?.role === "admin" && (
                <Link to="/admin" className="text-sm hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/perfil" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded">
  <span>👤</span>
  Mi Perfil
</Link>
              <button onClick={cerrarSesion} className="text-sm">
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm hover:underline">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile side menu */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform transition-transform duration-300 ease-in-out z-40
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between">
          <span className="text-lg font-bold">Menú</span>
          <button
            className="focus:outline-none"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <ul className="flex flex-col gap-4 px-4 mt-16">
          <li>
            <Link to="/" onClick={() => setMenuOpen(false)}>
              Inicio
            </Link>
          </li>
          {usuario && (
            <>
              <li>
                <Link to="/preferencias" onClick={() => setMenuOpen(false)}>
                  Preferencias
                </Link>
              </li>
              <li>
                <Link to="/social" onClick={() => setMenuOpen(false)}>
                  Social
                </Link>
              </li>
              {usuario && perfil?.role === "admin" && (
                <li>
                  <Link to="/admin" className="text-sm hover:underline">
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <button onClick={cerrarSesion} className="w-full text-left">
                  Cerrar sesión
                </button>
              </li>
            </>
          )}
          {!usuario && (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
