// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import  useUsuario  from "../hooks/useUsuario";
import useProximasEmisiones from "../hooks/useProximasEmisiones";
import ProximasEmisiones from "../components/ProximasEmisiones";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export default function Dashboard() {
  const { usuario } = useUsuario();
  const [seriesPorDia, setSeriesPorDia] = useState([]);
  const [topSeries, setTopSeries] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const { proximos, loading } = useProximasEmisiones(usuario);

  useEffect(() => {
    // 1) Series añadidas por día (RPC SQL que agrupa created_at::date)
    supabase.rpc("conteo_series_por_dia").then(({ data, error }) => {
      if (error) return console.error("RPC series por día:", error);
      // data = [{ fecha: "2025-05-20", total: 3 }, …]
      setSeriesPorDia(
        data.map((d) => ({
          fecha: d.fecha, // "YYYY-MM-DD"
          total: d.total,
        }))
      );
    });

    // 2) Top 5 series más populares (agrupado en el cliente)
    supabase
      .from("catalogo_usuario")
      .select("contenido_id")
      .then(async ({ data: allCat, error }) => {
        if (error) return console.error("Error leyendo catálogo:", error);

        // Conteo de apariciones por contenido_id
        const counts = allCat.reduce((acc, { contenido_id }) => {
          acc[contenido_id] = (acc[contenido_id] || 0) + 1;
          return acc;
        }, {});

        // Ordenamos y tomamos top 5
        const top5 = Object.entries(counts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5);

        // Traemos el nombre para cada contenido_id
        const detalles = await Promise.all(
          top5.map(async ([contenido_id, total]) => {
            const { data: c, error: err } = await supabase
              .from("contenido")
              .select("nombre")
              .eq("id", contenido_id)
              .single();
            return {
              nombre: err ? `ID ${contenido_id}` : c.nombre,
              total,
            };
          })
        );
        setTopSeries(detalles);
      });

    // 3) Total de usuarios
    supabase
      .from("usuarios")
      .select("id", { head: true, count: "exact" })
      .then(({ count, error }) => {
        if (error) return console.error("Error usuarios:", error);
        setTotalUsuarios(count || 0);
      });
  }, []);

  return (
    <div className="p-4 space-y-8">
      {/* 𝗧𝗼𝗱𝗮𝗹 𝗨𝘀𝘂𝗮𝗿𝗶𝗼𝗻𝗲𝘀 */}
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h2 className="text-xl font-semibold mb-2">Total de usuarios</h2>
        <p className="text-4xl font-bold">{totalUsuarios}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 𝗦𝗲𝗿𝗶𝗲𝘀 𝗽𝗼𝗿 𝗱𝗶𝗮 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Series añadidas por día
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={seriesPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tickFormatter={(d) =>
                    new Date(d).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(d) =>
                    new Date(d).toLocaleDateString("es-ES", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 𝗧𝗼𝗽 5 𝗦𝗲𝗿𝗶𝗲𝘀 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Series más populares</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topSeries}
                layout="vertical"
                margin={{ left: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" name="Veces añadido" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : (
          <ProximasEmisiones emisiones={proximos} />
        )}
      </div>
    </div>
  );
}
