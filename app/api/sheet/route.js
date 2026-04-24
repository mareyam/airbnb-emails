export async function GET() {
  try {
    const spreadsheetId = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

    const res = await fetch(url);
    const text = await res.text();

    const json = JSON.parse(
      text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
    );

    const cols = json.table.cols.map((c) => c.label || "col");

    function parseGoogleDate(value) {
      if (!value) return null;

      const match = String(value).match(/Date\((\d+),(\d+),(\d+)\)/);
      if (!match) return null;

      const [_, y, m, d] = match;
      return new Date(Number(y), Number(m), Number(d));
    }

    function formatDate(date) {
      if (!date) return null;

      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");

      return `${y}-${m}-${d}`;
    }

    const today = new Date();
    const last90Days = new Date();
    last90Days.setDate(today.getDate() - 90);

    const data = json.table.rows
      .map((row) => {
        const obj = {};

        row.c.forEach((cell, i) => {
          const raw = cell?.v ?? null;
          obj[cols[i] || `col${i}`] = raw;
        });

        return obj;
      })
      .filter((row) => {
        const checkIn = parseGoogleDate(row["Check In"]);
        if (!checkIn) return false;

        // last 90 days + future dates allowed
        return checkIn >= last90Days;
      })
      .map((row) => {
        return {
          ...row,
          "Check In": formatDate(parseGoogleDate(row["Check In"])),
          "Check Out": formatDate(parseGoogleDate(row["Check Out"])),
          Date: formatDate(parseGoogleDate(row["Date"])),
        };
      });

    return Response.json({
      success: true,
      count: data.length,
      range: "last 90 days + future",
      rows: data,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
// export async function GET() {
//   try {
//     const spreadsheetId = "1R2c8STbQ8Q2q9aqgB3DHI4_xcBwMd-gqOlDaGIHTkxY";

//     const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json`;

//     const res = await fetch(url);
//     const text = await res.text();

//     const json = JSON.parse(
//       text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1)
//     );

//     const cols = json.table.cols.map((c) => c.label || "col");

//     function parseGoogleDate(value) {
//       if (!value) return null;

//       const match = String(value).match(/Date\((\d+),(\d+),(\d+)\)/);
//       if (!match) return value;

//       const [_, y, m, d] = match;
//       const date = new Date(Number(y), Number(m), Number(d));

//       return date.toISOString().split("T")[0]; // YYYY-MM-DD
//     }

//     const data = json.table.rows.map((row) => {
//       const obj = {};

//       row.c.forEach((cell, i) => {
//         const raw = cell?.v ?? null;
//         obj[cols[i] || `col${i}`] = parseGoogleDate(raw);
//       });

//       return obj;
//     });

//     return Response.json({
//       success: true,
//       count: data.length,
//       rows: data,
//     });
//   } catch (error) {
//     return Response.json(
//       {
//         success: false,
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
