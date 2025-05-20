import { Link } from "react-router-dom";
import Buscador from "./Buscador";
import React from "react";
import MenuUsuario from "./MenuUsuario";
import { useUsuarioPerfil } from "../hooks/hookUserProfile";

export default function Navbar() {
  const { usuario, perfil } = useUsuarioPerfil();

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 shadow fixed top-0 w-full z-50">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo */}
        <div className="text-xl font-bold">
          <Link to="/" alt="My Series Log">
            My Series Log
            <span className="text-amber-200 text-[8px] flex flex-col items-center justify-between">
              ALPHA
            </span>
          </Link>
        </div>

        {/* Buscador */}
        <div className="w-full md:w-1/2">
          <Buscador />
        </div>

        {/* Usuario */}
        <MenuUsuario usuario={usuario} perfil={perfil} />
      </div>
    </nav>
  );
}
