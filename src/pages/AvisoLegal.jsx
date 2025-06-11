import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function AvisoLegal() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-sky-900">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Aviso Legal</h1>
        <p className="mb-4">
          Este sitio web, <span className="font-semibold">My Series Log</span>, destinado a la organización y seguimiento de series y películas por parte de sus usuarios.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Titularidad</h2>
        <p className="mb-4">
          Titular: <span className="font-semibold">My Series Log</span><br />
          Contacto: Puedes escribirnos desde la página de <Link to="/contacto" className="text-amber-400 hover:underline">Contacto</Link>.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Propiedad intelectual</h2>
        <p className="mb-4">
          El diseño, logotipo y código fuente de la web son propiedad de sus autores. Las imágenes y datos de series y películas pueden provenir de fuentes externas como TMDb y son propiedad de sus respectivos titulares.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Condiciones de uso</h2>
        <p className="mb-4">
          El uso de esta web implica la aceptación de la <Link to="/privacidad" className="text-amber-400 hover:underline">Política de Privacidad</Link> y la <Link to="/cookies" className="text-amber-400 hover:underline">Política de Cookies</Link>.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Responsabilidad</h2>
        <p className="mb-4">
          No nos hacemos responsables del uso indebido de la web ni de los contenidos generados por los usuarios.
        </p>
        <p className="mt-8 text-sm text-slate-300">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </main>
      <Footer />
    </div>
  );
}