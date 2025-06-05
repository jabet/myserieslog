import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { detectarTipo } from "../utils/tmdbTypeDetector"; // Asegúrate de importar la función

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
import AdminEnviarNotificacion from "../components/admin/AdminEnviarNotificacion";

import { guardarContenidoTMDb } from "../utils/guardarContenidoTMDb";
import useUsuario from "../hooks/useUsuario"; // <-- Importa el hook correctamente

export default function AdminPanel() {
  // TODOS los useState y useEffect aquí, ANTES de cualquier return o if
  const { usuario, perfil, esAdmin, loading: loadingUsuario } = useUsuario();

  const [contenidos, setContenidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [vistaActual, setVistaActual] = useState("contenidos"); // Estado para la vista actual

  // Estados para duraciones
  const [migrandoDuraciones, setMigrandoDuraciones] = useState(false);
  const [resultadoMigracion, setResultadoMigracion] = useState(null);

  // Estados para géneros
  const [migrandoGeneros, setMigrandoGeneros] = useState(false);
  const [resultadoMigracionGeneros, setResultadoMigracionGeneros] =
    useState(null);

  // Nuevos estados para búsqueda y filtro
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busquedaId, setBusquedaId] = useState(""); // Nuevo estado para búsqueda por ID

  // Estados para paginación
  const [pagina, setPagina] = useState(1);
  const porPagina = 25;

  const [tiposDisponibles, setTiposDisponibles] = useState([]);

  // Mueve esta línea aquí, antes de usarla:
  const contenidosFiltrados = contenidos.filter(
    (c) =>
      (c.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroTipo ? c.tipo === filtroTipo : true) &&
      (busquedaId === "" || String(c.id).includes(busquedaId))
  );

  const totalPaginas = Math.ceil(contenidosFiltrados.length / porPagina);

  // Estado para logs de migración
  const [logsMigracion, setLogsMigracion] = useState([]);

  // Estado para el formulario de notificación
  const [notiUserId, setNotiUserId] = useState("");
  const [notiTitulo, setNotiTitulo] = useState("");
  const [notiMensaje, setNotiMensaje] = useState("");
  const [notiUrl, setNotiUrl] = useState("");
  const [notiStatus, setNotiStatus] = useState("");

  // 1) Cargar lista de contenidos
  useEffect(() => {
    if (!usuario || perfil?.rol !== "admin") return;
    setLoading(true);
    supabase
      .from("contenido")
      .select(
        `
        id,
        nombre,
        nombre_original,
        tipo,
        media_type,
        anio,
        finalizada,
        ultima_actualizacion,
        sinopsis,
        imagen,
        backdrop,
        generos,
        puntuacion,
        popularidad,
        duracion,
        temporadas,
        episodios_totales,
        estado_serie,
        en_emision,
        reparto,
        original_language,
        origin_country
      `
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
  }, [usuario, perfil?.rol, sortBy, sortDir]);

  // 2) Cargar lista de usuarios
  useEffect(() => {
    if (!usuario || perfil?.rol !== "admin") return;
    setLoading(true);

    // Corrige el campo de orden para usuarios
    let orden = sortBy;
    if (vistaActual === "usuarios" && orden === "id") orden = "user_id";

    supabase
      .from("usuarios")
      .select("user_id, rol")
      .order("user_id", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar usuarios:", error);
        } else {
          setUsuarios(data || []);
        }
        setLoading(false);
      });
  }, [usuario, perfil?.rol, sortBy, sortDir, vistaActual]);

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
    const actualizado = await guardarContenidoTMDb(id, media_type, "es-ES");
    if (actualizado) {
      mostrarMensaje(`Contenido ${id} actualizado con éxito`);
      cargarContenidos();
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
      const resultado = await migrarTodasLasDuraciones(setLogsMigracion);
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
  // Añade este useEffect después de cargar los contenidos:
  useEffect(() => {
    // Extrae tipos únicos de "tipo" en vez de "media_type"
    const tipos = Array.from(
      new Set(contenidos.map((c) => c.tipo).filter(Boolean))
    );
    setTiposDisponibles(tipos);
  }, [contenidos]);

  // Filtra los contenidos según la búsqueda y el tipo
  const contenidosPagina = contenidosFiltrados.slice(
    (pagina - 1) * porPagina,
    pagina * porPagina
  );

  const [seleccionados, setSeleccionados] = useState([]);
  const [accionBatch, setAccionBatch] = useState(""); // NUEVO estado para la acción en batch

  // Cambia los checks de acceso:
  if (loadingUsuario) return null;
  if (!usuario) return null;
  if (!esAdmin)
    return (
      <>
        <Navbar />
        <main className="pt-20 px-4 text-center">
          <MensajeFlotante texto="Acceso denegado: solo admins." />
        </main>
        <Footer />
      </>
    );

  // Nueva función para recalcular el tipo de un contenido individual
  const handleRecalcularTipo = async (id) => {
    const contenido = contenidos.find((c) => c.id === id);
    if (!contenido) return;

    // Recalcula el tipo usando la función de utilidad
    const nuevoTipo = detectarTipo(
      contenido,
      contenido.media_type,
      contenido.generos
    );

    // Actualiza en la base de datos solo si cambia
    if (nuevoTipo && nuevoTipo !== contenido.tipo) {
      const { error } = await supabase
        .from("contenido")
        .update({ tipo: nuevoTipo })
        .eq("id", id);

      if (!error) {
        setContenidos((prev) =>
          prev.map((c) => (c.id === id ? { ...c, tipo: nuevoTipo } : c))
        );
        mostrarMensaje(`Tipo recalculado: ${nuevoTipo}`);
      } else {
        mostrarMensaje("Error al actualizar el tipo");
      }
    } else {
      mostrarMensaje("El tipo ya está correcto");
    }
  };

  // Nueva acción batch para recalcular tipo de varios seleccionados
  const handleBatchRecalcularTipo = async () => {
    for (const id of seleccionados) {
      await handleRecalcularTipo(id);
      await new Promise((res) => setTimeout(res, 150));
    }
    mostrarMensaje("Tipos recalculados");
  };

  // Función para enviar la notificación
  const enviarNotificacion = async (e) => {
    e.preventDefault();
    if (!notiUserId) {
      setNotiStatus("Debes seleccionar un usuario.");
      return;
    }
    setNotiStatus("Enviando...");
    const { error } = await supabase.from("notificaciones_usuario").insert([
      {
        user_id: notiUserId,
        titulo: notiTitulo,
        mensaje: notiMensaje,
        url: notiUrl,
      },
    ]);
    if (error) {
      setNotiStatus("Error al enviar: " + error.message);
    } else {
      setNotiStatus("¡Notificación enviada!");
      setNotiTitulo("");
      setNotiMensaje("");
      setNotiUrl("");
    }
  };

  // Añade esto después de cargar usuarios:
  const userOptions = usuarios.map((u) => (
    <option key={u.user_id} value={u.user_id}>
      {u.nick ? u.nick : u.user_id} {u.rol ? `(${u.rol})` : ""}
    </option>
  ));

  return (
    <>
      <Navbar />
      <MensajeFlotante texto={mensaje} />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

        {/* NUEVO: Tabs para cambiar entre Contenidos y Usuarios */}
        <div className="mb-4">
          <button
            onClick={() => setVistaActual("contenidos")}
            className={`px-4 py-2 rounded-l-lg font-medium transition-all ${
              vistaActual === "contenidos"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📺 Contenidos
          </button>
          <button
            onClick={() => setVistaActual("usuarios")}
            className={`px-4 py-2 rounded-r-lg font-medium transition-all ${
              vistaActual === "usuarios"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👥 Usuarios
          </button>
        </div>

        {loading ? (
          <p>
            Cargando {vistaActual === "contenidos" ? "contenidos" : "usuarios"}…
          </p>
        ) : vistaActual === "contenidos" ? (
          contenidos.length === 0 ? (
            <p>No hay contenidos en la base de datos.</p>
          ) : (
            <>
              {/* NUEVAS INPUTS PARA FILTRAR Y BUSCAR */}
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Todos los tipos</option>
                  {tiposDisponibles.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
                {/* NUEVO: Input para buscar por ID */}
                <input
                  type="text"
                  placeholder="Buscar por ID..."
                  value={busquedaId}
                  onChange={(e) => setBusquedaId(e.target.value)}
                  className="border px-2 py-1 rounded w-24"
                />
              </div>
              {/* NUEVO BLOQUE DE ACCIONES EN BATCH */}
              <div className="my-4 flex gap-2 items-center">
                <select
                  value={accionBatch}
                  onChange={(e) => setAccionBatch(e.target.value)}
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Selecciona una acción</option>
                  <option value="borrar">Borrar seleccionados</option>
                  <option value="actualizar_contenido">
                    Actualizar contenido
                  </option>
                  <option value="actualizar_traducciones">
                    Actualizar traducciones
                  </option>
                  <option value="cargar_temporadas">
                    Cargar temporadas/capítulos
                  </option>
                  <option value="forzar_actualizar_temporadas">
                    Forzar actualización temporadas
                  </option>
                  <option value="actualizar_duraciones">
                    Actualizar duraciones (series)
                  </option>
                  <option value="actualizar_duracion_pelicula">
                    Actualizar duración (películas)
                  </option>
                  <option value="actualizar_generos">Actualizar géneros</option>
                  <option value="recalcular_tipo">Recalcular tipo</option>
                </select>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  onClick={async () => {
                    if (seleccionados.length === 0) {
                      mostrarMensaje("Selecciona al menos un elemento");
                      return;
                    }
                    if (!accionBatch) {
                      mostrarMensaje("Selecciona una acción");
                      return;
                    }
                    setLoading(true);
                    if (accionBatch === "borrar") {
                      if (
                        !confirm(
                          `¿Seguro que quieres borrar ${seleccionados.length} contenidos?`
                        )
                      ) {
                        setLoading(false);
                        return;
                      }
                      const { error } = await supabase
                        .from("contenido")
                        .delete()
                        .in("id", seleccionados);
                      if (error) {
                        mostrarMensaje(
                          "Error al borrar contenidos seleccionados"
                        );
                      } else {
                        setContenidos((prev) =>
                          prev.filter((c) => !seleccionados.includes(c.id))
                        );
                        setSeleccionados([]);
                        mostrarMensaje("Contenidos borrados correctamente");
                      }
                    }
                    if (accionBatch === "actualizar_contenido") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c) await handleActualizar(c.id, c.media_type);
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Contenidos actualizados");
                    }
                    if (accionBatch === "actualizar_traducciones") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c)
                          await handleActualizarTraducciones(
                            c.id,
                            c.media_type
                          );
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Traducciones actualizadas");
                    }
                    if (accionBatch === "cargar_temporadas") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c && c.media_type === "tv")
                          await handleCargarTemporadas(c.id, c.media_type);
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Temporadas/capítulos cargados");
                    }
                    if (accionBatch === "forzar_actualizar_temporadas") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c && c.media_type === "tv")
                          await handleForzarActualizarTemporadas(
                            c.id,
                            c.media_type
                          );
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Temporadas actualizadas");
                    }
                    if (accionBatch === "actualizar_duraciones") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c && c.media_type === "tv")
                          await handleActualizarDuraciones(c.id, c.media_type);
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Duraciones de series actualizadas");
                    }
                    if (accionBatch === "actualizar_duracion_pelicula") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c && c.media_type === "movie")
                          await handleActualizarDuracionPelicula(
                            c.id,
                            c.media_type
                          );
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Duraciones de películas actualizadas");
                    }
                    if (accionBatch === "actualizar_generos") {
                      for (const id of seleccionados) {
                        const c = contenidos.find((x) => x.id === id);
                        if (c)
                          await handleActualizarGeneros(c.id, c.media_type);
                        await new Promise((res) => setTimeout(res, 250)); // <-- delay aquí
                      }
                      mostrarMensaje("Géneros actualizados");
                    }
                    if (accionBatch === "recalcular_tipo") {
                      await handleBatchRecalcularTipo();
                      setLoading(false);
                      return;
                    }
                    setLoading(false);
                  }}
                >
                  Aplicar
                </button>
              </div>

              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">
                      <input
                        type="checkbox"
                        checked={
                          seleccionados.length > 0 &&
                          seleccionados.length === contenidosPagina.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeleccionados(contenidosPagina.map((c) => c.id));
                          } else {
                            setSeleccionados([]);
                          }
                        }}
                      />
                    </th>
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
                    <th className="border px-2 py-1">Título original</th>
                    <th className="border px-2 py-1">Puntuación</th>
                    <th className="border px-2 py-1">Géneros</th>
                    <th className="border px-2 py-1">Imagen</th>
                    {/* Nueva columna */}
                  </tr>
                </thead>
                <tbody>
                  {contenidosPagina.map((c) => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSeleccionados((prev) => [...prev, c.id]);
                            } else {
                              setSeleccionados((prev) =>
                                prev.filter((id) => id !== c.id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="border px-2 py-1">{c.id}</td>
                      <td className="border px-2 py-1">
                        <a
                          href={`#/detalle/${c.media_type}/${c.id}`}
                          className="text-blue-700 underline hover:text-blue-900"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {c.nombre || (
                            <span className="text-gray-400 italic">
                              Sin nombre
                            </span>
                          )}
                        </a>
                      </td>
                      <td className="border px-2 py-1">{c.tipo}</td>
                      <td className="border px-2 py-1">{c.anio}</td>
                      <td className="border px-2 py-1">
                        {c.finalizada ? "Sí" : "No"}
                      </td>
                      <td className="border px-2 py-1">
                        {formatearFecha(c.ultima_actualizacion)}
                      </td>
                      <td className="border px-2 py-1">{c.nombre_original}</td>
                      <td className="border px-2 py-1">
                        {c.puntuacion ?? "-"}
                      </td>
                      <td className="border px-2 py-1">
                        {Array.isArray(c.generos)
                          ? c.generos.join(", ")
                          : typeof c.generos === "string"
                            ? c.generos
                            : "-"}
                      </td>
                      <td className="border px-2 py-1">
                        {c.imagen && (
                          <img
                            src={c.imagen}
                            alt={c.nombre || "miniatura"}
                            style={{
                              width: 40,
                              borderRadius: 4,
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                          onClick={() => handleRecalcularTipo(c.id)}
                          title="Recalcular tipo"
                        >
                          Recalcular tipo
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mostrar rango de resultados y controles de paginación */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 my-4">
                <span>
                  Mostrando{" "}
                  {contenidosFiltrados.length === 0
                    ? 0
                    : (pagina - 1) * porPagina + 1}
                  -{Math.min(pagina * porPagina, contenidosFiltrados.length)} de{" "}
                  {contenidosFiltrados.length} resultados
                </span>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                    aria-label="Página anterior"
                  >
                    Anterior
                  </button>
                  <span>
                    Página{" "}
                    <input
                      type="number"
                      min={1}
                      max={totalPaginas}
                      value={pagina}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (isNaN(val) || val < 1) val = 1;
                        if (val > totalPaginas) val = totalPaginas;
                        setPagina(val);
                      }}
                      className="w-12 text-center border rounded"
                      aria-label="Número de página"
                    />{" "}
                    de {totalPaginas}
                  </span>
                  <button
                    className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={() =>
                      setPagina((p) => Math.min(totalPaginas, p + 1))
                    }
                    disabled={pagina === totalPaginas}
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )
        ) : (
          // Vista de usuarios
          <>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("user_id")}
                  >
                    ID{sortIcon("user_id")}
                  </th>
                  <th
                    className="border px-2 py-1 cursor-pointer"
                    onClick={() => handleSort("rol")}
                  >
                    Rol{sortIcon("rol")}
                  </th>
                  <th className="border px-2 py-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.user_id}>
                    <td className="border px-2 py-1">{u.user_id}</td>
                    <td className="border px-2 py-1">{u.rol}</td>
                    <td className="border px-2 py-1 space-x-2">
                      <button
                        onClick={() => handleEliminar(u.user_id)}
                        className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Borrar usuario
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
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

        {/* Mostrar logs de migración */}
        {logsMigracion.length > 0 && (
          <div className="bg-gray-900 text-green-200 p-2 mt-2 rounded max-h-40 overflow-y-auto text-xs">
            {logsMigracion.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}

        <AdminEnviarNotificacion
          usuarios={usuarios}
          series={contenidos.filter(
            (c) => c.tipo === "serie" || c.media_type === "tv"
          )}
          onNotificacionEnviada={() => {
            window.dispatchEvent(new Event("notificacion-enviada"));
          }}
        />
      </main>
      <Footer />
    </>
  );
}
