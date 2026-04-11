import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    console.log(`Sending audio to webhook: ${audio_url} for session ${session_id}`);

    // Send to Make.com webhook
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: WEBHOOK_AUTH,
        "x-make-apikey": WEBHOOK_API_KEY,
      },
      body: JSON.stringify({
        audio_url,
        session_id,
      }),
    });

    const responseText = await webhookResponse.text();
    console.log(`Webhook response status: ${webhookResponse.status}`);
    console.log(`Webhook response body (first 500 chars): ${responseText.substring(0, 500)}`);

    // Try to parse as JSON, otherwise treat as plain text report
    let reportJson: any = null;
    let reportText = responseText;
    try {
      reportJson = JSON.parse(responseText);
      // If the JSON has a specific text field, extract it
      if (typeof reportJson === "string") {
        reportText = reportJson;
        reportJson = { report: reportJson };
      } else if (reportJson.report) {
        reportText = reportJson.report;
      } else if (reportJson.text) {
        reportText = reportJson.text;
      } else if (reportJson.result) {
        reportText = typeof reportJson.result === "string" ? reportJson.result : JSON.stringify(reportJson.result);
      }
    } catch {
      // Response is plain text, that's fine
      reportJson = { report: responseText };
    }

    // Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase
      .from("session_reports")
      .insert({
        session_id,
        audio_url,
        report_text: reportText,
        report_json: reportJson,
      });

    if (insertError) {
      console.error("Failed to save report:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        report_text: reportText,
        report_json: reportJson,
        webhook_status: webhookResponse.status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
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
