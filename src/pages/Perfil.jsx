import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import useUsuario from "../hooks/useUsuario";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Card } from "@radix-ui/themes";
import {
  calcularLogrosDesbloqueados,
  calcularLogrosProximos,
  obtenerEstadisticasLogros,
  obtenerLogrosRecientes,
} from "../utils/logros";
import { notificarLogroDesbloqueado } from "../utils/notificaciones";

export default function Perfil() {
  const { usuario, perfil, loading } = useUsuario();
  const [estadisticas, setEstadisticas] = useState({
    series: { total: 0, viendo: 0, vistas: 0, pendientes: 0 },
    peliculas: { total: 0, vistas: 0, pendientes: 0 },
    episodios: { vistos: 0, tiempoTotal: 0 },
    generosFavoritos: [],
    añoActividad: new Date().getFullYear(),
    racha: { actual: 0, mejor: 0 },
    logros: {
      desbloqueados: [],
      proximos: [],
      resumen: { total: 0, desbloqueados: 0, porcentaje: 0 },
    },
    loading: true,
  });
  const [mostrarTodosLogros, setMostrarTodosLogros] = useState(false);

  useEffect(() => {
    if (!usuario?.id) return;
    cargarEstadisticas();
    // eslint-disable-next-line
  }, [usuario]);

  const cargarEstadisticas = async () => {
    try {
      setEstadisticas((prev) => ({ ...prev, loading: true }));

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
        .eq("user_id", usuario.id)
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
        .eq("user_id", usuario.id)
        .eq("contenido.media_type", "movie");

      if (errorSeries) {
        console.error("Error cargando series:", errorSeries);
      }

      const series = {
        total: seriesData?.length || 0,
        viendo: seriesData?.filter((s) => s.estado === "viendo").length || 0,
        vistas:
          seriesData?.filter((s) => (s.estado || "").toLowerCase() === "vista")
            .length || 0,
        pendientes:
          seriesData?.filter((s) => s.estado === "pendiente").length || 0,
      };

      if (errorPeliculas) {
        console.error("Error cargando películas:", errorPeliculas);
      }

      // Calcular tiempo total de películas vistas
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
        .eq("user_id", usuario.id);

      if (errorEpisodios) {
        console.error("Error cargando episodios vistos:", errorEpisodios);
      }

      // Si quieres calcular el tiempo total, ahí sí necesitas traer los datos:
      const { data: episodiosVistosData, error: errorEpisodiosData } =
        await supabase
          .from("episodios_vistos")
          .select(
            `
    episodio_id,
    episodios (
      duracion
    )
  `
          )
          .eq("user_id", usuario.id)
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

      // 5. Racha de visualización - CORREGIDO para usar catalogo_usuario
      const { data: actividadReciente, error: errorActividad } = await supabase
        .from("catalogo_usuario")
        .select("creado_en") // Cambiado a creado_en
        .eq("user_id", usuario.id)
        .order("creado_en", { ascending: false })
        .limit(30);

      if (errorActividad) {
        console.error("Error cargando actividad:", errorActividad);
      }

      const racha = calcularRacha(actividadReciente || []);

      // 6. Estadística adicional: Contenido añadido este mes
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const { data: contenidoEsteMes } = await supabase
        .from("catalogo_usuario")
        .select("id")
        .eq("user_id", usuario.id)
        .gte("creado_en", inicioMes.toISOString()); // Cambiar a creado_en

      const contenidoNuevoEsteMes = contenidoEsteMes?.length || 0;

      // NUEVO: Cargar detalles de películas vistas para logros especiales
      const { data: peliculasVistasDetalle, error: errorPeliculasDetalle } =
        await supabase
          .from("catalogo_usuario")
          .select(
            `
          estado,
          contenido!inner (
            media_type,
            nombre,
            nombre_original,
            duracion
          )
        `
          )
          .eq("user_id", usuario.id)
          .eq("contenido.media_type", "movie")
          .eq("estado", "vista");

      if (errorPeliculasDetalle) {
        console.error(
          "Error cargando detalles de películas vistas:",
          errorPeliculasDetalle
        );
      }

      // CORREGIDO: Mapear usando 'nombre' en lugar de 'titulo'
      const peliculasVistasConDetalles =
        peliculasData
          ?.filter((p) => p.estado === "vista")
          ?.map((p) => ({
            nombre: p.contenido.nombre,
            nombre_original: p.contenido.nombre_original,
            duracion: p.contenido.duracion,
          })) || [];

      const seriesVistasConDetalles =
        seriesData
          ?.filter((s) => (s.estado || "").toLowerCase() === "vista")
          ?.map((s) => ({
            nombre: s.contenido.nombre,
            nombre_original: s.contenido.nombre_original,
          })) || [];

      // NUEVO: 7. Calcular logros con estadísticas completas INCLUYENDO películas vistas
      const estadisticasCompletas = {
        series,
        peliculas,
        episodios: { vistos: episodiosVistos || 0, tiempoTotal },
        generosFavoritos,
        añoActividad: new Date().getFullYear(),
        racha,
        contenidoNuevoEsteMes,
        // NUEVO: Añadir películas vistas para logros especiales
        peliculasVistas: peliculasVistasConDetalles,
        // Estadísticas adicionales para logros especiales
        episodiosNocturnos: 0, // Por implementar
        episodiosFinDeSemana: 0, // Por implementar
        seriesVistas: seriesVistasConDetalles, // NUEVO: Series vistas
      };

      // Calcular logros
      const logrosDesbloqueados = calcularLogrosDesbloqueados(
        estadisticasCompletas
      );
      const logrosProximos = calcularLogrosProximos(estadisticasCompletas);
      const resumenLogros = obtenerEstadisticasLogros(estadisticasCompletas);

      // NUEVO: Cargar logros desbloqueados desde Supabase
      const { data: logrosGuardados, error: errorLogrosGuardados } =
        await supabase
          .from("logros_usuario")
          .select("logro_id, desbloqueado_en")
          .eq("user_id", usuario.id);

      if (errorLogrosGuardados) {
        console.error("Error cargando logros guardados:", errorLogrosGuardados);
      }

      // 1. Antes de actualizar logros, guarda los IDs actuales
      const logrosAntes = logrosGuardados?.map((l) => l.logro_id) || [];

      // 2. Guarda los nuevos logros desbloqueados
      for (const logro of logrosDesbloqueados) {
        const yaGuardado = logrosGuardados?.some(
          (l) => l.logro_id === logro.id
        );
        if (!yaGuardado) {
          await supabase.from("logros_usuario").upsert(
            [
              {
                user_id: usuario.id,
                logro_id: logro.id,
                desbloqueado_en: new Date().toISOString(),
              },
            ],
            { onConflict: ["user_id", "logro_id"] }
          );
        }
      }

      const nuevosLogros = logrosDesbloqueados.filter(
        l => !logrosAntes.includes(l.id)
      );
      for (const logro of nuevosLogros) {
        await notificarLogroDesbloqueado(usuario.id, logro);
      }

      // Añadir la fecha de desbloqueo a los logros para mostrarla en la UI
      let logrosDesbloqueadosConFecha = logrosDesbloqueados.map((logro) => {
        const guardado = logrosGuardados?.find((l) => l.logro_id === logro.id);
        return {
          ...logro,
          desbloqueado_en: guardado?.desbloqueado_en || null,
        };
      });

      // ORDENAR de más reciente a más antiguo
      logrosDesbloqueadosConFecha = logrosDesbloqueadosConFecha.sort((a, b) => {
        if (!a.desbloqueado_en) return 1;
        if (!b.desbloqueado_en) return -1;
        return new Date(b.desbloqueado_en) - new Date(a.desbloqueado_en);
      });

      setEstadisticas({
        ...estadisticasCompletas,
        logros: {
          desbloqueados: logrosDesbloqueadosConFecha,
          proximos: logrosProximos,
          resumen: resumenLogros,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      setEstadisticas((prev) => ({ ...prev, loading: false }));
    }
  };

  const calcularRacha = (actividad) => {
    if (!actividad.length) return { actual: 0, mejor: 0 };

    // Usar el campo correcto (created_at o creado_en)
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

      // Si la actividad más reciente fue hoy o ayer, empezar racha
      if (fechaReciente === hoy || fechaReciente === ayer) {
        rachaActual = 1;

        // Revisar días consecutivos hacia atrás
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
  };

  const formatearTiempo = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) {
      return `${dias}d ${horas % 24}h`;
    } else if (horas > 0) {
      return `${horas}h ${minutos % 60}m`;
    } else {
      return `${minutos}m`;
    }
  };

  if (estadisticas.loading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
            <p className="text-gray-600">
              Resumen de tu actividad en {estadisticas.añoActividad}
            </p>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Series */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Series</h3>
                <span className="text-2xl">📺</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-medium">
                    {estadisticas.series.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Viendo:</span>
                  <span className="font-medium text-blue-600">
                    {estadisticas.series.viendo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Terminadas:</span>
                  <span className="font-medium text-green-600">
                    {estadisticas.series.vistas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes:</span>
                  <span className="font-medium text-orange-600">
                    {estadisticas.series.pendientes}
                  </span>
                </div>
              </div>
            </Card>

            {/* Películas */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Películas
                </h3>
                <span className="text-2xl">🎬</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-medium">
                    {estadisticas.peliculas.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vistas:</span>
                  <span className="font-medium text-green-600">
                    {estadisticas.peliculas.vistas}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pendientes:</span>
                  <span className="font-medium text-orange-600">
                    {estadisticas.peliculas.pendientes}
                  </span>
                </div>
                {estadisticas.peliculas.tiempoTotal > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tiempo visto:</span>
                    <span className="font-medium text-blue-600">
                      {formatearTiempo(estadisticas.peliculas.tiempoTotal)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Episodios */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Episodios
                </h3>
                <span className="text-2xl">📊</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vistos:</span>
                  <span className="font-medium">
                    {estadisticas.episodios.vistos}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tiempo total:</span>
                  <span className="font-medium text-purple-600">
                    {formatearTiempo(estadisticas.episodios.tiempoTotal)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Racha */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Racha</h3>
                <span className="text-2xl">🔥</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actual:</span>
                  <span className="font-medium text-orange-600">
                    {estadisticas.racha.actual} días
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mejor:</span>
                  <span className="font-medium text-red-600">
                    {estadisticas.racha.mejor} días
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* NUEVO: Sistema de Logros Mejorado */}
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Logros</h3>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm text-gray-600">
                  {estadisticas.logros.resumen.desbloqueados}/
                  {estadisticas.logros.resumen.total}
                </span>
              </div>
            </div>

            {/* Progreso general */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Progreso general</span>
                <span>{estadisticas.logros.resumen.porcentaje}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${estadisticas.logros.resumen.porcentaje}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Logros desbloqueados */}
            {estadisticas.logros.desbloqueados.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>✅</span>
                  Logros desbloqueados (
                  {estadisticas.logros.desbloqueados.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {(mostrarTodosLogros
                    ? estadisticas.logros.desbloqueados
                    : estadisticas.logros.desbloqueados.slice(0, 12)
                  ).map((logro) => (
                    <div
                      key={logro.id}
                      className={`text-center p-3 rounded-lg border ${logro.color}`}
                      title={
                        logro.descripcion +
                        (logro.desbloqueado_en
                          ? `\nDesbloqueado: ${new Date(
                              logro.desbloqueado_en
                            ).toLocaleDateString()}`
                          : "")
                      }
                    >
                      <span className="text-2xl mb-1 block">{logro.emoji}</span>
                      <span className="text-xs font-medium block leading-tight">
                        {logro.nombre}
                      </span>
                      {logro.desbloqueado_en && (
                        <span className="text-[10px] text-gray-500 block mt-1">
                          {new Date(logro.desbloqueado_en).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {estadisticas.logros.desbloqueados.length > 12 &&
                  !mostrarTodosLogros && (
                    <p
                      className="text-xs text-blue-600 mt-2 cursor-pointer hover:underline"
                      onClick={() => setMostrarTodosLogros(true)}
                    >
                      +{estadisticas.logros.desbloqueados.length - 12} logros
                      más...
                    </p>
                  )}
                {estadisticas.logros.desbloqueados.length > 12 &&
                  mostrarTodosLogros && (
                    <p
                      className="text-xs text-blue-600 mt-2 cursor-pointer hover:underline"
                      onClick={() => setMostrarTodosLogros(false)}
                    >
                      Mostrar menos
                    </p>
                  )}
              </div>
            )}

            {/* Próximos logros */}
            {estadisticas.logros.proximos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  Próximos logros
                </h4>
                <div className="space-y-3">
                  {estadisticas.logros.proximos.slice(0, 4).map((logro) => (
                    <div
                      key={logro.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xl opacity-70">{logro.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {logro.nombre}
                          </span>
                          <span className="text-xs text-gray-600 ml-2">
                            {logro.progreso}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {logro.descripcion}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${logro.progreso}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado sin logros */}
            {estadisticas.logros.desbloqueados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🏆</span>
                <p className="font-medium">¡Empieza tu aventura!</p>
                <p className="text-sm">
                  Añade contenido y ve episodios para desbloquear logros
                </p>
              </div>
            )}
          </Card>

          {/* Géneros favoritos */}
          {estadisticas.generosFavoritos.length > 0 && (
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Géneros Favoritos
              </h3>
              <div className="space-y-3">
                {estadisticas.generosFavoritos.map(
                  ({ genero, cantidad }, index) => (
                    <div
                      key={genero}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">
                          #{index + 1}
                        </span>
                        <span className="text-sm text-gray-900">{genero}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-200 rounded-full h-2 flex-1 min-w-20">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (cantidad /
                                  estadisticas.generosFavoritos[0].cantidad) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 min-w-8">
                          {cantidad}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* Actividad reciente */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Actividad de Este Mes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl mb-2 block">📅</span>
                <span className="text-lg font-bold text-blue-600">
                  {estadisticas.contenidoNuevoEsteMes || 0}
                </span>
                <p className="text-sm text-blue-700">Títulos añadidos</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <span className="text-2xl mb-2 block">🔥</span>
                <span className="text-lg font-bold text-green-600">
                  {estadisticas.racha.actual}
                </span>
                <p className="text-sm text-green-700">Días de racha</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <span className="text-2xl mb-2 block">🎯</span>
                <span className="text-lg font-bold text-purple-600">
                  {estadisticas.logros.proximos.length}
                </span>
                <p className="text-sm text-purple-700">Logros próximos</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
