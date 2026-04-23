"use client";
import { useEffect, useState } from "react";

interface RowData {
  "Check Out": string;
  "Total Paid": string;
  "Guest Name"?: string;
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h3 style={{ margin: "0 0 10px 0" }}>{title}</h3>
      <p style={{ fontSize: "24px", fontWeight: "bold", margin: 0 }}>{value}</p>
    </div>
  );
}

export default function CheckoutRevenuePage() {
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<RowData[]>([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/sheet");
        const json = await res.json();
        const data: RowData[] = json.data || [];

        // Extract number from "Rp1,208,394.00" or similar
        function extractNumber(value: any): number {
          if (!value) return 0;
          return Number(value.toString().replace(/[^0-9]/g, "")) || 0;
        }

        // Parse date string: "Date(2026,0,2)" format
        function parseDate(dateStr: string): Date | null {
          if (!dateStr) return null;
          try {
            // Handle "Date(2026,0,2)" format
            const match = dateStr.match(/Date\((\d+),(\d+),(\d+)\)/);
            if (match) {
              const [, year, month, day] = match;
              return new Date(parseInt(year), parseInt(month), parseInt(day));
            }
            // Fallback to ISO format
            return new Date(dateStr);
          } catch {
            return null;
          }
        }

        // Filter: Check Out between Mar 23 and Apr 23, 2026
        const startDate = new Date(2026, 2, 23); // Mar 23
        const endDate = new Date(2026, 3, 23); // Apr 23

        const filtered = data.filter((row: RowData) => {
          const checkOutDate = parseDate(row["Check Out"]);
          if (!checkOutDate) return false;
          return checkOutDate > startDate && checkOutDate < endDate;
        });

        console.log("Total rows:", data.length);
        console.log(
          "Sample dates:",
          data.slice(0, 5).map((r) => r["Check Out"])
        );
        console.log("Filtered count:", filtered.length);
        filtered.forEach((row, idx) => {
          console.log(`[${idx}]`, row["Check Out"], row["Total Paid"]);
        });

        const sum = filtered.reduce((acc, row) => {
          return acc + extractNumber(row["Total Paid"]);
        }, 0);

        setFilteredData(filtered);
        setTotal(sum);
        setCount(filtered.length);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "1000px" }}>
      <h1>Checkout Revenue Analysis</h1>
      <p style={{ color: "#666" }}>
        Filter: After 2026-03-23 and Before 2026-04-23
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        <StatCard title="Entry Count" value={count} />
        <StatCard title="Total Paid (IDR)" value={total.toLocaleString()} />
      </div>

      {count > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2>Details</h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ddd",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f0f0f0" }}>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "12px",
                    textAlign: "left",
                  }}
                >
                  Check Out
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "12px",
                    textAlign: "left",
                  }}
                >
                  Total Paid
                </th>
                <th
                  style={{
                    border: "1px solid #ddd",
                    padding: "12px",
                    textAlign: "left",
                  }}
                >
                  Guest
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr
                  key={idx}
                  style={{ backgroundColor: idx % 2 ? "#fafafa" : "white" }}
                >
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {row["Check Out"]}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {row["Total Paid"]}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "12px" }}>
                    {row["Guest Name"] || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {count === 0 && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#fff3cd",
            borderRadius: "4px",
          }}
        >
          No entries found in this date range.
        </div>
      )}
    </div>
  );
}
