import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Privacidad() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-sky-900">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>
        <p className="mb-4">
          En <span className="font-semibold">My Series Log</span> nos tomamos muy en serio la privacidad de tus datos. A continuación te explicamos cómo tratamos tu información personal.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Qué datos recogemos?</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Datos de registro: email, nombre de usuario y contraseña.</li>
          <li>Preferencias de usuario y catálogo personal de series y películas.</li>
          <li>Datos técnicos de uso (cookies, logs de acceso, etc.).</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Para qué usamos tus datos?</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Para gestionar tu cuenta y tu catálogo personal.</li>
          <li>Para mejorar la experiencia de usuario y ofrecerte recomendaciones.</li>
          <li>Para enviarte notificaciones si así lo decides.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Compartimos tus datos?</h2>
        <p className="mb-4">
          No vendemos ni compartimos tus datos personales con terceros, salvo obligación legal o para el funcionamiento técnico de la plataforma.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Tus derechos</h2>
        <p className="mb-4">
          Puedes acceder, rectificar o eliminar tus datos en cualquier momento desde tu perfil o contactando con nosotros en la página de <Link to="/contacto" className="text-amber-400 hover:underline">Contacto</Link>.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Cookies</h2>
        <p className="mb-4">
          Utilizamos cookies técnicas para el funcionamiento de la web. Puedes consultar más detalles en nuestra <Link to="/cookies" className="text-amber-400 hover:underline">Política de Cookies</Link>.
        </p>
        <p className="mt-8 text-sm text-slate-300">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </main>
      <Footer />
    </div>
  );
}