import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Contacto() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-sky-900">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12 text-white">
        <h1 className="text-3xl font-bold mb-6">Contacto</h1>
        <p className="mb-6">
          Si tienes dudas, sugerencias o quieres reportar un problema, puedes escribirnos a:
        </p>
        <div className="mb-8">
          <a
            href="mailto:soporte@myserieslog.com"
            className="text-amber-400 hover:underline text-lg font-semibold"
          >
            soporte@myserieslog.com
          </a>
        </div>
        <p>
          También puedes contactarnos a través de nuestras redes sociales o dejar tu mensaje en el formulario (próximamente).
        </p>
        <div className="mt-8 text-sm text-slate-300">
          Intentaremos responderte lo antes posible.
        </div>
      </main>
      <Footer />
    </div>
  );
}