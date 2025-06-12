import { Link, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useUsuario from "../hooks/useUsuario";

export default function LandingPage() {
  const { usuario, loading } = useUsuario();

  if (loading) return null; // O un loader si prefieres

  if (usuario) {
    return <Navigate to="/catalogo" replace />;
  }

  return (
    <>
      <title>My Series Log - Organiza tus series y películas</title>
      <meta
        name="description"
        content="Organiza, puntúa y sigue tus series y películas favoritas. Descubre novedades, controla episodios vistos y comparte tu catálogo con amigos."
      />
      <div className="min-h-screen grid-rows-[auto_1fr_auto] flex flex-col bg-gradient-to-b from-slate-900 to-sky-900">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-center">
            My Series Log
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-2xl text-center">
            Organiza, puntúa y sigue tus series y películas favoritas.
            <br />
            Descubre novedades, lleva el control de tus episodios vistos y
            comparte tu catálogo con amigos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold px-8 py-3 rounded shadow transition"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/login"
              state={{ modo: "registro" }}
              className="bg-white hover:bg-gray-100 text-slate-900 font-semibold px-8 py-3 rounded shadow transition"
            >
              Crear cuenta gratis
            </Link>
          </div>
          <div className="mt-12 max-w-2xl text-center text-slate-200 text-base">
            <h2 className="text-xl font-bold mb-2">¿Qué puedes hacer?</h2>
            <ul className="space-y-2">
              <li>
                ⭐ Llevar el control de tus series y películas vistas y
                pendientes.
              </li>
              <li>⭐ Puntuar y dejar tu opinión sobre cada título.</li>
              <li>⭐ Recibir avisos de próximos estrenos y episodios.</li>
              <li>⭐ Compartir tu catálogo con amigos.</li>
              <li>⭐ ¡Y mucho más!</li>
            </ul>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
