
import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

console.log("Hello from Functions!")

serve(async (req) => {
  const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 1. Obtener usuarios PRO
  const { data: usuariosPro, error } = await supabase
    .from("usuarios")
    .select("user_id, email")
    .eq("plan", "pro");

  if (error) {
    return new Response("Error obteniendo usuarios PRO", { status: 500 });
  }

  // 2. Para cada usuario PRO, buscar novedades y enviar notificación
  for (const usuario of usuariosPro || []) {
    // Aquí deberías buscar si hay novedades para el usuario
    // Ejemplo: const novedades = await buscarNovedadesParaUsuario(usuario.user_id);

    // Si hay novedades, envía email o push (esto es solo un ejemplo)
    // await enviarEmail(usuario.email, novedades);
    // await enviarPush(usuario.user_id, novedades);
  }

  return new Response("Notificaciones procesadas", { status: 200 });
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notificar-novedades' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
