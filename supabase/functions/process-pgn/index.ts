// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../shared/cors.ts";

console.log("Outside Deno.Serve: Hello from Functions!");

Deno.serve(async (req) => {
  // This is needed to invoke from a browser.
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders });
  }

  try {
    // const supabaseClient = createClient(
    //   Deno.env.get("SUPABASE_URL") ?? "",
    //   Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    //   {
    //     global: {
    //       headers: { Authorization: req.headers.get("Authorization")! },
    //     },
    //   },
    // );

    const { gameIds } = await req.json();
    const ret = {
      message: `Game Ids to Analyze ${gameIds}!`,
    };

    // const { data } = await supabaseClient.auth.getUser();
    // console.log("User Data from Supabase", data);

    return new Response(JSON.stringify(ret), {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error) {
    console.log("Exception Caught: Error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: responseHeaders,
      status: 400,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-pgn' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
