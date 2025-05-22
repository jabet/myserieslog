// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
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
  Legend,
} from "recharts";

export default function Dashboard() {
  const [seriesPorDia, setSeriesPorDia] = useState([]);
  const [topSeries, setTopSeries] = useState([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  useEffect(() => {
    // 1) Series añadidas por día (últimos 14 días)
    supabase
      .rpc("conteo_series_por_dia")
      .then(({ data, error }) => {
        if (error) return console.error("RPC series por día:", error);
        // data = [{ fecha: "2025-05-20", total: 3 }, …]
        setSeriesPorDia(data);
      });

    // 2) Top 5 series más populares
    supabase
      .from("catalogo_usuario")
      .select("contenido_id", { count: "exact" })
      .group("contenido_id")
      .order("count", { ascending: false })
      .limit(5)
      .then(async ({ data, error }) => {
        if (error) return console.error("Top series:", error);
        // data = [{ contenido_id: 123, count: 42 }, …]
        const detalles = await Promise.all(
          data.map(async (row) => {
            const { data: c, error: err } = await supabase
              .from("contenido")
              .select("nombre")
              .eq("id", row.contenido_id)
              .single();
            return {
              nombre: err ? `ID ${row.contenido_id}` : c.nombre,
              total: row.count,
            };
          })
        );
        setTopSeries(detalles);
      });

    // 3) Total de usuarios
    supabase
      .from("usuarios")
      .select("id", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) return console.error("Total usuarios:", error);
        setTotalUsuarios(count || 0);
      });
  }, []);

  return (
    <div className="p-4 space-y-8">
      {/* Estadística numérica */}
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <h2 className="text-xl font-semibold mb-2">Total de usuarios</h2>
        <p className="text-4xl font-bold">{totalUsuarios}</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Series añadidas por día */}
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

        {/* Top 5 series más populares */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Series más populares
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSeries} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="nombre"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#10b981" name="Veces añadido" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
