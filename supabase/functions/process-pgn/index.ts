// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../shared/cors.ts";
import { analyzePgn } from "./analyzePgn.ts";
import { ProcessPgnResponse } from "./types.ts";

Deno.serve(async (req) => {
  // This is needed to invoke from a browser
  const responseHeaders = {
    ...corsHeaders,
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: responseHeaders });
  }

  try {
    const { gameIds } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      },
    );

    //Fetch the PGNs from Supabase
    const { data, error } = await supabaseClient
      .from("ChessHub_Games")
      .select("id, pgn")
      .in("id", gameIds);

    if (error) {
      throw error;
    }

    //Going to do this serially for now, but it's crazy inefficient and I'll have to change it later
    const analyzedGames = data?.map((game: any) => {
      return analyzePgn(game.id, game.pgn);
    });

    console.log("Game Analysis", analyzedGames);
    //const success = updateGames(analyzedGames!, supabaseClient);
    for (const analyzedGame of analyzedGames!) {
      const { data: insertedData, error: insertedError } = await supabaseClient
        .from("ChessHub_Games")
        .update({
          metadata: {
            endingFen: analyzedGame.analysis.endingFen,
            endingPhase: analyzedGame.analysis.endingPhase,
          },
        })
        .eq("id", analyzedGame.gameId);
    }

    const ret = {
      message: `Finished analyzing: ${gameIds}`,
    };

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

// async function updateGames(
//   analyzedGames: ProcessPgnResponse[],
//   supabaseClient: any,
// ): boolean {
//   let transaction = supabaseClient.from("ChessHub_Games").transaction();

//   analyzedGames.forEach((game) => {
//     transaction = transaction.update({ metadata: game.analysis })
//       .eq("id", game.gameId);
//   });

//   const { data, error } = await transaction.commit();

//   if (error) {
//     console.error("Transaction error:", error);
//     return false;
//   }

//   console.log("Transaction success, updated data:", data);
//   return true;
// }

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-pgn' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
