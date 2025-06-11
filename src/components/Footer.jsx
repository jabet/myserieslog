import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 py-6 px-4 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-sm">
        <div>© {new Date().getFullYear()} My Series Log. Icons by{" "}<a target="_blank" rel="nofollow" href="https://icons8.com" className="text-amber-400 hover:underline">Icons8</a>.</div>
        <div className="flex flex-wrap gap-4">
          <Link to="/privacidad" className="hover:underline">
            Política de Privacidad
          </Link>
          <Link to="/cookies" className="hover:underline">
            Política de Cookies
          </Link>
          <Link to="/aviso-legal" className="hover:underline">
            Aviso Legal
          </Link>
          <Link to="/contacto" className="hover:underline">
            Contacto
          </Link>
        </div>
      </div>
    </footer>
  );
}
