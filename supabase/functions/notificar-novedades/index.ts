import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: usuariosPro, error: errorUsuarios } = await supabase
    .from("usuarios")
    .select("user_id, email")
    .eq("plan", "pro");

  if (errorUsuarios) {
    console.error("Error obteniendo usuarios PRO:", errorUsuarios);
    return new Response("Error obteniendo usuarios PRO", { status: 500 });
  }

  let notificados = 0;

  for (const usuario of usuariosPro || []) {
    const { data: seriesSeguidas, error: errorSeries } = await supabase
      .from("series_seguidas")
      .select("serie_id")
      .eq("user_id", usuario.user_id);

    if (errorSeries) {
      console.error(`Error obteniendo series para usuario ${usuario.user_id}:`, errorSeries);
      continue;
    }

    if (!seriesSeguidas || seriesSeguidas.length === 0) continue;

    // Buscar novedades reales (ejemplo)
    const { data: novedades, error: errorNovedades } = await supabase
      .from("novedades")
      .select("*")
      .in("serie_id", seriesSeguidas.map(s => s.serie_id))
      .gte("fecha", new Date().toISOString().slice(0, 10)); // novedades de hoy en adelante

    if (errorNovedades) {
      console.error(`Error obteniendo novedades para usuario ${usuario.user_id}:`, errorNovedades);
      continue;
    }

    if (novedades && novedades.length > 0) {
      // Aquí iría la lógica real de envío de email o push
      // await enviarEmail(usuario.email, novedades);
      // await enviarPush(usuario.user_id, novedades);

      console.log(`Notificar a ${usuario.email} sobre novedades:`, novedades);
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
