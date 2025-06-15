import { useState, useEffect, useMemo } from "react";
import {
  LOGROS_DEFINICIONES,
  CATEGORIAS_LOGROS,
  calcularLogrosDesbloqueados,
  calcularProgresoLogro,
} from "../utils/logros";
import { supabase } from "../utils/supabaseClient";
import LogroItem from "./logros/LogroItem";

const CATEGORIA_TODOS = "TODOS";
const ITEMS_POR_PAGINA = 12; // Mostrar 12 por página

export default function LogrosDetalle({ stats, usuario }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(CATEGORIA_TODOS);
  const [logrosUsuarioSupabase, setLogrosUsuarioSupabase] = useState([]);
  const [orden, setOrden] = useState("recientes");
  const [ocultarNoConseguidos, setOcultarNoConseguidos] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_POR_PAGINA);

  useEffect(() => {
    if (!usuario?.id) return;
    supabase
      .from("logros_usuario")
      .select("logro_id,desbloqueado_en")
      .eq("user_id", usuario.id)
      .then(({ data }) => setLogrosUsuarioSupabase(data || []));
  }, [usuario]);

  const logrosConseguidos = useMemo(
    () => calcularLogrosDesbloqueados(stats),
    [stats]
  );
  const idsConseguidos = useMemo(
    () => logrosConseguidos.map((l) => l.id),
    [logrosConseguidos]
  );
  const categorias = Object.values(CATEGORIAS_LOGROS);

  const getTs = (id) => {
    const row = logrosUsuarioSupabase.find((r) => r.logro_id === id);
    return row ? new Date(row.desbloqueado_en).getTime() : 0;
  };

  const logrosFiltrados = useMemo(() => {
    return categoriaSeleccionada === CATEGORIA_TODOS
      ? LOGROS_DEFINICIONES
      : LOGROS_DEFINICIONES.filter(
          (l) => l.categoria === categoriaSeleccionada
        );
  }, [categoriaSeleccionada]);

  const logrosOrdenados = useMemo(() => {
    const visibles = ocultarNoConseguidos
      ? logrosFiltrados.filter((l) => idsConseguidos.includes(l.id))
      : logrosFiltrados;

    const conseguidos = visibles.filter((l) => idsConseguidos.includes(l.id));
    const noConseguidos = visibles.filter(
      (l) => !idsConseguidos.includes(l.id)
    );

    conseguidos.sort((a, b) => {
      const ta = getTs(a.id),
        tb = getTs(b.id);
      return orden === "recientes" ? tb - ta : ta - tb;
    });

    return [...conseguidos, ...noConseguidos];
  }, [
    orden,
    ocultarNoConseguidos,
    logrosFiltrados,
    idsConseguidos,
    logrosUsuarioSupabase,
  ]);

  // Solo mostrar hasta visibleCount
  const mostrar = logrosOrdenados.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {/* Selector de categorías */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoriaSeleccionada(CATEGORIA_TODOS)}
          className={`px-3 py-1 rounded text-sm ${
            categoriaSeleccionada === CATEGORIA_TODOS
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSeleccionada(cat)}
            className={`px-3 py-1 rounded text-sm capitalize ${
              categoriaSeleccionada === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {cat.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Controles de orden y visibilidad */}
      <div className="flex items-center gap-4">
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="recientes">Más recientes primero</option>
          <option value="antiguos">Más antiguos primero</option>
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={ocultarNoConseguidos}
            onChange={(e) => setOcultarNoConseguidos(e.target.checked)}
          />
          Ocultar no conseguidos
        </label>
      </div>

      {/* lista de logros */}
      <div className="grid grid-cols-4 gap-3">
        {mostrar.map((logro) => {
          const conseguido = idsConseguidos.includes(logro.id);
          const ts = conseguido ? getTs(logro.id) : null;
          const fecha = ts ? new Date(ts).toLocaleDateString() : null;

          // CALCULA EL PORCENTAJE DE ESTE LOGRO
          const porcentaje = calcularProgresoLogro(logro, stats);

          return (
            <LogroItem
              key={logro.id}
              emoji={logro.emoji}
              nombre={logro.nombre}
              descripcion={logro.descripcion}
              categoria={logro.categoria}
              fecha={fecha}
              porcentaje={porcentaje} // <-- pasamos el porcentaje
              color={
                conseguido
                  ? logro.color
                  : "bg-gray-50 text-gray-400 border-gray-200"
              }
              conseguido={conseguido}
            />
          );
        })}
      </div>

      {/* Botones de paginación */}
      <div className="flex gap-4">
        {visibleCount < logrosOrdenados.length && (
          <button
            onClick={() => setVisibleCount((c) => c + ITEMS_POR_PAGINA)}
            className="text-blue-600 hover:underline"
          >
            Mostrar más
          </button>
        )}
        {visibleCount > ITEMS_POR_PAGINA && (
          <button
            onClick={() =>
              setVisibleCount((c) =>
                Math.max(c - ITEMS_POR_PAGINA, ITEMS_POR_PAGINA)
              )
            }
            className="text-blue-600 hover:underline"
          >
            Mostrar menos
          </button>
        )}
      </div>
    </div>
  );
}
