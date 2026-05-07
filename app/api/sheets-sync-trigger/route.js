import { cookies } from "next/headers";

const WEBHOOK_URL =
  "https://airciergen8n.app.n8n.cloud/webhook/bd36dfa0-5a8f-4e90-9cf9-511077dcecb3";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieStore = await cookies();
    const email = body.email || cookieStore.get("nylas_email")?.value || "";

    if (!email) return Response.json({ error: "email not found" }, { status: 400 });

    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}

    return Response.json(data || { ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
