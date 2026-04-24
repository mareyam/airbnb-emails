export const dynamic = "force-dynamic";

export async function GET() {
  const sheetId = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";
  const gid = "391308531";

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`,
    { cache: "no-store" }
  );

  const text = await res.text();
  const json = JSON.parse(text.substring(47).slice(0, -2));

  const rows = json.table.rows;

  const headers = [
    "Reservation ID",
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
    "Check In",
    "Check Out",
    "Nights",
    "Check In Time",
    "Check Out Time",
    "Total Paid",
    "Host Payout",
    "Cleaning Fee",
    "Service Fee",
    "Currency",
    "Booking Status",
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
    "Reservation Conversation",
    "Inquiry",
    "Same Day Inquiry",
    "Pending Reservation Request",
    "Change Request",
    "Issue Resolution",
    "Email from",
    "Booking Confirmation",
    "platform",
  ];

  const data = rows.map((r) => {
    const values = r.c.map((c) => c?.v ?? "");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj;
  });

  return Response.json({
    count: data.length,
    data,
  });
}
// export async function GET() {
//   const sheetId = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

//   const res = await fetch(
//     `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
//   );

//   const text = await res.text();
//   const json = JSON.parse(text.substring(47).slice(0, -2));

//   const rows = json.table.rows;

//   const headers = [
//     "Reservation ID",
//     "subject",
//     "Email From",
//     "Name",
//     "ThreadID",
//     "MessageID",
//     "Email To",
//     "Date",
//     "Event Type",
//     "Platform",
//     "Guest Name",
//     "Number of Guests",
//     "Adults",
//     "Children",
//     "Infants",
//     "Pets",
//     "Property Name",
//     "Listing ID",
//     "Check In",
//     "Check Out",
//     "Nights",
//     "Check In Time",
//     "Check Out Time",
//     "Total Paid",
//     "Host Payout",
//     "Cleaning Fee",
//     "Service Fee",
//     "Currency",
//     "Booking Status",
//     "Guest Message",
//     "Message Type",
//     "Last Message Sent",
//     "Response Deadline Hours",
//     "Early Check In Requested",
//     "Late Checkout Requested",
//     "Extension Requested",
//     "Special Requests",
//     "Email Subject Type",
//     "Reservation Confirmed",
//     "Reservation Updated",
//     "Canceled Reservation",
//     "Reservation Conversation",
//     "Inquiry",
//     "Same Day Inquiry",
//     "Pending Reservation Request",
//     "Change Request",
//     "Issue Resolution",
//     "Email from",
//     "Booking Confirmation",
//     "platform",
//   ];

//   function parseDate(value) {
//     if (!value) return null;

//     // ISO format
//     if (value.includes("-")) {
//       const d = new Date(value);
//       return isNaN(d.getTime()) ? null : d;
//     }

//     // Google Sheets format: Date(2026,3,27)
//     const match = value.match(/Date\((\d+),(\d+),(\d+)\)/);
//     if (match) {
//       const [, y, m, d] = match.map(Number);
//       return new Date(y, m - 1, d);
//     }

//     return null;
//   }

//   const start = new Date("2026-03-23");
//   const end = new Date("2026-04-23");

//   const data = rows
//     .map((r) => {
//       const values = r.c.map((c) => c?.v ?? "");

//       const obj = {};
//       headers.forEach((h, i) => {
//         obj[h] = values[i] ?? "";
//       });

//       return obj;
//     })
//     .filter((row) => {
//       const checkOut = parseDate(row["Check Out"]);
//       if (!checkOut) return false;

//       return checkOut >= start && checkOut <= end;
//     });

//   return Response.json({
//     count: data.length,
//     data,
//   });
// }
