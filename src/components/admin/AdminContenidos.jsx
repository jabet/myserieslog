import { useState } from "react";
import AdminIncompletos from "./AdminIncompletos";

export default function AdminContenidos({
  contenidos,
  loading,
  tiposDisponibles,
  busqueda,
  setBusqueda,
  filtroTipo,
  setFiltroTipo,
  busquedaId,
  setBusquedaId,
  pagina,
  setPagina,
  totalPaginas,
  contenidosPagina,
  seleccionados,
  setSeleccionados,
  accionBatch,
  setAccionBatch,
  handleBatchAction,
  handleSort,
  sortBy,
  sortIcon,
  formatearFecha,
  handleRecalcularTipo,
}) {
  return (
    <>
      {/* Bloque de contenidos incompletos */}
      <AdminIncompletos
        contenidos={contenidos}
        onActualizarIncompletos={handleBatchAction}
      />

      {/* Filtros y búsqueda */}
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
        <input
          type="text"
          placeholder="Buscar por ID..."
          value={busquedaId}
          onChange={(e) => setBusquedaId(e.target.value)}
          className="border px-2 py-1 rounded w-24"
        />
      </div>

      {/* Acciones en batch */}
      <div className="my-4 flex gap-2 items-center">
        <select
          value={accionBatch}
          onChange={(e) => setAccionBatch(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="">Selecciona una acción</option>
          <option value="borrar">Borrar seleccionados</option>
          <option value="actualizar_contenido">Actualizar contenido</option>
          <option value="actualizar_traducciones">
            Actualizar traducciones
          </option>
          <option value="cargar_temporadas">Cargar temporadas/capítulos</option>
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
          onClick={handleBatchAction}
        >
          Aplicar
        </button>
      </div>

      {/* Tabla de contenidos */}
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
            <th className="border px-2 py-1">Acciones</th>
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
                    <span className="text-gray-400 italic">Sin nombre</span>
                  )}
                </a>
              </td>
              <td className="border px-2 py-1">{c.tipo}</td>
              <td className="border px-2 py-1">{c.anio}</td>
              <td className="border px-2 py-1">{c.finalizada ? "Sí" : "No"}</td>
              <td className="border px-2 py-1">
                {formatearFecha(c.ultima_actualizacion)}
              </td>
              <td className="border px-2 py-1">{c.nombre_original}</td>
              <td className="border px-2 py-1">{c.puntuacion ?? "-"}</td>
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

      {/* Paginación */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 my-4">
        <span>
          Mostrando{" "}
          {contenidosPagina.length === 0
            ? 0
            : (pagina - 1) * contenidosPagina.length + 1}
          -{Math.min(pagina * contenidosPagina.length, contenidos.length)} de{" "}
          {contenidos.length} resultados
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
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
}
