export async function GET() {
  const sheetId = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";
  const gid = "391308531";

  const res = await fetch(
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?gid=${gid}&tqx=out:json`
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

  function parseDate(value) {
    if (!value) return null;

    // Google format: Date(2026,0,26)
    const g = String(value).match(/Date\((\d+),(\d+),(\d+)\)/);
    if (g) {
      const y = Number(g[1]);
      const m = Number(g[2]);
      const d = Number(g[3]);
      return new Date(y, m, d);
    }

    // ISO format: 2026-01-26
    if (typeof value === "string" && value.includes("-")) {
      const d = new Date(value + "T00:00:00");
      return isNaN(d) ? null : d;
    }

    return null;
  }

  // format date with +1 month fix
  function formatDate(date) {
    if (!date) return null;

    const y = date.getFullYear();
    const m = date.getMonth() + 1; // FIX HERE
    const d = date.getDate();

    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const today = new Date();
  const last90Days = new Date();
  last90Days.setDate(today.getDate() - 90);

  const data = rows
    .map((r) => {
      const values = r.c.map((c) => c?.v ?? "");
      const obj = {};

      headers.forEach((h, i) => {
        obj[h] = values[i] ?? "";
      });

      return obj;
    })
    .filter((row) => {
      const checkIn = parseDate(row["Check In"]);
      if (!checkIn) return false;
      return checkIn >= last90Days;
    })
    .map((row) => {
      row["Check In"] = formatDate(parseDate(row["Check In"]));
      row["Check Out"] = formatDate(parseDate(row["Check Out"]));
      row["Date"] = formatDate(parseDate(row["Date"]));

      return row;
    });

  return Response.json({
    message: `Number of records found: ${data.length}`,
    count: data.length,
    data,
  });
  //testing
}
