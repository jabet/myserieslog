import { supabase } from "./supabaseClient";

/**
 * Calcula la racha de visualización a partir de la actividad reciente.
 */
function calcularRacha(actividad) {
  if (!actividad.length) return { actual: 0, mejor: 0 };

  const fechas = actividad.map((a) =>
    new Date(a.created_at || a.creado_en).toDateString()
  );
  const fechasUnicas = [...new Set(fechas)].sort(
    (a, b) => new Date(b) - new Date(a)
  );

  let rachaActual = 0;
  let mejorRacha = 0;
  let rachaTemp = 1;

  const hoy = new Date().toDateString();
  const ayer = new Date(Date.now() - 86400000).toDateString();

  // Calcular racha actual
  if (fechasUnicas.length > 0) {
    const fechaReciente = fechasUnicas[0];
    if (fechaReciente === hoy || fechaReciente === ayer) {
      rachaActual = 1;
      for (let i = 1; i < fechasUnicas.length; i++) {
        const fechaAnterior = new Date(fechasUnicas[i - 1]);
        const fechaActual = new Date(fechasUnicas[i]);
        const diferenciaDias = Math.round(
          (fechaAnterior - fechaActual) / 86400000
        );
        if (diferenciaDias === 1) {
          rachaActual++;
        } else {
          break;
        }
      }
    }
  }

  // Calcular mejor racha histórica
  if (fechasUnicas.length > 1) {
    rachaTemp = 1;
    for (let i = 1; i < fechasUnicas.length; i++) {
      const fechaAnterior = new Date(fechasUnicas[i - 1]);
      const fechaActual = new Date(fechasUnicas[i]);
      const diferenciaDias = Math.round(
        (fechaAnterior - fechaActual) / 86400000
      );
      if (diferenciaDias === 1) {
        rachaTemp++;
        mejorRacha = Math.max(mejorRacha, rachaTemp);
      } else {
        rachaTemp = 1;
      }
    }
  }

  return {
    actual: rachaActual,
    mejor: Math.max(mejorRacha, rachaActual),
  };
}

/**
 * Carga todas las estadísticas del usuario necesarias para el perfil y logros.
 * @param {string} userId
 * @returns {Promise<object>} Estadísticas completas del usuario
 */
export async function cargarEstadisticasUsuario(userId) {
  try {
    // 1. Series
    const { data: seriesData, error: errorSeries } = await supabase
      .from("catalogo_usuario")
      .select(
        `
        estado,
        contenido!inner (
          media_type,
          nombre,
          nombre_original,
          generos
        )
      `
      )
      .eq("user_id", userId)
      .eq("contenido.media_type", "tv");

    // 2. Películas
    const { data: peliculasData, error: errorPeliculas } = await supabase
      .from("catalogo_usuario")
      .select(
        `
        estado,
        contenido!inner (
          media_type,
          nombre,
          nombre_original,
          duracion,
          generos
        )
      `
      )
      .eq("user_id", userId)
      .eq("contenido.media_type", "movie");

    // Series stats
    const series = {
      total: seriesData?.length || 0,
      viendo: seriesData?.filter((s) => s.estado === "viendo").length || 0,
      vistas:
        seriesData?.filter((s) => (s.estado || "").toLowerCase() === "vista")
          .length || 0,
      pendientes:
        seriesData?.filter((s) => s.estado === "pendiente").length || 0,
    };

    // Películas stats
    const peliculasVistas =
      peliculasData?.filter((p) => p.estado === "vista") || [];
    const tiempoPeliculas = peliculasVistas.reduce((acc, p) => {
      return acc + (p.contenido?.duracion || 120); // 120 min por defecto
    }, 0);

    const peliculas = {
      total: peliculasData?.length || 0,
      vistas: peliculasVistas.length,
      pendientes:
        peliculasData?.filter((p) => p.estado === "pendiente").length || 0,
      tiempoTotal: tiempoPeliculas,
    };

    // 3. Episodios vistos - SOLO CONTEO EN SUPABASE
    const { count: episodiosVistos, error: errorEpisodios } = await supabase
      .from("episodios_vistos")
      .select("episodio_id", { count: "exact", head: true })
      .eq("user_id", userId);

    // Si quieres calcular el tiempo total, ahí sí necesitas traer los datos:
    const { data: episodiosVistosData } = await supabase
      .from("episodios_vistos")
      .select(
        `
        episodio_id,
        episodios (
          duracion
        )
      `
      )
      .eq("user_id", userId)
      .range(0, 2999); // Ajusta el rango si tienes más episodios

    const tiempoTotal =
      episodiosVistosData?.reduce((acc, ev) => {
        const duracion = ev.episodios?.duracion || 45; // 45 min por defecto si no hay duración
        return acc + duracion;
      }, 0) || 0;

    // 4. Géneros favoritos
    const generosMap = new Map();
    [...(seriesData || []), ...(peliculasData || [])].forEach((item) => {
      if (item.contenido?.generos) {
        item.contenido.generos.forEach((genero) => {
          generosMap.set(genero, (generosMap.get(genero) || 0) + 1);
        });
      }
    });

    const generosFavoritos = Array.from(generosMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genero, cantidad]) => ({ genero, cantidad }));

    // 5. Racha de visualización
    const { data: actividadReciente } = await supabase
      .from("catalogo_usuario")
      .select("creado_en")
      .eq("user_id", userId)
      .order("creado_en", { ascending: false })
      .limit(30);

    const racha = calcularRacha(actividadReciente || []);

    // 6. Contenido añadido este mes
    const inicioMes = new Date();
    inicioMes.setDate(1);
    inicioMes.setHours(0, 0, 0, 0);

    const { data: contenidoEsteMes } = await supabase
      .from("catalogo_usuario")
      .select("id")
      .eq("user_id", userId)
      .gte("creado_en", inicioMes.toISOString());

    const contenidoNuevoEsteMes = contenidoEsteMes?.length || 0;

    // 7. Películas vistas con detalles
    const peliculasVistasConDetalles =
      peliculasData
        ?.filter((p) => p.estado === "vista")
        ?.map((p) => ({
          nombre: p.contenido.nombre,
          nombre_original: p.contenido.nombre_original,
          duracion: p.contenido.duracion,
        })) || [];

    // 8. Series vistas con detalles
    const seriesVistasConDetalles =
      seriesData
        ?.filter((s) => (s.estado || "").toLowerCase() === "vista")
        ?.map((s) => ({
          nombre: s.contenido.nombre,
          nombre_original: s.contenido.nombre_original,
        })) || [];

    // Devuelve el objeto de estadísticas completas
    return {
      series,
      peliculas,
      episodios: { vistos: episodiosVistos || 0, tiempoTotal },
      generosFavoritos,
      añoActividad: new Date().getFullYear(),
      racha,
      contenidoNuevoEsteMes,
      peliculasVistas: peliculasVistasConDetalles,
      episodiosNocturnos: 0, // Por implementar
      episodiosFinDeSemana: 0, // Por implementar
      seriesVistas: seriesVistasConDetalles,
      loading: false,
    };
  } catch (error) {
    console.error("Error cargando estadísticas:", error);
    throw error;
  }
}