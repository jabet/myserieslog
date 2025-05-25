import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { actualizarContenido } from "../utils/actualizarContenido";
import { actualizarTraducciones } from "../utils/actualizarTraducciones";
import { cargarTemporadasCapitulos } from "../utils/cargarTemporadasCapitulos";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState({});
  const [contenidos, setContenidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

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
    const ok = await actualizarContenido(id, media_type);
    console.log("---> media_type: ", media_type);
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
  const handleActualizarTraducciones = async (id, tipo) => {
    const ok = await actualizarTraducciones(id, tipo);
    if (ok) {
      mostrarMensaje(`Traducciones de ${id} actualizadas con éxito`);
    } else {
      mostrarMensaje(`Fallo al actualizar traducciones de ${id}`);
    }
  };

  // Forzar carga de temporadas y capítulos (solo para series)
  const handleCargarTemporadas = async (id, tipo) => {
    if (tipo !== "serie") return;
    const ok = await cargarTemporadasCapitulos(id, "es-ES");
    if (ok) {
      mostrarMensaje(`Temporadas y capítulos de ${id} cargados con éxito`);
    } else {
      mostrarMensaje(`Fallo al cargar temporadas/capítulos de ${id}`);
    }
  };

  // Borrar contenido de la BD
  const handleEliminar = async (id) => {
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

  if (!user) return null;
  if (perfil.role !== "admin")
    return (
      <>
        <Navbar />
        <main className="pt-20 px-4 text-center">
          <p className="text-red-600">Acceso denegado: solo admins.</p>
        </main>
        <Footer />
      </>
    );

  return (
    <>
      <Navbar />
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

        {mensaje && (
          <div className="mb-4 text-sm bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
            {mensaje}
          </div>
        )}

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
                  <td className="border px-2 py-1">{c.tipo}</td>
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
                      onClick={() => handleActualizarTraducciones(c.id, c.tipo)}
                      className="text-sm bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                    >
                      Actualizar traducciones
                    </button>
                    {c.tipo === "serie" && (
                      <button
                        onClick={() => handleCargarTemporadas(c.id, c.tipo)}
                        className="text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                      >
                        Cargar temporadas/capítulos
                      </button>
                    )}
                    <button
                      onClick={() => handleEliminar(c.id)}
                      className="text-sm bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Borrar contenido
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
      <Footer />
    </>
  );
}
