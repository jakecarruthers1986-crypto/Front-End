// netlify/functions/generate-runway-video.js
// Uses Runway SDK v1 — imageToVideo.create() is the correct endpoint for gen4.5
// Text-to-video: omit promptImage. Image-to-video: include promptImage URL or data URI.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Ratio map: accept shorthand like "16:9" and convert to SDK format "1280:720"
const RATIO_MAP = {
  "16:9":  "1280:720",
  "9:16":  "720:1280",
  "1:1":   "1024:1024",
  "4:3":   "1024:768",
  "3:4":   "768:1024",
  // Pass-through if already in correct format
  "1280:720":  "1280:720",
  "720:1280":  "720:1280",
  "1024:1024": "1024:1024",
};

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    const body = safeJsonParse(event.body || "{}") || {};

    const promptText  = String(body.prompt || body.promptText || body.text || "").trim();
    const promptImage = body.promptImage || null; // optional URL or data URI
    const duration    = Number(body.duration ?? 5);
    const ratioIn     = String(body.aspectRatio || body.ratio || "16:9");
    const ratio       = RATIO_MAP[ratioIn] || "1280:720";
    const model       = String(body.model || "gen4.5").trim();

    if (!promptText) {
      return {
        statusCode: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing promptText" }),
      };
    }

    // Key priority: request body → Netlify env var Jake
    const rawKey = (body.runwayApiKey || process.env.Jake || "").trim().replace(/^["']|["']$/g, "");

    if (!rawKey) {
      return {
        statusCode: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing Runway API key",
          hint: "Add your key in the API Keys page, or set Netlify env var 'Jake'.",
        }),
      };
    }

    console.log(`Runway: model=${model} ratio=${ratio} duration=${duration}s keyPrefix=${rawKey.slice(0,8)}`);

    // Build request — imageToVideo endpoint handles both text-to-video and image-to-video
    const payload = {
      model,
      promptText,
      ratio,
      duration,
    };
    if (promptImage) {
      payload.promptImage = promptImage;
    }

    const res = await fetch("https://api.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${rawKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    const data = safeJsonParse(responseText);

    console.log(`Runway response status: ${res.status}`);
    console.log(`Runway response body: ${responseText.slice(0, 500)}`);

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `Runway error ${res.status}`,
          runwayResponse: data || responseText,
          keyPrefix: rawKey.slice(0, 8) + "...",
          hint: res.status === 401
            ? "401: Key rejected. Ensure it starts with 'key_' and has no extra spaces. Redeploy after setting env var."
            : res.status === 403
            ? "403: No API access. Check your Runway plan supports API usage."
            : res.status === 404
            ? "404: Endpoint not found. Model name may be wrong — try 'gen4.5' or 'gen3a_turbo'."
            : res.status === 422
            ? "422: Invalid parameters. Check ratio/duration values."
            : "Check Netlify function logs.",
        }),
      };
    }

    // Returns { id, status } — poll /v1/tasks/{id} for completion
    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data?.id ?? null,
        status: data?.status ?? "PENDING",
        raw: data,
      }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal error", message: err.message }),
    };
  }
};
