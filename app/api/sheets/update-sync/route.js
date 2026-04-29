import { google } from "googleapis";

const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function nowEST() {
  return new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).replace(",", "");
}

export async function POST(request) {
  const { email } = await request.json();
  if (!email) return Response.json({ error: "email required" }, { status: 400 });

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const syncNow = nowEST();

    const syncData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "_sync!A2:B",
    });

    const syncRows = syncData.data.values || [];
    const syncIndex = syncRows.findIndex((r) => r[0]?.toLowerCase() === email.toLowerCase());

    if (syncIndex >= 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'_sync'!B${syncIndex + 2}`,
        valueInputOption: "RAW",
        requestBody: { values: [[syncNow]] },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: "_sync!A2",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[email, syncNow]] },
      });
    }

    return Response.json({ updated: true, syncNow });
  } catch (err) {
    console.error("update-sync error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
