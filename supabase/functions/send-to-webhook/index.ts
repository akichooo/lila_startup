import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PAATCH_URL = "https://transcript.paatch.ai/api/v1/transcribe";
const PAATCH_TOKEN = "Bearer paatch_hk_569cc43a4707ed13eee9331a28afb57d4dbdacd3aab5d840";

const WEBHOOK_URL =
  "https://hook.eu1.make.com/p0vpb46s8mgcwk8o5raoepjwbh15ft10";
const WEBHOOK_AUTH = "Basic KyVZLSVtLSVkVCVIOiVN";
const WEBHOOK_API_KEY = "rAGSM-ug93wDjxn";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { audio_url, session_id } = await req.json();

    if (!audio_url || !session_id) {
      return new Response(
        JSON.stringify({ error: "audio_url and session_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Step 1: Downloading audio from ${audio_url}`);

    const audioResponse = await fetch(audio_url);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio: ${audioResponse.status}`);
    }
    const audioBlob = await audioResponse.blob();
    const fileName = audio_url.split("/").pop() || "audio.mp3";

    console.log(`Downloaded audio: ${audioBlob.size} bytes, sending to Paatch...`);

    const formData = new FormData();
    formData.append("file", audioBlob, fileName);
    formData.append("language", "en");
    formData.append("format", "json");

    const paatchResponse = await fetch(PAATCH_URL, {
      method: "POST",
      headers: {
        Authorization: PAATCH_TOKEN,
      },
      body: formData,
    });

    if (!paatchResponse.ok) {
      const errText = await paatchResponse.text();
      throw new Error(`Paatch transcription failed [${paatchResponse.status}]: ${errText}`);
    }

    const transcriptionResult = await paatchResponse.json();
    console.log(`Step 2: Paatch transcription complete.`);

    console.log(`Step 3: Sending transcription to Make.com...`);

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: WEBHOOK_AUTH,
        "x-make-apikey": WEBHOOK_API_KEY,
      },
      body: JSON.stringify({
        session_id,
        audio_url,
        transcription: transcriptionResult,
      }),
    });

    const responseText = await webhookResponse.text();
    console.log(`Webhook response status: ${webhookResponse.status}`);
    console.log(`Webhook response (first 500): ${responseText.substring(0, 500)}`);

    // Parse webhook response - expecting { Agent: "...", Assestment: {...} }
    let agentText = "";
    let assessmentData: any = null;
    let reportJson: any = null;

    try {
      reportJson = JSON.parse(responseText);

      // Handle the Agent/Assestment structure
      if (reportJson.Agent) {
        agentText = typeof reportJson.Agent === "string" ? reportJson.Agent : JSON.stringify(reportJson.Agent);
      }
      if (reportJson.Assestment) {
        assessmentData = reportJson.Assestment;
      }

      // Fallback: if no Agent key, try other common patterns
      if (!agentText) {
        if (typeof reportJson === "string") {
          agentText = reportJson;
        } else if (reportJson.report) {
          agentText = reportJson.report;
        } else if (reportJson.text) {
          agentText = reportJson.text;
        } else if (reportJson.result) {
          agentText = typeof reportJson.result === "string" ? reportJson.result : JSON.stringify(reportJson.result);
        } else {
          agentText = responseText;
        }
      }
    } catch {
      agentText = responseText;
      reportJson = { report: responseText };
    }

    // Save to database - store the full JSON and agent text
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from("session_reports")
      .insert({
        session_id,
        audio_url,
        report_text: agentText,
        report_json: reportJson,
      });

    if (insertError) {
      console.error("Failed to save report:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_text: agentText,
        assessment_data: assessmentData,
        report_json: reportJson,
        transcription: transcriptionResult,
        webhook_status: webhookResponse.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Pipeline error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
