import { google } from "googleapis";

const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

export async function GET(req) {
  try {
    // get email from query
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("📧 email from query:", email);

    if (!email) {
      return Response.json(
        { success: false, error: "Email required" },
        { status: 400 }
      );
    }

    // auth
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheetsApi = google.sheets({ version: "v4", auth });

    console.log("📊 reading tab:", email);

    // fetch data
    const dataRes = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${email}'!A1:AZ`,
    });

    const rows = dataRes.data.values || [];

    console.log("📦 rows:", rows.length);

    if (rows.length < 2) {
      return Response.json({
        success: true,
        count: 0,
        range: email,
        rows: [],
      });
    }

    // headers + rows
    const headers = rows[0];

    const dataRows = rows.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] ?? "";
      });
      return obj;
    });

    // helpers
    function parseDate(val) {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    }

    function formatDate(d) {
      if (!d) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
    }

    // filter last 90 days
    const last90Days = new Date();
    last90Days.setDate(last90Days.getDate() - 90);

    const filtered = dataRows
      .filter((row) => {
        const checkIn = parseDate(row["Check In"]);
        return checkIn && checkIn >= last90Days;
      })
      .map((row) => ({
        ...row,
        "Check In": formatDate(parseDate(row["Check In"])),
        "Check Out": formatDate(parseDate(row["Check Out"])),
        Date: formatDate(parseDate(row["Date"])),
      }));

    console.log("✅ filtered:", filtered.length);

    return Response.json({
      success: true,
      count: filtered.length,
      range: email,
      rows: filtered,
    });
  } catch (error) {
    console.error("💥 error:", error.message);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// import { cookies } from "next/headers";
// import { google } from "googleapis";

// const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

// export async function GET() {
//   try {
//     const cookieStore = await cookies();
//     const email = cookieStore.get("nylas_email")?.value;
//     console.log("📧 user email from cookie:", email);

//     if (!email) {
//       console.warn("❌ no email in cookie");
//       return Response.json(
//         { success: false, error: "Not logged in" },
//         { status: 401 }
//       );
//     }

//     const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
//     console.log(
//       "🔐 credentials parsed, client_email:",
//       credentials.client_email
//     );

//     const auth = new google.auth.GoogleAuth({
//       credentials,
//       scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
//     });

//     const sheetsApi = google.sheets({ version: "v4", auth });
//     console.log("📊 reading tab:", email, "from spreadsheet:", SPREADSHEET_ID);

//     const dataRes = await sheetsApi.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: `'${email}'!A1:AZ`,
//     });

//     const rows = dataRes.data.values || [];
//     console.log("📦 total rows returned (including header):", rows.length);

//     if (rows.length < 2) {
//       console.log("⚠️ no data rows found");
//       return Response.json({
//         success: true,
//         count: 0,
//         range: "last 90 days + future",
//         rows: [],
//       });
//     }

//     const headers = rows[0];
//     console.log("🏷️ headers:", headers);

//     const dataRows = rows.slice(1).map((row) => {
//       const obj = {};
//       headers.forEach((h, i) => {
//         obj[h] = row[i] ?? "";
//       });
//       return obj;
//     });
//     console.log("📋 data rows before filter:", dataRows.length);

//     function parseDate(val) {
//       if (!val) return null;
//       const d = new Date(val);
//       return isNaN(d.getTime()) ? null : d;
//     }

//     function formatDate(d) {
//       if (!d) return null;
//       return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//         2,
//         "0"
//       )}-${String(d.getDate()).padStart(2, "0")}`;
//     }

//     const last90Days = new Date();
//     last90Days.setDate(last90Days.getDate() - 90);
//     console.log("📅 filtering from:", last90Days.toISOString());

//     const filtered = dataRows
//       .filter((row) => {
//         const checkIn = parseDate(row["Check In"]);
//         return checkIn && checkIn >= last90Days;
//       })
//       .map((row) => ({
//         ...row,
//         "Check In": formatDate(parseDate(row["Check In"])),
//         "Check Out": formatDate(parseDate(row["Check Out"])),
//         Date: formatDate(parseDate(row["Date"])),
//       }));

//     console.log("✅ rows after filter:", filtered.length);

//     return Response.json({
//       success: true,
//       count: filtered.length,
//       range: email,
//       rows: filtered,
//     });
//   } catch (error) {
//     console.error("💥 error:", error.message);
//     return Response.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
