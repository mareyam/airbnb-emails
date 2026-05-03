const WEBHOOK_URL =
  "https://airciergen8n.app.n8n.cloud/webhook/1b081626-61e0-4342-bbe4-b43c0500408b";
export async function POST(request) {
  console.log("➡️ POST /api/webhook-proxy");

  try {
    const body = await request.json();
    console.log("📥 Incoming body:", body);

    console.log("🌐 Sending to webhook:", WEBHOOK_URL);

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("📡 Webhook status:", res.status);
    console.log("📡 Content-Type:", res.headers.get("content-type"));

    const text = await res.text();
    console.log("📦 Raw response:", text);

    let data = null;
    try {
      data = JSON.parse(text);
      console.log("✅ Parsed JSON:");
    } catch (e) {
      console.error("❌ Failed to parse JSON");
    }

    return Response.json(data || { error: "Invalid JSON", raw: text });
  } catch (err) {
    console.error("💥 Webhook proxy error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// "https://airciergen8n.app.n8n.cloud/webhook/bd36dfa0-5a8f-4e90-9cf9-511077dcecb3";
