// src/components/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Buscador from "./Buscador";
import useUsuario from "../hooks/useUsuario";
import React from "react";
import NotificacionesBell from "./NotificacionesBell";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import MenuLateralUsuario from "./MenuLateralUsuario";

export default function Navbar() {
  const { usuario, perfil, esAdmin, loading } = useUsuario();
  const [menuOpen, setMenuOpen] = useState(false);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <nav className="w-full bg-gradient-to-b from-slate-900 to-sky-900 text-white py-4 px-6 flex items-center justify-between">
        <span>Cargando...</span>
      </nav>
    );
  }

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
            <span className="text-amber-300 text-[0.5em] flex flex-col items-center justify-between">
              ALPHA
            </span>
          </Link>
          <div className="w-full mt-2 md:hidden px-4">
            <Buscador />
          </div>
        </div>

        {/* Desktop links and user dropdown */}
        <div className="hidden md:flex items-center gap-4">
          <div className="w-64">
            <Buscador />
          </div>
          {usuario ? (
            <>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-sm hover:underline flex items-center gap-1 font-medium">
                    {perfil?.nick ? `Hola, ${perfil.nick}` : "Mi cuenta"} ▼
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    sideOffset={8}
                    className="min-w-[180px] bg-white rounded shadow-lg py-2 text-gray-900 z-50"
                  >
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/perfil"
                        className="block px-4 py-2 hover:bg-sky-100"
                      >
                        Perfil
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/opciones"
                        className="block px-4 py-2 hover:bg-sky-100"
                      >
                        Opciones
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/social"
                        className="block px-4 py-2 hover:bg-sky-100"
                      >
                        Social
                      </Link>
                    </DropdownMenu.Item>
                    {esAdmin && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/admin"
                          className="block px-4 py-2 hover:bg-sky-100"
                        >
                          Admin
                        </Link>
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                    <DropdownMenu.Item asChild>
                      <button
                        onClick={cerrarSesion}
                        className="block w-full text-left px-4 py-2 hover:bg-sky-100"
                      >
                        Cerrar sesión
                      </button>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
              <div className="relative">
                <NotificacionesBell usuario={usuario} />
              </div>
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
          {usuario ? (
            <>
              <li>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="text-sm hover:underline flex items-center gap-1 font-medium w-full text-left">
                      {perfil?.nick ? `Hola, ${perfil.nick}` : "Mi cuenta"} ▼
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={8}
                      className="min-w-[180px] bg-white rounded shadow-lg py-2 text-gray-900 z-50"
                    >
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/perfil"
                          className="block px-4 py-2 hover:bg-sky-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          Perfil
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/opciones"
                          className="block px-4 py-2 hover:bg-sky-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          Opciones
                        </Link>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/social"
                          className="block px-4 py-2 hover:bg-sky-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          Social
                        </Link>
                      </DropdownMenu.Item>
                      {esAdmin && (
                        <DropdownMenu.Item asChild>
                          <Link
                            to="/admin"
                            className="block px-4 py-2 hover:bg-sky-100"
                            onClick={() => setMenuOpen(false)}
                          >
                            Admin
                          </Link>
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
                      <DropdownMenu.Item asChild>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            cerrarSesion();
                          }}
                          className="block w-full text-left px-4 py-2 hover:bg-sky-100"
                        >
                          Cerrar sesión
                        </button>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </li>
              <li>
                <div className="relative">
                  <NotificacionesBell usuario={usuario} />
                </div>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Iniciar sesión
              </Link>
            </li>
          )}
        </ul>
      </div>

      <MenuLateralUsuario
        usuario={usuario}
        perfil={perfil}
        abierto={menuOpen}
        setAbierto={setMenuOpen}
      />
    </>
  );
}
