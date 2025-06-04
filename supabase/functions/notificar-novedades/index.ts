import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  // Inicializa el cliente de Supabase con las variables de entorno
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Obtener usuarios PRO
  const { data: usuariosPro, error: errorUsuarios } = await supabase
    .from("usuarios")
    .select("user_id, email")
    .eq("plan", "pro");

  if (errorUsuarios) {
    console.error("Error obteniendo usuarios PRO:", errorUsuarios);
    return new Response("Error obteniendo usuarios PRO", { status: 500 });
  }

  let notificados = 0;

  // 2. Para cada usuario PRO, buscar novedades y enviar notificación
  for (const usuario of usuariosPro || []) {
    // Ejemplo: buscar series seguidas por el usuario
    const { data: seriesSeguidas, error: errorSeries } = await supabase
      .from("series_seguidas")
      .select("serie_id")
      .eq("user_id", usuario.user_id);

    if (errorSeries) {
      console.error(`Error obteniendo series para usuario ${usuario.user_id}:`, errorSeries);
      continue;
    }

    // Aquí deberías buscar novedades reales (nuevas temporadas/episodios)
    // Por ejemplo, podrías consultar una tabla de novedades o comparar fechas

    // Simulación: Si el usuario sigue al menos una serie, lo notificamos
    if (seriesSeguidas && seriesSeguidas.length > 0) {
      // Aquí iría la lógica real de envío de email o push
      // await enviarEmail(usuario.email, novedades);
      // await enviarPush(usuario.user_id, novedades);

      console.log(`Notificar a ${usuario.email} sobre novedades en sus series.`);
      notificados++;
    }
  }

  return new Response(
    `Notificaciones procesadas. Usuarios notificados: ${notificados}`,
    { status: 200 }
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notificar-novedades' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
