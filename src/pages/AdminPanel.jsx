import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
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
import migrarLogros from "../utils/migrarLogros"; // Asegúrate de exportar la función migrarLogros en tu archivo

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
  const [logros, setLogros] = useState([]);
  const [loadingLogros, setLoadingLogros] = useState(false);
  const [editLogro, setEditLogro] = useState(null);
  const [formLogro, setFormLogro] = useState({
    id: "",
    nombre: "",
    descripcion: "",
    emoji: "",
    categoria: "",
    color: "",
    objetivo: "",
  });
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

  useEffect(() => {
    if (pagina === "logros") cargarLogros();
    // eslint-disable-next-line
  }, [pagina]);

  async function cargarLogros() {
    setLoadingLogros(true);
    const { data, error } = await supabase
      .from("logros")
      .select("*")
      .order("id");
    if (!error) setLogros(data);
    setLoadingLogros(false);
  }

  function handleEditLogro(logro) {
    setEditLogro(logro.id);
    setFormLogro({
      id: logro.id,
      nombre: logro.nombre,
      descripcion: logro.descripcion,
      emoji: logro.emoji,
      categoria: logro.categoria,
      color: logro.color,
      objetivo: logro.objetivo || "",
    });
  }

  function handleCancelEdit() {
    setEditLogro(null);
    setFormLogro({
      id: "",
      nombre: "",
      descripcion: "",
      emoji: "",
      categoria: "",
      color: "",
      objetivo: "",
    });
  }

  async function handleSaveLogro(e) {
    e.preventDefault();
    setLoadingLogros(true);
    const upsertData = { ...formLogro, objetivo: formLogro.objetivo || null };
    const { error } = await supabase.from("logros").upsert(upsertData);
    if (!error) {
      setMensaje(editLogro ? "Logro actualizado" : "Logro creado");
      await cargarLogros();
      handleCancelEdit();
    } else {
      setMensaje("Error guardando logro");
    }
    setLoadingLogros(false);
  }

  async function handleDeleteLogro(id) {
    if (!window.confirm("¿Eliminar este logro?")) return;
    setLoadingLogros(true);
    const { error } = await supabase.from("logros").delete().eq("id", id);
    if (!error) {
      setMensaje("Logro eliminado");
      await cargarLogros();
    } else {
      setMensaje("Error eliminando logro");
    }
    setLoadingLogros(false);
  }

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
              <div>
                <AdminMigracion
                  migrandoDuraciones={migrandoDuraciones}
                  migrandoGeneros={migrandoGeneros}
                  handleMigrarDuraciones={handleMigrarDuraciones}
                  handleMigrarGeneros={handleMigrarGeneros}
                  resultadoMigracion={resultadoMigracion}
                  resultadoMigracionGeneros={resultadoMigracionGeneros}
                  logsMigracion={logsMigracion}
                />
                <button
                  className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={async () => {
                    setMensaje("Migrando logros...");
                    try {
                      await migrarLogros();
                      setMensaje("Logros migrados correctamente.");
                    } catch (e) {
                      setMensaje("Error al migrar logros.");
                    }
                  }}
                >
                  Migrar logros a Supabase
                </button>
              </div>
            )}
            {pagina === "notificaciones" && (
              <AdminEnviarNotificacion setMensaje={setMensaje} />
            )}
            {pagina === "logros" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Gestión de logros
                </h2>
                <form
                  onSubmit={handleSaveLogro}
                  className="flex flex-wrap gap-2 items-end mb-6 bg-gray-50 p-4 rounded"
                >
                  <input
                    className="border px-2 py-1 rounded w-32"
                    placeholder="ID"
                    value={formLogro.id}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, id: e.target.value }))
                    }
                    required
                    disabled={!!editLogro}
                  />
                  <input
                    className="border px-2 py-1 rounded w-40"
                    placeholder="Nombre"
                    value={formLogro.nombre}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, nombre: e.target.value }))
                    }
                    required
                  />
                  <input
                    className="border px-2 py-1 rounded w-64"
                    placeholder="Descripción"
                    value={formLogro.descripcion}
                    onChange={(e) =>
                      setFormLogro((f) => ({
                        ...f,
                        descripcion: e.target.value,
                      }))
                    }
                    required
                  />
                  <input
                    className="border px-2 py-1 rounded w-20"
                    placeholder="Emoji"
                    value={formLogro.emoji}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, emoji: e.target.value }))
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded w-32"
                    placeholder="Categoría"
                    value={formLogro.categoria}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, categoria: e.target.value }))
                    }
                    required
                  />
                  <input
                    className="border px-2 py-1 rounded w-32"
                    placeholder="Color"
                    value={formLogro.color}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, color: e.target.value }))
                    }
                  />
                  <input
                    className="border px-2 py-1 rounded w-24"
                    placeholder="Objetivo"
                    type="number"
                    value={formLogro.objetivo}
                    onChange={(e) =>
                      setFormLogro((f) => ({ ...f, objetivo: e.target.value }))
                    }
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    disabled={loadingLogros}
                  >
                    {editLogro ? "Guardar" : "Crear"}
                  </button>
                  {editLogro && (
                    <button
                      type="button"
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                      onClick={handleCancelEdit}
                    >
                      Cancelar
                    </button>
                  )}
                </form>
                {loadingLogros ? (
                  <p>Cargando logros...</p>
                ) : (
                  <table className="w-full table-auto border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">ID</th>
                        <th className="border px-2 py-1">Nombre</th>
                        <th className="border px-2 py-1">Descripción</th>
                        <th className="border px-2 py-1">Emoji</th>
                        <th className="border px-2 py-1">Categoría</th>
                        <th className="border px-2 py-1">Color</th>
                        <th className="border px-2 py-1">Objetivo</th>
                        <th className="border px-2 py-1">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logros.map((logro) => (
                        <tr key={logro.id}>
                          <td className="border px-2 py-1">{logro.id}</td>
                          <td className="border px-2 py-1">{logro.nombre}</td>
                          <td className="border px-2 py-1">
                            {logro.descripcion}
                          </td>
                          <td className="border px-2 py-1">{logro.emoji}</td>
                          <td className="border px-2 py-1">
                            {logro.categoria}
                          </td>
                          <td className="border px-2 py-1">{logro.color}</td>
                          <td className="border px-2 py-1">
                            {logro.objetivo ?? ""}
                          </td>
                          <td className="border px-2 py-1 space-x-2">
                            <button
                              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              onClick={() => handleEditLogro(logro)}
                            >
                              Editar
                            </button>
                            <button
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                              onClick={() => handleDeleteLogro(logro.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
