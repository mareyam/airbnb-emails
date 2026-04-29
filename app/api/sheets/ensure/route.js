import { google } from "googleapis";

const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

const HEADERS = [
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
  console.log("🔐 Initializing Google Auth");

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    console.error("❌ GOOGLE_SERVICE_ACCOUNT_KEY missing");
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  const credentials = JSON.parse(raw);
  console.log("✅ Credentials parsed");

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(request) {
  console.log("📥 /api/sheets/ensure called");

  try {
    const body = await request.json();
    console.log("📦 Request body:", body);

    const { email } = body;

    if (!email) {
      console.warn("⚠️ Missing email");
      return Response.json({ error: "email required" }, { status: 400 });
    }

    console.log("👤 Email:", email);

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    console.log("📊 Fetching spreadsheet metadata...");
    const meta = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const titles = meta.data.sheets.map((s) => s.properties.title);
    console.log("📄 Existing tabs:", titles);

    const requests = [];
    let userTabCreated = false;

    if (!titles.includes(email)) {
      console.log("➕ Creating user tab:", email);
      requests.push({ addSheet: { properties: { title: email } } });
      userTabCreated = true;
    } else {
      console.log("✅ User tab already exists");
    }

    if (!titles.includes("_sync")) {
      console.log("➕ Creating _sync tab");
      requests.push({ addSheet: { properties: { title: "_sync" } } });
    }

    if (requests.length > 0) {
      console.log("🚀 Sending batchUpdate:", requests);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests },
      });
      console.log("✅ batchUpdate done");
    } else {
      console.log("ℹ️ No sheet creation needed");
    }

    if (userTabCreated) {
      console.log("📝 Writing headers to user tab");
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${email}'!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADERS] },
      });
      console.log("✅ Headers written");
    }

    if (!titles.includes("_sync")) {
      console.log("📝 Writing _sync headers");
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'_sync'!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [["Email", "Last Sync"]] },
      });
      console.log("✅ _sync headers written");
    }

    console.log("🎉 Done");

    return Response.json({
      exists: !userTabCreated,
      created: userTabCreated,
    });
  } catch (err) {
    console.error("❌ Sheet ensure error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
// import { google } from "googleapis";

// const SPREADSHEET_ID = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

// const HEADERS = [
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
//   const credentials = JSON.parse(raw);
//   return new google.auth.GoogleAuth({
//     credentials,
//     scopes: ["https://www.googleapis.com/auth/spreadsheets"],
//   });
// }

// export async function POST(request) {
//   try {
//     const { email } = await request.json();
//     if (!email) return Response.json({ error: "email required" }, { status: 400 });

//     const auth = getAuth();
//     const sheets = google.sheets({ version: "v4", auth });

//     // Check existing sheet tabs
//     const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
//     const titles = meta.data.sheets.map((s) => s.properties.title);

//     const requests = [];
//     let userTabCreated = false;

//     if (!titles.includes(email)) {
//       requests.push({ addSheet: { properties: { title: email } } });
//       userTabCreated = true;
//     }

//     if (!titles.includes("_sync")) {
//       requests.push({ addSheet: { properties: { title: "_sync" } } });
//     }

//     if (requests.length > 0) {
//       await sheets.spreadsheets.batchUpdate({
//         spreadsheetId: SPREADSHEET_ID,
//         requestBody: { requests },
//       });
//     }

//     if (userTabCreated) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SPREADSHEET_ID,
//         range: `'${email}'!A1`,
//         valueInputOption: "RAW",
//         requestBody: { values: [HEADERS] },
//       });
//     }

//     if (!titles.includes("_sync")) {
//       await sheets.spreadsheets.values.update({
//         spreadsheetId: SPREADSHEET_ID,
//         range: `'_sync'!A1`,
//         valueInputOption: "RAW",
//         requestBody: { values: [["Email", "Last Sync"]] },
//       });
//     }

//     return Response.json({ exists: !userTabCreated, created: userTabCreated });
//   } catch (err) {
//     console.error("Sheet ensure error:", err.message);
//     return Response.json({ error: err.message }, { status: 500 });
//   }
// }
