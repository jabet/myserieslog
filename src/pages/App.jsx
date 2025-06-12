import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useCatalogoUsuario from "../hooks/useCatalogoUsuario";
import useProximasEmisiones from "../hooks/useProximasEmisiones";
import useUsuario from "../hooks/useUsuario";
import useProximosEpisodiosUsuario from "../hooks/useProximosEpisodiosUsuario";
import { lazy, Suspense, useMemo, useDeferredValue } from "react";

// Lazy load de componentes pesados
const FiltrosCatalogo = lazy(() => import("../components/FiltrosCatalogo"));
const CatalogoGrid = lazy(() => import("../components/CatalogoGrid"));
const ProximasEmisiones = lazy(() => import("../components/ProximasEmisiones"));

export default function App() {
  const { usuario, idioma } = useUsuario();
  const {
    catalogo,
    tiposDisponibles,
    aniosDisponibles,
    estadosDisponibles,
    aplicarFiltros,
    loading,
  } = useCatalogoUsuario(usuario, idioma);
  const { proximos, loading: loadingProximos } = useProximasEmisiones(usuario);
  const { proximosEpisodios } = useProximosEpisodiosUsuario(usuario);

  // Memoización de cálculos pesados
  const hoy = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const idsProximos = useMemo(() => new Set(proximos.map((p) => p.contenido_id)), [proximos]);
  const conProximos = useMemo(() => catalogo
    .filter((item) => idsProximos.has(item.id))
    .map((item) => {
      const episodiosSerie = proximos.filter((p) => p.contenido_id === item.id);
      const proximoEpisodio = episodiosSerie
        .filter((ep) => ep.fecha_emision >= hoy)
        .sort((a, b) => a.fecha_emision.localeCompare(b.fecha_emision))[0];
      return { ...item, conProximos: true, proximoEpisodio };
    }), [catalogo, idsProximos, proximos, hoy]);

  const proximosMap = useMemo(() => new Map(
    proximosEpisodios.map((p) => [
      p.contenido_id,
      {
        temporada: p.temporada,
        episodio: p.episodio,
        nombre: p.episodios?.nombre,
        fecha_emision: p.episodios?.fecha_emision,
        id: p.episodios?.id,
      },
    ])
  ), [proximosEpisodios]);

  // Calcula primero las novedades (conProximos)
  const viendo = useDeferredValue(useMemo(() => catalogo
    .filter((item) => item.estado === "viendo" && !idsProximos.has(item.id))
    .map((item) => {
      const proximoEpisodio = proximosMap.get(item.id) || null;
      return { ...item, proximoEpisodio };
    }), [catalogo, idsProximos, proximosMap]));

  const idsViendo = useMemo(() => new Set(viendo.map((item) => item.id)), [viendo]);
  const pendientes = useDeferredValue(useMemo(() => catalogo.filter(
    (item) =>
      item.estado === "pendiente" &&
      !idsProximos.has(item.id) &&
      !idsViendo.has(item.id)
  ), [catalogo, idsProximos, idsViendo]));

  const idsPendientes = useMemo(() => new Set(pendientes.map((item) => item.id)), [pendientes]);
  const resto = useDeferredValue(useMemo(() => catalogo.filter(
    (item) =>
      !idsProximos.has(item.id) &&
      !idsViendo.has(item.id) &&
      !idsPendientes.has(item.id)
  ), [catalogo, idsProximos, idsViendo, idsPendientes]));

  return (
    <div className="min-h-screen flex flex-col grid-rows-[auto_1fr_auto]">
      <Navbar />
      <main className="flex-1 pt-20 px-4">
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <Suspense fallback={<div>Cargando filtros...</div>}>
              <FiltrosCatalogo
                tipos={tiposDisponibles}
                anios={aniosDisponibles}
                estados={estadosDisponibles}
                onFiltrar={aplicarFiltros}
              />
            </Suspense>
            {loading ? (
              <div className="space-y-8">
                <SkeletonSection title="Nuevos capítulos" items={5} />
                <SkeletonSection title="Continuar viendo" items={4} />
                <SkeletonSection title="Quiero ver" items={3} />
                <SkeletonSection title="Mi catálogo" items={8} />
              </div>
            ) : (
              <div className="space-y-8">
                <SectionContainer
                  show={conProximos.length > 0}
                  hasContent={conProximos.length > 0}
                >
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>Novedades</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {conProximos.length}
                    </span>
                  </h2>
                  <Suspense fallback={<div>Cargando catálogo...</div>}>
                    <CatalogoGrid catalogo={conProximos} />
                  </Suspense>
                </SectionContainer>
                <SectionContainer
                  show={viendo.length > 0}
                  hasContent={viendo.length > 0}
                >
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>Continuar viendo</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {viendo.length}
                    </span>
                  </h2>
                  <Suspense fallback={<div>Cargando catálogo...</div>}>
                    <CatalogoGrid catalogo={viendo} />
                  </Suspense>
                </SectionContainer>
                <SectionContainer
                  show={pendientes.length > 0}
                  hasContent={pendientes.length > 0}
                >
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span>Quiero ver</span>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {pendientes.length}
                    </span>
                  </h2>
                  <Suspense fallback={<div>Cargando catálogo...</div>}>
                    <CatalogoGrid catalogo={pendientes} />
                  </Suspense>
                </SectionContainer>
                <SectionContainer
                  show={resto.length > 0}
                  hasContent={resto.length > 0}
                >
                  <h2 className="text-xl font-bold mb-2">
                    <span>Mi catálogo</span>{" "}
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {resto.length}
                    </span>
                  </h2>
                  <Suspense fallback={<div>Cargando catálogo...</div>}>
                    <CatalogoGrid catalogo={resto} />
                  </Suspense>
                </SectionContainer>
              </div>
            )}
          </div>
          <aside className="w-full md:w-80 shrink-0">
            <Suspense fallback={<div>Cargando próximas emisiones...</div>}>
              <ProximasEmisiones emisiones={proximos} loading={loadingProximos} />
            </Suspense>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SkeletonSection({ title, items }) {
  const widthMap = {
    "Nuevos capítulos": "w-48",
    "Continuar viendo": "w-44",
    "Quiero ver": "w-36",
    "Mi catálogo": "w-32",
  };

  return (
    <section className="mb-8">
      <div
        className={`h-7 ${widthMap[title] || "w-40"} bg-gray-200 rounded animate-pulse mb-4`}
      ></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(items)].map((_, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="relative overflow-hidden rounded-lg shadow-md bg-white">
              <div className="aspect-[2/3] bg-gray-200 animate-pulse"></div>
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionContainer({ show, hasContent, children }) {
  if (!hasContent) return null;
  return (
    <section
      className={`mb-8 transition-all duration-500 ${
        show
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      {children}
    </section>
  );
}
