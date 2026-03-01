// netlify/functions/get-runway-task.js
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  try {
    // Accept key from query param, body, OR env var
    const bodyData = safeJsonParse(event.body || "{}") || {};
    const rawKey = event.queryStringParameters?.runwayApiKey || bodyData.runwayApiKey || process.env.Jake || "";
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing Runway API key. Set env var 'Jake' in Netlify or enter it in API Keys." }),
      };
    }

    const id = event.queryStringParameters?.id || bodyData.id;
    if (!id) {
      return {
        statusCode: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing task id" }),
      };
    }

    const res = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    const text = await res.text();
    const data = safeJsonParse(text);

    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Runway task fetch failed", details: data || text }),
      };
    }

    const status = data?.status || "UNKNOWN";
    const output = Array.isArray(data?.output) ? data.output : [];
    const videoUrl = output.find(u => typeof u === "string" && u.includes(".mp4")) || output[0] || null;

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "runway", id: data?.id ?? id, status, videoUrl, output, raw: data }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal error", message: err.message }),
    };
  }
};
