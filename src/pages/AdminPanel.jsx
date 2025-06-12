import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";
import AdminContenidos from "../components/admin/AdminContenidos";
import AdminUsuarios from "../components/admin/AdminUsuarios";
import AdminMigracion from "../components/admin/AdminMigracion";
import AdminEnviarNotificacion from "../components/admin/AdminEnviarNotificacion";
import AdminLogrosUsuario from "../components/admin/AdminLogrosUsuario";
import useAdminContenidos from "../hooks/useAdminContenidos";
import useAdminUsuarios from "../hooks/useAdminUsuarios";
import useUsuario from "../hooks/useUsuario";

const MENU = [
  { key: "contenidos", label: "📺 Contenidos" },
  { key: "migracion", label: "🔄 Migraciones" },
  { key: "notificaciones", label: "🔔 Notificaciones" },
  { key: "usuarios", label: "👥 Usuarios" },
  { key: "logros", label: "🏆 Logros usuario" },
];

export default function AdminPanel() {
  const [pagina, setPagina] = useState("contenidos");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  const { esAdmin, loading: loadingUsuario } = useUsuario();

  // Redirección si no es admin
  useEffect(() => {
    if (!loadingUsuario && !esAdmin) {
      navigate("/"); // Redirige a la home o a donde prefieras
    }
  }, [esAdmin, loadingUsuario, navigate]);

  // Hooks de lógica
  const contenidosProps = useAdminContenidos(setMensaje);
  const usuariosProps = useAdminUsuarios(setMensaje);

  // Estados y handlers para migraciones
  const [migrandoDuraciones, setMigrandoDuraciones] = useState(false);
  const [migrandoGeneros, setMigrandoGeneros] = useState(false);
  const [resultadoMigracion, setResultadoMigracion] = useState(null);
  const [resultadoMigracionGeneros, setResultadoMigracionGeneros] =
    useState(null);
  const [logsMigracion, setLogsMigracion] = useState([]);

  // Handlers de migración (simulados)
  const handleMigrarDuraciones = async () => {
    setMigrandoDuraciones(true);
    setResultadoMigracion(null);
    setMensaje("Iniciando migración de duraciones...");
    try {
      const resultado = { exitosos: 10, fallidos: 2, total: 12 }; // Simulado
      setResultadoMigracion(resultado);
      setMensaje(
        `✅ Migración completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );
    } catch (error) {
      setMensaje("❌ Error durante la migración");
      setResultadoMigracion({ error: error.message });
    } finally {
      setMigrandoDuraciones(false);
    }
  };

  const handleMigrarGeneros = async () => {
    setMigrandoGeneros(true);
    setResultadoMigracionGeneros(null);
    setMensaje("Iniciando migración de géneros...");
    try {
      const resultado = {
        exitosos: 20,
        fallidos: 1,
        total: 21,
        noEncontrados: 0,
      }; // Simulado
      setResultadoMigracionGeneros(resultado);
      setMensaje(
        `✅ Migración de géneros completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );
    } catch (error) {
      setMensaje("❌ Error durante la migración de géneros");
      setResultadoMigracionGeneros({ error: error.message });
    } finally {
      setMigrandoGeneros(false);
    }
  };

  if (loadingUsuario) {
    return (
      <>
        <Navbar />
        <main className="pt-20 px-4 w-full h-[80vh] flex items-center justify-center">
          <p className="text-center text-lg">Cargando...</p>
        </main>
        <Footer />
      </>
    );
  }

  // Si el usuario no es admin, no renderiza nada (ya habrá redirigido)
  if (!esAdmin) return null;

  return (
    <>
      <Navbar />
      <MensajeFlotante texto={mensaje} />
      <main className="pt-20 px-0 w-full h-[calc(100vh-80px)] flex flex-row gap-0">
        {/* Menú lateral */}
        <aside className="w-56 shrink-0 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
          <nav className="flex flex-col gap-2 py-8 px-4 sticky top-24">
            {MENU.map((item) => (
              <button
                key={item.key}
                onClick={() => setPagina(item.key)}
                className={`text-left px-4 py-2 rounded font-medium transition-all ${
                  pagina === item.key
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Página principal */}
        <section className="flex-1 min-w-0 h-full overflow-auto px-8 py-8 flex flex-col">
          <h1 className="text-2xl font-bold mb-6">
            {MENU.find((m) => m.key === pagina)?.label}
          </h1>
          <div className="flex-1 flex flex-col">
            {pagina === "contenidos" && (
              <AdminContenidos {...contenidosProps} />
            )}
            {pagina === "usuarios" && <AdminUsuarios {...usuariosProps} />}
            {pagina === "migracion" && (
              <AdminMigracion
                migrandoDuraciones={migrandoDuraciones}
                migrandoGeneros={migrandoGeneros}
                handleMigrarDuraciones={handleMigrarDuraciones}
                handleMigrarGeneros={handleMigrarGeneros}
                resultadoMigracion={resultadoMigracion}
                resultadoMigracionGeneros={resultadoMigracionGeneros}
                logsMigracion={logsMigracion}
              />
            )}
            {pagina === "notificaciones" && (
              <AdminEnviarNotificacion setMensaje={setMensaje} />
            )}
            {pagina === "logros" && (
              <AdminLogrosUsuario usuarios={usuariosProps.usuarios} />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
