import { useState, useEffect } from "react";
import useUsuario from "../hooks/useUsuario";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { cargarEstadisticasUsuario } from "../utils/cargarEstadistica";
import LogrosDetalle from "../components/LogrosDetalle";
import recalcularYGuardarLogros from "../utils/recalcularYGuardarLogros";
import {
  calcularLogrosDesbloqueados,
  calcularLogrosProximos,
  obtenerEstadisticasLogros,
} from "../utils/logros";

function formatearTiempo(minutos) {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h ${mins}min`;
}

export default function Perfil() {
  const { usuario } = useUsuario();
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

  useEffect(() => {
    if (!usuario?.id) return;
    cargarEstadisticas();
    // eslint-disable-next-line
  }, [usuario]);

  const cargarEstadisticas = async () => {
    setEstadisticas((prev) => ({ ...prev, loading: true }));
    // 1) Trae todas tus stats reales
    const estadisticasCompletas = await cargarEstadisticasUsuario(usuario.id);

    // 2) Calcula logros (frontend)
    const logrosDesbloqueados = calcularLogrosDesbloqueados(
      estadisticasCompletas
    );
    const logrosProximos = calcularLogrosProximos(estadisticasCompletas);
    const resumenLogros = obtenerEstadisticasLogros(estadisticasCompletas);

    // 3) Guarda en estado local
    setEstadisticas({
      ...estadisticasCompletas,
      logros: {
        desbloqueados: logrosDesbloqueados,
        proximos: logrosProximos,
        resumen: resumenLogros,
      },
      loading: false,
    });

    // 4) Recalcula Y guarda en Supabase
    recalcularYGuardarLogros(usuario, {
      ...estadisticasCompletas,
      logros: { desbloqueados: logrosDesbloqueados },
    });
  };

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
            <div className="p-6 bg-white rounded-lg shadow">
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
            </div>

            {/* Películas */}
            <div className="p-6 bg-white rounded-lg shadow">
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
            </div>

            {/* Episodios */}
            <div className="p-6 bg-white rounded-lg shadow">
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
            </div>

            {/* Racha */}
            <div className="p-6 bg-white rounded-lg shadow">
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
            </div>
          </div>

          {/* Logros: pasa las estadísticas completas al componente */}
          <section className="mb-8">
            <LogrosDetalle stats={estadisticas} usuario={usuario} />
          </section>

          {/* Géneros favoritos */}
          {estadisticas.generosFavoritos.length > 0 && (
            <div className="p-6 bg-white rounded-lg shadow mb-8">
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
            </div>
          )}

          {/* Actividad reciente */}
          <div className="p-6 bg-white rounded-lg shadow">
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
