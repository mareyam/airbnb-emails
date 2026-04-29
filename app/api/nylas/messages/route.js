import { cookies } from "next/headers";

const NYLAS_API_URI = process.env.NYLAS_API_URI || "https://api.us.nylas.com";
const NYLAS_API_KEY = process.env.NYLAS_API_KEY;

export async function GET(request) {
  console.log("➡️ GET /api/nylas/messages");

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since"); // ISO date string, e.g. "2026-04-29T16:05:45.837Z"

  const cookieStore = await cookies();
  const grantId =
    cookieStore.get("nylas_grant_id")?.value || process.env.NYLAS_GRANT_ID;
  const email = cookieStore.get("nylas_email")?.value || "";

  console.log("🍪 Cookies:", { grantId, email });
  console.log("📅 Since:", since);

  if (!grantId) {
    console.warn("❌ No grantId found");
    return Response.json({ error: "Not connected" }, { status: 401 });
  }

  try {
    const params = new URLSearchParams({
      limit: "100",
      search_query_native: "airbnb OR aircierge",
    });

    if (since) {
      const receivedAfter = Math.floor(new Date(since).getTime() / 1000);
      params.set("received_after", String(receivedAfter));
    }

    const url = `${NYLAS_API_URI}/v3/grants/${grantId}/messages?${params}`;
    console.log("🌐 Request URL:", url);

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${NYLAS_API_KEY}`,
      },
    });

    console.log("📡 Response status:", res.status);

    const data = await res.json();

    console.log("📦 Response data keys:", Object.keys(data || {}));
    console.log("📬 Messages received:", data?.data?.length || 0);

    if (!res.ok) {
      console.error("❌ Nylas error:", data);
      return Response.json(
        { error: data?.error?.message || "Nylas request failed" },
        { status: 500 }
      );
    }

    const allMessages = data.data || [];

    const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
    const filtered = since
      ? allMessages
      : allMessages.filter((m) => (m.date || 0) >= ninetyDaysAgo);

    console.log("✅ Filtered messages:", filtered.length);

    return Response.json({ messages: filtered, email });
  } catch (err) {
    console.error("💥 Nylas messages error:", err);
    return Response.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
// import { cookies } from "next/headers";

// const NYLAS_API_URI = process.env.NYLAS_API_URI || "https://api.us.nylas.com";
// const NYLAS_API_KEY = process.env.NYLAS_API_KEY;

// export async function GET() {
//   const cookieStore = await cookies();
//   const grantId =
//     cookieStore.get("nylas_grant_id")?.value || process.env.NYLAS_GRANT_ID;
//   const email = cookieStore.get("nylas_email")?.value || "";

//   if (!grantId) {
//     return Response.json({ error: "Not connected" }, { status: 401 });
//   }

//   try {
//     const allMessages = [];
//     let pageToken = null;
//     const MAX_PAGES = 20; // safety cap — 20 × 200 = 4 000 emails max
//     let page = 0;

//     do {
//       const params = new URLSearchParams({
//         limit: "200",
//         search_query_native: "airbnb OR aircierge",
//       });
//       if (pageToken) params.set("page_token", pageToken);

//       const res = await fetch(
//         `${NYLAS_API_URI}/v3/grants/${grantId}/messages?${params}`,
//         {
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${NYLAS_API_KEY}`,
//           },
//         }
//       );

//       const data = await res.json();

//       if (!res.ok) {
//         console.error("Nylas error:", data);
//         return Response.json(
//           { error: data?.error?.message || "Nylas request failed" },
//           { status: 500 }
//         );
//       }

//       allMessages.push(...(data.data || []));
//       pageToken = data.next_cursor || null;
//       page++;
//     } while (pageToken && page < MAX_PAGES);

//     const ninetyDaysAgo = Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60;
//     const filtered = allMessages.filter((m) => (m.date || 0) >= ninetyDaysAgo);

//     return Response.json({ messages: filtered, email });
//   } catch (err) {
//     console.error("Nylas messages error:", err);
//     return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
//   }
// }
