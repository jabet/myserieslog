import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { actualizarContenido } from "../utils/actualizarContenido";
import { actualizarTraducciones } from "../utils/actualizarTraducciones";
import { cargarTemporadasCapitulos } from "../utils/cargarTemporadasCapitulos";
import { actualizarDuracionEpisodios } from "../utils/actualizarDuracionEpisodios";
import { actualizarDuracionPelicula } from "../utils/actualizarDuracionPeliculas";
import { migrarTodasLasDuraciones } from "../utils/migrarDuraciones";
import {
  actualizarGeneros,
  migrarTodosLosGeneros,
} from "../utils/actualizarGeneros";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MensajeFlotante from "../components/MensajeFlotante";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({});
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  // Estados para duraciones
  const [migrandoDuraciones, setMigrandoDuraciones] = useState(false);
  const [resultadoMigracion, setResultadoMigracion] = useState(null);

  // Estados para géneros
  const [migrandoGeneros, setMigrandoGeneros] = useState(false);
  const [resultadoMigracionGeneros, setResultadoMigracionGeneros] =
    useState(null);

  // 1) Cargar sesión y perfil (incluye role)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase
          .from("usuarios")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setPerfil(data || {}));
      }
    });
  }, []);

  // 2) Cargar lista de contenidos
  useEffect(() => {
    if (!user || perfil.role !== "admin") return;
    setLoading(true);
    supabase
      .from("contenido")
      .select(
        "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
      )
      .order(sortBy, { ascending: sortDir === "asc" })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar contenidos:", error);
        } else {
          setContenidos(data || []);
        }
        setLoading(false);
      });
  }, [user, perfil.role, sortBy, sortDir]);

  // Formatea fecha en DD/MM/AAAA HH:MM
  const formatearFecha = (iso) =>
    iso
      ? new Date(iso).toLocaleString("es-ES", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "-";

  const mostrarMensaje = (txt) => {
    setMensaje(txt);
    setTimeout(() => setMensaje(""), 3000);
  };

  // Forzar actualización de un contenido
  const handleActualizar = async (id, media_type) => {
    console.log("Actualizando contenido:", id, media_type);
    const ok = await actualizarContenido(id, media_type);
    if (ok) {
      mostrarMensaje(`Contenido ${id} actualizado con éxito`);
      // refrescar la fecha
      const { data: updated, error } = await supabase
        .from("contenido")
        .select("ultima_actualizacion")
        .eq("id", id)
        .single();
      if (!error && updated) {
        setContenidos((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, ultima_actualizacion: updated.ultima_actualizacion }
              : c
          )
        );
      }
    } else {
      mostrarMensaje(`Fallo al actualizar ${id}`);
    }
  };

  // Forzar actualización de traducciones
  const handleActualizarTraducciones = async (id, media_type) => {
    console.log("Actualizando traducciones:", id, media_type);
    const ok = await actualizarTraducciones(id, media_type);
    if (ok) {
      mostrarMensaje(`Traducciones de ${id} actualizadas con éxito`);
    } else {
      mostrarMensaje(`Fallo al actualizar traducciones de ${id}`);
    }
  };

  // Forzar carga de temporadas y capítulos (solo para series)
  const handleCargarTemporadas = async (id, media_type) => {
    console.log("Cargar temporadas/capítulos:", id, media_type);
    if (media_type !== "tv") return;
    const ok = await cargarTemporadasCapitulos(id, "es-ES");
    if (ok) {
      mostrarMensaje(`Temporadas y capítulos de ${id} cargados con éxito`);
    } else {
      mostrarMensaje(`Fallo al cargar temporadas/capítulos de ${id}`);
    }
  };

  // Forzar actualización de TODAS las temporadas y capítulos (solo para series)
  const handleForzarActualizarTemporadas = async (id, media_type) => {
    console.log(
      "Forzar actualización de todas las temporadas:",
      id,
      media_type
    );
    if (media_type !== "tv") return;
    mostrarMensaje("Forzando actualización de todas las temporadas...");
    const ok = await cargarTemporadasCapitulos(id, "es-ES");
    if (ok) {
      mostrarMensaje(
        `Temporadas y capítulos de ${id} actualizados en Supabase`
      );
    } else {
      mostrarMensaje(`Fallo al actualizar temporadas/capítulos de ${id}`);
    }
  };

  // Borrar contenido de la BD
  const handleEliminar = async (id) => {
    console.log("Eliminando contenido:", id);
    if (!confirm(`¿Seguro que quieres borrar el contenido ${id}?`)) return;
    const { error } = await supabase.from("contenido").delete().eq("id", id);
    if (error) {
      console.error("Error borrando contenido:", error);
      mostrarMensaje(`Error al borrar contenido ${id}`);
    } else {
      setContenidos((prev) => prev.filter((c) => c.id !== id));
      mostrarMensaje(`Contenido ${id} borrado`);
    }
  };

  // Cambia el orden de la tabla
  const handleSort = (campo) => {
    if (sortBy === campo) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(campo);
      setSortDir("asc");
    }
  };

  // Icono de orden
  const sortIcon = (campo) =>
    sortBy === campo ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  // NUEVA función para actualizar duraciones
  const handleActualizarDuraciones = async (id, media_type) => {
    if (media_type !== "tv") {
      mostrarMensaje("Solo se pueden actualizar duraciones de series");
      return;
    }

    mostrarMensaje("Actualizando duraciones de episodios...");
    const exito = await actualizarDuracionEpisodios(id, "es-ES");

    if (exito) {
      mostrarMensaje(`Duraciones de episodios de ${id} actualizadas`);
    } else {
      mostrarMensaje(`Error al actualizar duraciones de ${id}`);
    }
  };

  // NUEVA función para actualizar duraciones de películas
  const handleActualizarDuracionPelicula = async (id, media_type) => {
    if (media_type !== "movie") {
      mostrarMensaje("Solo se pueden actualizar duraciones de películas");
      return;
    }

    mostrarMensaje("Actualizando duración de película...");
    const exito = await actualizarDuracionPelicula(id, "es-ES");

    if (exito) {
      mostrarMensaje(`Duración de película ${id} actualizada`);
    } else {
      mostrarMensaje(`Error al actualizar duración de ${id}`);
    }
  };

  // AÑADIR FUNCIÓN PARA ACTUALIZAR GÉNEROS INDIVIDUALES:
  const handleActualizarGeneros = async (id, media_type) => {
    mostrarMensaje("Actualizando géneros...");
    const exito = await actualizarGeneros(id, media_type, "es-ES");

    if (exito) {
      mostrarMensaje(`Géneros de ${media_type} ${id} actualizados`);

      // REEMPLAZAR cargarContenidos() por este código:
      setLoading(true);
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
      } else {
        setContenidos(data || []);
      }
      setLoading(false);
    } else {
      mostrarMensaje(`Error al actualizar géneros de ${id}`);
    }
  };

  // AÑADIR ESTA FUNCIÓN QUE FALTA:
  const handleMigrarDuraciones = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres migrar las duraciones de todas las series y películas? Esto puede tardar varios minutos."
      )
    ) {
      return;
    }

    setMigrandoDuraciones(true);
    setResultadoMigracion(null);
    mostrarMensaje("Iniciando migración de duraciones...");

    try {
      const resultado = await migrarTodasLasDuraciones();
      setResultadoMigracion(resultado);
      mostrarMensaje(
        `✅ Migración completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );
    } catch (error) {
      console.error("Error en migración:", error);
      mostrarMensaje("❌ Error durante la migración");
      setResultadoMigracion({ error: error.message });
    } finally {
      setMigrandoDuraciones(false);
    }
  };

  // AÑADIR TAMBIÉN ESTA FUNCIÓN PARA GÉNEROS:
  const handleMigrarGeneros = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres migrar los géneros de todo el contenido? Esto puede tardar varios minutos."
      )
    ) {
      return;
    }

    setMigrandoGeneros(true);
    setResultadoMigracionGeneros(null);
    mostrarMensaje("Iniciando migración de géneros...");

    try {
      const resultado = await migrarTodosLosGeneros();
      setResultadoMigracionGeneros(resultado);
      mostrarMensaje(
        `✅ Migración de géneros completada: ${resultado.exitosos} exitosos, ${resultado.fallidos} fallidos de ${resultado.total} elementos`
      );

      // REEMPLAZAR cargarContenidos() por este código:
      setLoading(true);
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
      } else {
        setContenidos(data || []);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error en migración de géneros:", error);
      mostrarMensaje("❌ Error durante la migración de géneros");
      setResultadoMigracionGeneros({ error: error.message });
    } finally {
      setMigrandoGeneros(false);
    }
  };

  // Añadir esta función antes de las otras funciones:
  const cargarContenidos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contenido")
        .select(
          "id, nombre, tipo, media_type, anio, finalizada, ultima_actualizacion"
        )
        .order(sortBy, { ascending: sortDir === "asc" });

      if (error) {
        console.error("Error al cargar contenidos:", error);
        mostrarMensaje("Error cargando contenidos");
      } else {
        setContenidos(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarMensaje("Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Añadir función para limpiar contenido no válido:
  const handleLimpiarContenidoInvalido = async () => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar el contenido marcado como 'No disponible' en TMDb?"
      )
    ) {
      return;
    }

    const { data, error } = await supabase
      .from("contenido")
      .delete()
      .contains("generos", ["No disponible"]);

    if (error) {
      console.error("Error eliminando contenido inválido:", error);
      mostrarMensaje("Error al eliminar contenido inválido");
    } else {
      mostrarMensaje(`${data?.length || 0} elementos inválidos eliminados`);
      cargarContenidos(); // Recargar lista
    }
  };

  if (!user) return null;
  if (perfil.role !== "admin")
    return (
      <>
        <Navbar />
        <main className="pt-20 px-4 text-center">
          <MensajeFlotante texto="Acceso denegado: solo admins." />
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <MensajeFlotante texto={mensaje} />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

        {loading ? (
          <p>Cargando contenidos…</p>
        ) : contenidos.length === 0 ? (
          <p>No hay contenidos en la base de datos.</p>
        ) : (
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID{sortIcon("id")}
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("nombre")}
                >
                  Nombre{sortIcon("nombre")}
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("tipo")}
                >
                  Tipo{sortIcon("tipo")}
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("anio")}
                >
                  Año{sortIcon("anio")}
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("finalizada")}
                >
                  Finalizada{sortIcon("finalizada")}
                </th>
                <th
                  className="border px-2 py-1 cursor-pointer"
                  onClick={() => handleSort("ultima_actualizacion")}
                >
                  Última Actualización{sortIcon("ultima_actualizacion")}
                </th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contenidos.map((c) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{c.id}</td>
                  <td className="border px-2 py-1">{c.nombre}</td>
                  <td className="border px-2 py-1">{c.media_type}</td>
                  <td className="border px-2 py-1">{c.anio}</td>
                  <td className="border px-2 py-1">
                    {c.finalizada ? "Sí" : "No"}
                  </td>
                  <td className="border px-2 py-1">
                    {formatearFecha(c.ultima_actualizacion)}
                  </td>
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      onClick={() => handleActualizar(c.id, c.media_type)}
                      className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Actualizar contenido
                    </button>
                    <button
                      onClick={() =>
                        handleActualizarTraducciones(c.id, c.media_type)
                      }
                      className="text-sm bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Actualizar traducciones
                    </button>
                    {c.media_type === "tv" && (
                      <>
                        <button
                          onClick={() =>
                            handleCargarTemporadas(c.id, c.media_type)
                          }
                          className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Cargar temporadas/capítulos
                        </button>
                        <button
                          onClick={() =>
                            handleForzarActualizarTemporadas(c.id, c.media_type)
                          }
                          className="text-sm bg-orange-600 text-white px-2 py-1 rounded hover:bg-orange-700"
                        >
                          Forzar actualización temporadas
                        </button>
                        <button
                          onClick={() =>
                            handleActualizarDuraciones(c.id, c.media_type)
                          }
                          className="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                          title="Actualizar duraciones"
                        >
                          ⏱️ Duraciones
                        </button>
                      </>
                    )}
                    {c.media_type === "movie" && (
                      <button
                        onClick={() =>
                          handleActualizarDuracionPelicula(c.id, c.media_type)
                        }
                        className="px-2 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                        title="Actualizar duración"
                      >
                        🎬 Duración
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(c.id)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Borrar contenido
                    </button>
                    <button
                      onClick={() =>
                        handleActualizarGeneros(c.id, c.media_type)
                      }
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      title="Actualizar géneros"
                    >
                      🎭 Géneros
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* NUEVA SECCIÓN: Migración de Datos */}
        <section className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-yellow-800">
              🚀 Migración de Datos
            </h2>
            {migrandoDuraciones && (
              <div className="flex items-center gap-2 text-yellow-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">
                Actualizar Duraciones de Episodios
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Actualiza las duraciones de todos los episodios existentes desde
                TMDb. Esto puede tardar varios minutos dependiendo del número de
                series.
              </p>

              <button
                onClick={handleMigrarDuraciones}
                disabled={migrandoDuraciones}
                className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                  migrandoDuraciones
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {migrandoDuraciones ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    Migrando duraciones...
                  </>
                ) : (
                  <>
                    <span className="mr-2">⏱️</span>
                    Migrar Duraciones
                  </>
                )}
              </button>
            </div>

            {/* Mostrar resultado de la migración */}
            {resultadoMigracion && (
              <div
                className={`p-4 rounded-lg ${
                  resultadoMigracion.error
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    resultadoMigracion.error ? "text-red-800" : "text-green-800"
                  }`}
                >
                  {resultadoMigracion.error
                    ? "❌ Error en la migración"
                    : "✅ Migración completada"}
                </h4>

                {resultadoMigracion.error ? (
                  <p className="text-red-700 text-sm">
                    {resultadoMigracion.error}
                  </p>
                ) : (
                  <div className="text-green-700 text-sm space-y-1">
                    <p>
                      <strong>Total de series procesadas:</strong>{" "}
                      {resultadoMigracion.total}
                    </p>
                    <p>
                      <strong>Actualizaciones exitosas:</strong>{" "}
                      {resultadoMigracion.exitosos}
                    </p>
                    <p>
                      <strong>Errores:</strong> {resultadoMigracion.fallidos}
                    </p>

                    {resultadoMigracion.fallidos > 0 && (
                      <p className="text-yellow-600">
                        ⚠️ Revisa la consola para ver detalles de los errores
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Información adicional */}
            <div className="text-xs text-yellow-600 space-y-1">
              <p>• Esta operación consultará la API de TMDb para cada serie</p>
              <p>
                • Se aplicará un retraso de 250ms entre consultas para respetar
                los límites de la API
              </p>
              <p>
                • Los logs detallados se mostrarán en la consola del navegador
              </p>
            </div>
          </div>
        </section>

        {/* NUEVA SECCIÓN: Migración de Géneros */}
        <section className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-800">
              🎭 Migración de Géneros
            </h2>
            {migrandoGeneros && (
              <div className="flex items-center gap-2 text-green-700">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span className="text-sm">Procesando...</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-green-800 mb-2">
                Actualizar Géneros desde TMDb
              </h3>
              <p className="text-sm text-green-700 mb-3">
                Actualiza los géneros de todo el contenido que no tenga géneros
                asignados desde TMDb.
              </p>

              <button
                onClick={handleMigrarGeneros}
                disabled={migrandoGeneros}
                className={`px-4 py-2 text-white rounded font-medium transition-colors ${
                  migrandoGeneros
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {migrandoGeneros ? (
                  <>
                    <span className="animate-pulse mr-2">⏳</span>
                    Migrando géneros...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎭</span>
                    Migrar Géneros
                  </>
                )}
              </button>
            </div>

            {/* Mostrar resultado de la migración de géneros */}
            {resultadoMigracionGeneros && (
              <div
                className={`p-4 rounded-lg ${
                  resultadoMigracionGeneros.error
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <h4
                  className={`font-semibold mb-2 ${
                    resultadoMigracionGeneros.error
                      ? "text-red-800"
                      : "text-green-800"
                  }`}
                >
                  {resultadoMigracionGeneros.error
                    ? "❌ Error en la migración"
                    : "✅ Migración completada"}
                </h4>

                {resultadoMigracionGeneros.error ? (
                  <p className="text-red-700 text-sm">
                    {resultadoMigracionGeneros.error}
                  </p>
                ) : (
                  <div className="text-green-700 text-sm space-y-1">
                    <p>
                      <strong>Total de elementos procesados:</strong>{" "}
                      {resultadoMigracionGeneros.total}
                    </p>
                    <p>
                      <strong>Actualizaciones exitosas:</strong>{" "}
                      {resultadoMigracionGeneros.exitosos}
                    </p>
                    <p>
                      <strong>Errores:</strong>{" "}
                      {resultadoMigracionGeneros.fallidos}
                    </p>
                    {/* NUEVO: Mostrar contenido no encontrado */}
                    {resultadoMigracionGeneros.noEncontrados > 0 && (
                      <p>
                        <strong>No encontrados en TMDb:</strong>{" "}
                        <span className="text-yellow-600">
                          {resultadoMigracionGeneros.noEncontrados}
                        </span>
                      </p>
                    )}

                    {(resultadoMigracionGeneros.fallidos > 0 ||
                      resultadoMigracionGeneros.noEncontrados > 0) && (
                      <p className="text-yellow-600 mt-2">
                        ⚠️ Revisa la consola para ver detalles
                      </p>
                    )}
                  </div>
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
