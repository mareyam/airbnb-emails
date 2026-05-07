import { cookies } from "next/headers";

export async function POST(request) {
  try {
    const { webhookUrl, ...rest } = await request.json();
    if (!webhookUrl) return Response.json({ error: "webhookUrl required" }, { status: 400 });

    const cookieStore = await cookies();
    const email = cookieStore.get("nylas_email")?.value || "";

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...rest }),
    });

    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch {}

    return Response.json(data || { ok: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
