import { google } from "googleapis";

const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

const FIELD_ORDER = [
  "Reservation ID",
  "Check In",
  "Check Out",
  "Booking Status",
  "Total Paid",
  "subject",
  "Email From",
  "Name",
  "ThreadID",
  "MessageID",
  "Email To",
  "Date",
  "Event Type",
  "Platform",
  "Guest Name",
  "Number of Guests",
  "Adults",
  "Children",
  "Infants",
  "Pets",
  "Property Name",
  "Listing ID",
  "Nights",
  "Check In Time",
  "Check Out Time",
  "Host Payout",
  "Cleaning Fee",
  "Service Fee",
  "Currency",
  "Guest Message",
  "Message Type",
  "Last Message Sent",
  "Response Deadline Hours",
  "Early Check In Requested",
  "Late Checkout Requested",
  "Extension Requested",
  "Special Requests",
  "Email Subject Type",
  "Reservation Confirmed",
  "Reservation Updated",
  "Canceled Reservation",
  "Reservation Conversation (RE:)",
  "Inquiry",
  "Same Day Inquiry",
  "Pending Reservation Request",
  "Change Request",
  "Issue Resolution",
  "Email from",
  "Booking Confirmation",
  "platform",
];

function getAuth() {
  console.log("🔐 getAuth() start");

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("❌ missing GOOGLE_SERVICE_ACCOUNT_KEY");
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  console.log("📦 parsing credentials");
  const creds = JSON.parse(raw);

  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(request) {
  console.log("📥 /api/sheets/write hit");

  try {
    const body = await request.json();
    console.log("📦 body received:", {
      email: body.email,
      rows: body.rows?.length,
    });

    const { email, rows } = body;

    if (!email || !rows?.length) {
      console.warn("⚠️ missing email or rows");
      return Response.json(
        { error: "email and rows required" },
        { status: 400 }
      );
    }

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // ── READ EXISTING THREAD IDS ─────────────────────────────
    console.log("📖 fetching existing ThreadIDs...");

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${email}'!I2:I`,
    });

    const existingThreadIds = new Set(
      (existing.data.values || [])
        .flat()
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
    );

    console.log("🧠 existing threads:", existingThreadIds.size);

    // ── FILTER DUPLICATES ────────────────────────────────────
    const newRows = rows.filter((row) => {
      const tid = row["ThreadID"] || row["threadId"] || row["threadid"] || "";

      if (!tid) return true;

      const exists = existingThreadIds.has(String(tid).toLowerCase());
      if (exists) console.log("⏭️ skipping duplicate:", tid);

      return !exists;
    });

    console.log(
      `📊 rows: incoming=${rows.length}, new=${newRows.length}, skipped=${
        rows.length - newRows.length
      }`
    );

    if (!newRows.length) {
      console.log("ℹ️ nothing to write");
      return Response.json({
        success: true,
        rowsWritten: 0,
        skipped: rows.length,
      });
    }

    // ── MAP VALUES ───────────────────────────────────────────
    const values = newRows.map((row) =>
      FIELD_ORDER.map((field) => {
        const val = row[field];
        return val != null ? String(val) : "";
      })
    );

    console.log("✍️ writing to sheet...");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${email}'!A2`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values },
    });

    console.log("✅ append done");

    // ── SYNC SHEET UPDATE ────────────────────────────────────
    console.log("🔄 syncing _sync sheet");

    const syncNow = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).replace(",", "");

    const syncData = await sheets.spreadsheets.values
      .get({
        spreadsheetId: SPREADSHEET_ID,
        range: `'_sync'!A2:B`,
      })
      .catch((e) => {
        console.warn("⚠️ _sync read failed:", e.message);
        return { data: { values: [] } };
      });

    const syncRows = syncData.data.values || [];
    const syncIndex = syncRows.findIndex((r) => r[0] === email);

    if (syncIndex >= 0) {
      console.log("✏️ updating sync row");
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'_sync'!B${syncIndex + 2}`,
        valueInputOption: "RAW",
        requestBody: { values: [[syncNow]] },
      });
    } else {
      console.log("➕ inserting sync row");
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `'_sync'!A2`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: [[email, syncNow]] },
      });
    }

    console.log("🎉 write complete");

    return Response.json({
      success: true,
      rowsWritten: values.length,
      skipped: rows.length - newRows.length,
    });
  } catch (err) {
    console.error("❌ Sheet write error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
// import { google } from "googleapis";

// const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

// // Must match the header row order exactly
// const FIELD_ORDER = [
// "Reservation ID",
// "Check In",
// "Check Out",
// "Booking Status",
// "Total Paid",
// "subject",
// "Email From",
// "Name",
// "ThreadID",
// "MessageID",
// "Email To",
// "Date",
// "Event Type",
// "Platform",
// "Guest Name",
// "Number of Guests",
// "Adults",
// "Children",
// "Infants",
// "Pets",
// "Property Name",
// "Listing ID",
// "Nights",
// "Check In Time",
// "Check Out Time",
// "Host Payout",
// "Cleaning Fee",
// "Service Fee",
// "Currency",
// "Guest Message",
// "Message Type",
// "Last Message Sent",
// "Response Deadline Hours",
// "Early Check In Requested",
// "Late Checkout Requested",
// "Extension Requested",
// "Special Requests",
// "Email Subject Type",
// "Reservation Confirmed",
// "Reservation Updated",
// "Canceled Reservation",
// "Reservation Conversation (RE:)",
// "Inquiry",
// "Same Day Inquiry",
// "Pending Reservation Request",
// "Change Request",
// "Issue Resolution",
// "Email from",
// "Booking Confirmation",
// "platform",
// ];

// function getAuth() {
//   const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
//   if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
//   return new google.auth.GoogleAuth({
//     credentials: JSON.parse(raw),
//     scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//   });
// }

// export async function POST(request) {
//   try {
//     const { email, rows } = await request.json();
//     if (!email || !rows?.length) {
//       return Response.json({ error: "email and rows required" }, { status: 400 });
//     }

//     const auth = getAuth();
//     const sheets = google.sheets({ version: "v4", auth });

//     // Read existing ThreadID (column I) to prevent duplicates — case-insensitive
//     const existing = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: `'${email}'!I2:I`,
//     });

//     const existingThreadIds = new Set(
//       (existing.data.values || [])
//         .flat()
//         .filter(Boolean)
//         .map((v) => v.toLowerCase())
//     );

//     const newRows = rows.filter((row) => {
//       const tid = row["ThreadID"] || row["threadId"] || row["threadid"] || "";
//       if (!tid) return true; // no ThreadID — always write
//       return !existingThreadIds.has(tid.toLowerCase());
//     });

//     if (!newRows.length) {
//       return Response.json({ success: true, rowsWritten: 0, skipped: rows.length });
//     }

//     const values = newRows.map((row) =>
//       FIELD_ORDER.map((field) => {
//         const val = row[field];
//         return val !== undefined && val !== null ? String(val) : "";
//       })
//     );

//     await sheets.spreadsheets.values.append({
//       spreadsheetId: SPREADSHEET_ID,
//       range: `'${email}'!A2`,
//       valueInputOption: "USER_ENTERED",
//       insertDataOption: "INSERT_ROWS",
//       requestBody: { values },
//     });

//     // Upsert _sync sheet
//     const syncNow = new Date().toISOString();
//     const syncData = await sheets.spreadsheets.values.get({
//       spreadsheetId: SPREADSHEET_ID,
//       range: `'_sync'!A2:B`,
//     }).catch(() => ({ data: { values: [] } }));

//     const syncRows = syncData.data.values || [];
//     const syncRowIndex = syncRows.findIndex((r) => r[0] === email);

//     if (syncRowIndex >= 0) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SPREADSHEET_ID,
//         range: `'_sync'!B${syncRowIndex + 2}`,
//         valueInputOption: "RAW",
//         requestBody: { values: [[syncNow]] },
//       });
//     } else {
//       await sheets.spreadsheets.values.append({
//         spreadsheetId: SPREADSHEET_ID,
//         range: `'_sync'!A2`,
//         valueInputOption: "RAW",
//         insertDataOption: "INSERT_ROWS",
//         requestBody: { values: [[email, syncNow]] },
//       });
//     }

//     return Response.json({ success: true, rowsWritten: values.length, skipped: rows.length - newRows.length });
//   } catch (err) {
//     console.error("Sheet write error:", err.message);
//     return Response.json({ error: err.message }, { status: 500 });
//   }
// }
