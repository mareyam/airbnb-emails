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

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) return Response.json({ error: "email required" }, { status: 400 });

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${email}'!I2:I`,
    });

    const ids = (res.data.values || [])
      .flat()
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());

    return Response.json({ ids });
  } catch (err) {
    // tab doesn't exist yet — return empty
    return Response.json({ ids: [] });
  }
}
