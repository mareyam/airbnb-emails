"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

const WEBHOOK_URL = "/api/webhook-proxy";

// ── Normalise raw Nylas API fields (snake_case) ────────────────────────────

function fmtFrom(arr: any[]): string {
  if (!arr?.length) return "";
  const { name, email } = arr[0];
  return name ? `${name} <${email}>` : email;
}

function fmtTo(arr: any[]): string {
  if (!arr?.length) return "";
  return arr
    .map(({ name, email }) => (name ? `"${name}" <${email}>` : email))
    .join(", ");
}

function fmtDate(unix: number): string {
  if (!unix) return "";
  return new Date(unix * 1000).toUTCString();
}

function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalise(msg: any) {
  return {
    id: msg.id,
    messageId: msg.id,
    threadId: msg.thread_id || msg.threadId || "",
    from: fmtFrom(msg.from),
    to: fmtTo(msg.to),
    subject: msg.subject || "(no subject)",
    date: fmtDate(msg.date),
    rawDate: msg.date,
    body: stripHtml(msg.body) || msg.snippet || "",
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [webhookSent, setWebhookSent] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [sheetExists, setSheetExists] = useState<boolean | null>(null);
  const [noNewEmails, setNoNewEmails] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedRows, setUploadedRows] = useState<any[]>([]);
  const [uploadHeaders, setUploadHeaders] = useState<string[]>([]);
  const [savingToSheet, setSavingToSheet] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [uploadStats, setUploadStats] = useState<{ unique: number; dupes: number } | null>(null);
  const msgsRef = useRef<any[]>([]);
  const emailRef = useRef("");

  async function loadEmails() {
    setLoading(true);
    const r = await fetch("/api/nylas/messages");
    if (r.status === 401) {
      router.push("/signup");
      console.log('here');
      return;
    }

    const data = await r.json();
    console.log('data');
    console.log(data);

    if (data.error) {
      router.push("/signup");
      console.log('here 2');
      return;
    }

    const msgs = (data.messages || []).map(normalise).filter((m: any) => {
      const text = `${m.subject} ${m.from} ${m.body}`.toLowerCase();
      return text.includes("airbnb") || text.includes("aircierge");
    });
    const email: string = data.email || "";

    console.log("msgs");
    console.log(msgs);

    msgsRef.current = msgs;
    emailRef.current = email;
    setMessages(msgs);
    setUserEmail(email);
    setFetchedAt(new Date().toLocaleTimeString());
    setLoading(false);
  }

  useEffect(() => {
    console.log("going to load");
    loadEmails();
  }, []);

  // async function handleSync() {
  //   const msgs = msgsRef.current;
  //   const email = emailRef.current;
  //   if (!msgs.length || !email) return;

  //   setSyncing(true);
  //   try {
  //     const webhookRes = await fetch(WEBHOOK_URL, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         user: { name: email.split("@")[0], email, image: "" },
  //         emails: msgs,
  //       }),
  //     });

  //     if (webhookRes.ok) {
  //       const raw = await webhookRes.json().catch(() => null);
  //       if (raw) {
  //         const arr = Array.isArray(raw) ? raw : [raw];
  //         const firstItem = arr[0];

  //         // Format A: [{ user, data: [...] }]
  //         // Format B: [{ output: "```json...```" }, ...]
  //         let rows: any[] = [];
  //         if (firstItem?.data) {
  //           rows = firstItem.data;
  //         } else {
  //           rows = arr.flatMap((item: any) => {
  //             const src: string = item?.output ?? item?.json?.output ?? "";
  //             if (src) {
  //               try {
  //                 const cleaned = src
  //                   .replace(/```json/gi, "")
  //                   .replace(/```/g, "")
  //                   .trim();
  //                 return [JSON.parse(cleaned)];
  //               } catch {
  //                 return [];
  //               }
  //             }
  //             return typeof item === "object" && item !== null ? [item] : [];
  //           });
  //         }

  //         const userEmail: string = firstItem?.user?.email || email;

  //         if (rows.length > 0 && userEmail) {
  //           await fetch("/api/sheets/ensure", {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ email: userEmail }),
  //           });

  //           await fetch("/api/sheets/write", {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({ email: userEmail, rows }),
  //           });

  //           setParsedRows(rows);
  //           setWebhookSent(true);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     console.error("Sync error:", err);
  //   } finally {
  //     setSyncing(false);
  //   }
  // }

  async function handleSync() {
    console.log("going to sync");

    const email = emailRef.current;

    console.log("msgs + email");
    console.log(msgsRef.current);
    console.log(email);

    if (!email) return;

    setNoNewEmails(null);
    setSyncing(true);

    const CHUNK_SIZE = 15;

    try {
      // check last sync date
      const syncRes = await fetch(`/api/sheets/sync-date?email=${encodeURIComponent(email)}`);
      const syncData = await syncRes.json();
      console.log("sync date data", syncData);
      const lastSync: string | null = syncData.lastSync || null;

      let msgsToSync: any[];

      if (lastSync) {
        console.log("last sync date found:", lastSync);
        const r = await fetch(`/api/nylas/messages?since=${encodeURIComponent(lastSync)}`);
        const data = await r.json();
        console.log("fresh messages data", data);
        const fresh = (data.messages || []).map(normalise).filter((m: any) => {
          const text = `${m.subject} ${m.from} ${m.body}`.toLowerCase();
          return text.includes("airbnb") || text.includes("aircierge");
        });

        if (fresh.length === 0) {
          const updateRes = await fetch("/api/sheets/update-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          const updateData = await updateRes.json();
          setNoNewEmails(updateData.syncNow || lastSync);
          setSyncing(false);
          return;
        }
        msgsToSync = fresh;
      } else {
        msgsToSync = msgsRef.current;
      }

      if (!msgsToSync.length) {
        setSyncing(false);
        return;
      }

      const batches: any[][] = [];
      console.log("msgs length");
      console.log(msgsToSync.length);

      for (let i = 0; i < msgsToSync.length; i += CHUNK_SIZE) {
        batches.push(msgsToSync.slice(i, i + CHUNK_SIZE));
      }

      let sheetChecked = false;
      let resolvedEmail = email;
      const allRows: any[] = [];

      for (const batch of batches) {
        console.log("batch", batch);

        const webhookRes = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: { name: email.split("@")[0], email, image: "" },
            emails: batch,
          }),
        });

        if (!webhookRes.ok) {
          console.error("Webhook failed:", await webhookRes.text());
          continue;
        }

        const raw = await webhookRes.json().catch(() => null);
        const arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const firstItem = arr[0];

        const batchRows: any[] = firstItem?.data ?? [];
        allRows.push(...batchRows);

        if (!sheetChecked) {
          sheetChecked = true;
          resolvedEmail = firstItem?.user?.email || email;

          const ensureRes = await fetch("/api/sheets/ensure", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: resolvedEmail }),
          });
          const ensureData = await ensureRes.json();

          if (ensureData.exists) {
            console.log("yes");
            setSheetExists(true);
          } else {
            console.log("no");
            setSheetExists(false);
          }
        }
      }

      if (allRows.length > 0) {
        setParsedRows(allRows);
        await fetch("/api/sheets/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resolvedEmail, rows: allRows }),
        });
      }

      setWebhookSent(true);
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setSyncing(false);
    }
  }
  // ── Loading ──
  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          fontFamily: "system-ui",
        }}
      >
        <p style={{ color: "#666" }}>Fetching your emails…</p>
      </div>
    );

  // ── Loaded ──
  return (
    <>
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        fontFamily: "system-ui",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e1e1e",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span
            style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}
          >
            AirCierge
          </span>
          <span style={{ color: "#444", fontSize: 13, marginLeft: 12 }}>
            Email Sync
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {userEmail && (
            <span style={{ fontSize: 13, color: "#666" }}>{userEmail}</span>
          )}
          <button
            onClick={() => { setUploadFile(null); setShowUpload(true); }}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "system-ui",
            }}
          >
            Upload Reservation
          </button>
          <button
            onClick={loadEmails}
            disabled={loading || syncing}
            style={{
              background: "transparent",
              color: "#888",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: loading || syncing ? "not-allowed" : "pointer",
              fontFamily: "system-ui",
            }}
          >
            {loading ? "Refreshing…" : "Refresh Emails"}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{
              background: syncing ? "#1a1a1a" : "#fff",
              color: syncing ? "#666" : "#0f0f0f",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: syncing ? "not-allowed" : "pointer",
              fontFamily: "system-ui",
            }}
          >
            {syncing ? "Syncing…" : "Sync to Sheets"}
          </button>
          <a
            href="/api/nylas/disconnect"
            style={{
              background: "transparent",
              color: "#666",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 12,
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Disconnect
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 32,
            flexWrap: "wrap",
          }}
        >
          <div style={statCard}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {messages.length}
            </div>
            <div style={statLabel}>Emails fetched</div>
          </div>
          <div style={{ ...statCard, flex: 2, minWidth: 240 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>
              {userEmail || "Connected"}
            </div>
            <div style={statLabel}>Connected account</div>
          </div>
          <div style={statCard}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: webhookSent ? "#22c55e" : "#f59e0b",
              }}
            >
              {webhookSent ? `Synced ${fetchedAt}` : "Syncing…"}
            </div>
            <div style={statLabel}>Webhook status</div>
          </div>
          {sheetExists !== null && (
            <div style={statCard}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: sheetExists ? "#22c55e" : "#f59e0b",
                }}
              >
                {sheetExists ? "Yes" : "No"}
              </div>
              <div style={statLabel}>Sheet exists</div>
            </div>
          )}
        </div>

        {noNewEmails !== null && (
          <div
            style={{
              background: "#1a1200",
              border: "1px solid #78350f",
              borderRadius: 10,
              padding: "16px 24px",
              marginBottom: 32,
              color: "#f59e0b",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            No new emails found after {noNewEmails}
          </div>
        )}

        {/* Parsed webhook response */}
        {parsedRows.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#888",
                marginBottom: 12,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Parsed by AI ({parsedRows.length} email
              {parsedRows.length > 1 ? "s" : ""})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {parsedRows.map((row, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0d1f14",
                    border: "1px solid #1a3a22",
                    borderRadius: 10,
                    padding: "20px 24px",
                  }}
                >
                  {/* Top line: subject + reservation id */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#fff",
                        lineHeight: 1.4,
                        flex: 1,
                      }}
                    >
                      {row.subject || row["subject"] || "(no subject)"}
                    </div>
                    {row["Reservation ID"] && (
                      <span
                        style={{
                          fontSize: 11,
                          color: "#22c55e",
                          background: "#052e16",
                          border: "1px solid #166534",
                          borderRadius: 4,
                          padding: "2px 8px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        {row["Reservation ID"]}
                      </span>
                    )}
                  </div>

                  {/* Key fields grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "8px 16px",
                    }}
                  >
                    {[
                      ["Platform", row["Platform"] || row["platform"]],
                      ["Event Type", row["Event Type"]],
                      ["Booking Status", row["Booking Status"]],
                      ["Guest Name", row["Guest Name"]],
                      ["Check In", row["Check In"]],
                      ["Check Out", row["Check Out"]],
                      ["Nights", row["Nights"]],
                      ["Guests", row["Number of Guests"]],
                      ["Property", row["Property Name"]],
                      ["Total Paid", row["Total Paid"]],
                      ["Host Payout", row["Host Payout"]],
                      ["Currency", row["Currency"]],
                      ["Reservation Confirmed", row["Reservation Confirmed"]],
                      ["Canceled", row["Canceled Reservation"]],
                    ]
                      .filter(
                        ([, v]) =>
                          v !== undefined &&
                          v !== null &&
                          v !== "" &&
                          v !== "null"
                      )
                      .map(([label, value]) => (
                        <div key={label as string}>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#555",
                              marginBottom: 2,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {label as string}
                          </div>
                          <div style={{ fontSize: 13, color: "#ccc" }}>
                            {String(value)}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email list */}
        {messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "#444",
              fontSize: 14,
            }}
          >
            No emails found
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: "#141414",
                  border: "1px solid #222",
                  borderRadius: 10,
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#fff",
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {msg.subject}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#444",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {msg.rawDate
                      ? new Date(msg.rawDate * 1000).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : ""}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
                  {msg.from}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#3a3a3a",
                    lineHeight: 1.6,
                    borderTop: "1px solid #1e1e1e",
                    paddingTop: 10,
                    whiteSpace: "pre-wrap",
                    maxHeight: 80,
                    overflow: "hidden",
                  }}
                >
                  {msg.body.slice(0, 200)}
                  {msg.body.length > 200 ? "…" : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* Upload Reservation Modal */}
    {showUpload && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false); }}
      >
        <div
          style={{
            background: "#141414",
            border: "1px solid #2a2a2a",
            borderRadius: 12,
            padding: "32px",
            width: 480,
            fontFamily: "system-ui",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Upload Reservation</span>
            <button
              onClick={() => setShowUpload(false)}
              style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 18 }}
            >
              ✕
            </button>
          </div>

          <div
            style={{
              border: "2px dashed #2a2a2a",
              borderRadius: 8,
              padding: "40px 24px",
              textAlign: "center",
              cursor: "pointer",
              background: uploadFile ? "#0d1f14" : "#1a1a1a",
              borderColor: uploadFile ? "#166534" : "#2a2a2a",
            }}
            onClick={() => document.getElementById("upload-input")?.click()}
          >
            <input
              id="upload-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setUploadFile(file);
                setUploadedRows([]);
                setUploadHeaders([]);
              }}
            />
            {uploadFile ? (
              <div>
                <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 600, marginBottom: 4 }}>
                  {uploadFile.name}
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>
                  {(uploadFile.size / 1024).toFixed(1)} KB — click to change
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>
                  Click to select a CSV or Excel file
                </div>
                <div style={{ fontSize: 12, color: "#444" }}>.csv, .xlsx, .xls supported</div>
              </div>
            )}
          </div>

          {/* Preview table */}
          {uploadedRows.length > 0 && (
            <div style={{ marginTop: 20, overflowX: "auto", maxHeight: 300, overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>
                    {uploadHeaders.map((h) => (
                      <th key={h} style={{ padding: "6px 10px", background: "#1a1a1a", color: "#888", textAlign: "left", whiteSpace: "nowrap", borderBottom: "1px solid #2a2a2a" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadedRows.map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                      {uploadHeaders.map((h) => (
                        <td key={h} style={{ padding: "5px 10px", color: "#ccc", whiteSpace: "nowrap" }}>
                          {row[h] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 12, marginTop: 10, display: "flex", gap: 16 }}>
                <span style={{ color: "#555" }}>{uploadedRows.length} rows total</span>
                {uploadStats && (
                  <>
                    <span style={{ color: "#22c55e", fontWeight: 600 }}>{uploadStats.unique} unique</span>
                    <span style={{ color: "#f59e0b", fontWeight: 600 }}>{uploadStats.dupes} duplicates (will be skipped)</span>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
            <button
              onClick={() => { setShowUpload(false); setUploadFile(null); setUploadedRows([]); setUploadHeaders([]); }}
              style={{
                background: "transparent",
                color: "#666",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "system-ui",
              }}
            >
              Cancel
            </button>
            <button
              disabled={!uploadFile || uploading}
              onClick={async () => {
                if (!uploadFile) return;
                setUploading(true);
                const buf = await uploadFile.arrayBuffer();
                const wb = XLSX.read(buf, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const data: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
                const headers = data.length > 0 ? Object.keys(data[0]) : [];
                setUploadHeaders(headers);
                setUploadedRows(data);
                setUploadStats(null);
                setSaveResult(null);

                // check existing IDs in sheet
                const email = emailRef.current;
                if (email && data.length > 0) {
                  const idsRes = await fetch(`/api/sheets/existing-ids?email=${encodeURIComponent(email)}`);
                  const idsData = await idsRes.json();
                  const existingSet = new Set<string>(idsData.ids || []);
                  let unique = 0, dupes = 0;
                  data.forEach((row) => {
                    const code = String(row["Confirmation code"] ?? "").toLowerCase();
                    if (code && existingSet.has(code)) dupes++;
                    else unique++;
                  });
                  setUploadStats({ unique, dupes });
                }

                setUploading(false);
              }}
              style={{
                background: !uploadFile || uploading ? "#1a1a1a" : "#fff",
                color: !uploadFile || uploading ? "#555" : "#0f0f0f",
                border: "1px solid #2a2a2a",
                borderRadius: 6,
                padding: "8px 16px",
                fontSize: 13,
                cursor: !uploadFile || uploading ? "not-allowed" : "pointer",
                fontWeight: 600,
                fontFamily: "system-ui",
              }}
            >
              {uploading ? "Reading…" : uploadedRows.length > 0 ? "Re-read" : "Upload"}
            </button>
            {uploadedRows.length > 0 && (
              <button
                disabled={savingToSheet}
                onClick={async () => {
                  const email = emailRef.current;
                  if (!email || !uploadedRows.length) return;
                  setSavingToSheet(true);
                  setSaveResult(null);

                  const mapped = uploadedRows.map((row) => ({
                    "Reservation ID":   row["Confirmation code"] ?? "",
                    "ThreadID":         row["Confirmation code"] ?? "",
                    "MessageID":        row["Confirmation code"] ?? "",
                    "Booking Status":   row["Status"] ?? "",
                    "Guest Name":       row["Guest name"] ?? "",
                    "Adults":           row["# of adults"] ?? "",
                    "Children":         row["# of children"] ?? "",
                    "Infants":          row["# of infants"] ?? "",
                    "Check In":         row["Start date"] ?? "",
                    "Check Out":        row["End date"] ?? "",
                    "Nights":           row["# of nights"] ?? "",
                    "Date":             row["Booked"] ?? "",
                    "Property Name":    row["Listing"] ?? "",
                    "Host Payout":      row["Earnings"] ?? "",
                  }));

                  await fetch("/api/sheets/ensure", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });

                  const res = await fetch("/api/sheets/write", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, rows: mapped }),
                  });
                  const result = await res.json();
                  setSaveResult(
                    result.rowsWritten !== undefined
                      ? `${result.rowsWritten} rows written, ${result.skipped} skipped`
                      : "Error saving"
                  );
                  setSavingToSheet(false);
                }}
                style={{
                  background: savingToSheet ? "#1a1a1a" : "#22c55e",
                  color: savingToSheet ? "#555" : "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: 13,
                  cursor: savingToSheet ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontFamily: "system-ui",
                }}
              >
                {savingToSheet ? "Saving…" : "Save to Sheet"}
              </button>
            )}
          </div>
          {saveResult && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#22c55e", textAlign: "right" }}>
              {saveResult}
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
}

const statCard: React.CSSProperties = {
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  padding: "16px 24px",
  flex: 1,
  minWidth: 180,
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#555",
  marginTop: 4,
};
