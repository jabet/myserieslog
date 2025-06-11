import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Cookies() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-sky-900">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Política de Cookies</h1>
        <p className="mb-4">
          En <span className="font-semibold">My Series Log</span> utilizamos cookies propias y de terceros para garantizar el correcto funcionamiento de la web y mejorar la experiencia de usuario.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Qué son las cookies?</h2>
        <p className="mb-4">
          Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una página web. Sirven para recordar tus preferencias y facilitar la navegación.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Qué tipos de cookies usamos?</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>
            <strong>Cookies técnicas:</strong> necesarias para el funcionamiento básico de la web y la gestión de tu sesión.
          </li>
          <li>
            <strong>Cookies de análisis:</strong> opcionalmente, podríamos usar herramientas de analítica para mejorar el servicio (nunca para identificarte personalmente).
          </li>
        </ul>
        <h2 className="text-xl font-semibold mt-8 mb-2">¿Cómo puedes gestionar las cookies?</h2>
        <p className="mb-4">
          Puedes configurar tu navegador para aceptar o rechazar cookies, así como para eliminarlas en cualquier momento. Ten en cuenta que si desactivas las cookies técnicas, la web podría no funcionar correctamente.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Más información</h2>
        <p className="mb-4">
          Para cualquier duda sobre nuestra política de cookies, puedes contactar con nosotros desde la página de <Link to="/contacto" className="text-amber-400 hover:underline">Contacto</Link>.
        </p>
        <p className="mt-8 text-sm text-slate-300">
          Última actualización: {new Date().toLocaleDateString()}
        </p>
      </main>
      <Footer />
    </div>
  );
}