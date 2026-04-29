"use client";

import SignupPage from "./signup/page";

export default function Page() {
  return <SignupPage />;
}
// "use client";

// import { useSession, signIn, signOut } from "next-auth/react";
// import { useEffect, useState, useRef } from "react";

// const EMAIL_PROVIDER_MAP: Record<string, string> = {
  // "gmail.com": "google",
  // "googlemail.com": "google",
  // "icloud.com": "apple",
  // "me.com": "apple",
  // "mac.com": "apple",
  // "outlook.com": "azure-ad",
  // "hotmail.com": "azure-ad",
  // "hotmail.co.uk": "azure-ad",
  // "live.com": "azure-ad",
  // "live.co.uk": "azure-ad",
  // "msn.com": "azure-ad",
  // "yahoo.com": "yahoo",
  // "yahoo.co.uk": "yahoo",
  // "yahoo.com.au": "yahoo",
  // "ymail.com": "yahoo",
  // "rocketmail.com": "yahoo",
// };

// function GoogleIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
//       <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
//       <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
//       <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
//       <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
//     </svg>
//   );
// }

// function AppleIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ flexShrink: 0 }}>
//       <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
//     </svg>
//   );
// }

// function MicrosoftIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink: 0 }}>
//       <path d="M11.4 24H0V12.6h11.4V24z" fill="#F1511B" />
//       <path d="M24 24H12.6V12.6H24V24z" fill="#80CC28" />
//       <path d="M11.4 11.4H0V0h11.4v11.4z" fill="#00ADEF" />
//       <path d="M24 11.4H12.6V0H24v11.4z" fill="#FBBC09" />
//     </svg>
//   );
// }

// function YahooIcon() {
//   return (
//     <svg viewBox="0 0 24 24" width="18" height="18" fill="#6001D2" style={{ flexShrink: 0 }}>
//       <path d="M0 0h8.027L12 9.627 15.999 0H24l-9.237 20.285H8.697L11.13 15.05 0 0z" />
//     </svg>
//   );
// }

// function providerBtn(bg: string, color: string, border: string): React.CSSProperties {
//   return {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     width: "100%",
//     background: bg,
//     color,
//     border: `1px solid ${border}`,
//     borderRadius: 8,
//     padding: "12px 16px",
//     fontSize: 14,
//     fontWeight: 600,
//     cursor: "pointer",
//     fontFamily: "system-ui",
//   };
// }

// export default function Home() {
//   const { data: session, status } = useSession();
//   const [emails, setEmails] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchedAt, setFetchedAt] = useState<string | null>(null);
//   const [emailInput, setEmailInput] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [nylasEmails, setNylasEmails] = useState<any[]>([]);
//   const [nylasLoading, setNylasLoading] = useState(false);
//   const [showNylasView, setShowNylasView] = useState(false);

//   const sentSignupWebhook = useRef(false);

//   async function handleAppleSignIn() {
//     setShowNylasView(true);
//     setNylasLoading(true);
//     try {
//       const res = await fetch(
//         "https://api.us.nylas.com/v3/grants/b89deb4b-6876-41df-a4ee-63a2b04e0a78/messages?limit=5&unread=true",
//         {
//           headers: {
//             Accept: "application/json",
//             Authorization:
//               "Bearer nyk_v0_r1cIJdsqlCmuvSM92kiaClOVOjDMfh9Sp2PejTmAtpLkCeNktIlarLdZuIshi65g",
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       const data = await res.json();
//       const normalized = (data.data || []).map((msg: any) => ({
//         id: msg.id,
//         subject: msg.subject || "(no subject)",
//         from: msg.from?.[0]
//           ? `${msg.from[0].name} <${msg.from[0].email}>`
//           : "",
//         to: msg.to?.[0]?.email || "",
//         date: new Date((msg.date || 0) * 1000).toISOString(),
//         body: msg.body || msg.snippet || "",
//       }));
//       setNylasEmails(normalized);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setNylasLoading(false);
//     }
//   }

//   function handleEmailContinue(e: React.FormEvent) {
//     e.preventDefault();
//     const domain = emailInput.split("@")[1]?.toLowerCase().trim();
//     const provider = domain ? EMAIL_PROVIDER_MAP[domain] : undefined;
//     if (provider === "apple") {
//       handleAppleSignIn();
//     } else if (provider) {
//       signIn(provider, {}, { login_hint: emailInput });
//     } else {
//       setEmailError("We support Gmail, iCloud, Outlook, and Yahoo addresses.");
//     }
//   }

//   const accessToken = session?.accessToken;

//   // ✅ SIGNUP WEBHOOK (FIXED)
//   useEffect(() => {
//     if (!session || !accessToken || sentSignupWebhook.current) return;

//     sentSignupWebhook.current = true;

//     fetch(
//       "https://airciergen8n.app.n8n.cloud/webhook/bd36dfa0-5a8f-4e90-9cf9-511077dcecb3",
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           user: session.user,
//           accessToken,
//         }),
//       }
//     ).catch(console.error);
//   }, [session, accessToken]);

//   // ✅ EMAIL FETCH + WEBHOOK
//   useEffect(() => {
//     async function loadEmails() {
//       if (!accessToken) return;

//       setLoading(true);

//       // const query = encodeURIComponent("newer_than:90d from:aircierge");
//       // const query = encodeURIComponent(
//       //   "newer_than:90d (from:aircierge OR from:airbnb)"
//       // );

//       const query = encodeURIComponent("newer_than:90d (aircierge OR airbnb)");

//       const res = await fetch(
//         `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=400`,
//         {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );

//       const data = await res.json();

//       const fullEmails = await Promise.all(
//         (data.messages || []).map(async (msg: any) => {
//           const r = await fetch(
//             `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
//             {
//               headers: { Authorization: `Bearer ${accessToken}` },
//             }
//           );
//           return r.json();
//         })
//       );

//       const cleaned = fullEmails
//         .map((email: any) => {
//           const headers = email.payload?.headers || [];

//           const get = (name: string) =>
//             headers.find((h: any) => h.name === name)?.value || "";

//           const part =
//             email.payload?.parts?.find(
//               (p: any) => p.mimeType === "text/plain"
//             ) || email.payload?.body;

//           const body = part?.body?.data
//             ? atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))
//             : "";

//           return {
//             id: email.id,
//             threadId: email.threadId,
//             from: get("From"),
//             to: get("To"),
//             subject: get("Subject"),
//             date: get("Date"),
//             body,
//           };
//         })

//         .filter((email) => {
//           const text = (email.from + email.subject + email.body).toLowerCase();
//           return text.includes("aircierge") || text.includes("airbnb");
//         });

//       setEmails(cleaned);
//       setFetchedAt(new Date().toLocaleTimeString());
//       setLoading(false);

//       // 🔥 SEND ALL EMAILS TO YOUR WEBHOOK (FIXED)
//       const chunkSize = 20;

//       for (let i = 0; i < cleaned.length; i += chunkSize) {
//         const chunk = cleaned.slice(i, i + chunkSize);

//         await fetch(
//           "https://airciergen8n.app.n8n.cloud/webhook/bd36dfa0-5a8f-4e90-9cf9-511077dcecb3",
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               user: session?.user,
//               accessToken,
//               emails: chunk,
//             }),
//           }
//         );
//       }
//     }

//     loadEmails();
//   }, [accessToken]);

//   const dateRange = () => {
//     const now = new Date();
//     const past = new Date();
//     past.setDate(now.getDate() - 90);

//     return `${past.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     })} — ${now.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: "numeric",
//     })}`;
//   };

//   if (status === "loading")
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "#0f0f0f",
//           color: "#fff",
//           fontFamily: "system-ui",
//         }}
//       >
//         <p style={{ color: "#666" }}>Loading...</p>
//       </div>
//     );

//   if (showNylasView)
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           background: "#0f0f0f",
//           fontFamily: "system-ui",
//           color: "#fff",
//         }}
//       >
//         {/* Header */}
//         <div
//           style={{
//             borderBottom: "1px solid #1e1e1e",
//             padding: "16px 32px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//           }}
//         >
//           <div>
//             <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}>
//               AirCierge
//             </span>
//             <span style={{ color: "#444", fontSize: 13, marginLeft: 12 }}>
//               iCloud Mail
//             </span>
//           </div>
//           <button
//             onClick={() => { setShowNylasView(false); setNylasEmails([]); }}
//             style={{
//               background: "transparent",
//               color: "#666",
//               border: "1px solid #2a2a2a",
//               borderRadius: 6,
//               padding: "6px 14px",
//               fontSize: 12,
//               cursor: "pointer",
//             }}
//           >
//             Disconnect
//           </button>
//         </div>

//         <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
//           {/* Stats bar */}
//           <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
//             <div
//               style={{
//                 background: "#1a1a1a",
//                 border: "1px solid #2a2a2a",
//                 borderRadius: 10,
//                 padding: "16px 24px",
//                 flex: 1,
//                 minWidth: 180,
//               }}
//             >
//               <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
//                 {nylasLoading ? "—" : nylasEmails.length}
//               </div>
//               <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//                 Unread emails
//               </div>
//             </div>
//             <div
//               style={{
//                 background: "#1a1a1a",
//                 border: "1px solid #2a2a2a",
//                 borderRadius: 10,
//                 padding: "16px 24px",
//                 flex: 2,
//                 minWidth: 240,
//               }}
//             >
//               <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>
//                 iCloud Mail via Nylas
//               </div>
//               <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//                 Connected account
//               </div>
//             </div>
//             <div
//               style={{
//                 background: "#1a1a1a",
//                 border: "1px solid #2a2a2a",
//                 borderRadius: 10,
//                 padding: "16px 24px",
//                 flex: 1,
//                 minWidth: 160,
//               }}
//             >
//               <div
//                 style={{
//                   fontSize: 14,
//                   fontWeight: 600,
//                   color: nylasLoading ? "#f59e0b" : "#22c55e",
//                 }}
//               >
//                 {nylasLoading ? "Fetching..." : "Synced"}
//               </div>
//               <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//                 Status
//               </div>
//             </div>
//           </div>

//           {/* Email list */}
//           {nylasLoading ? (
//             <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
//               <div style={{ fontSize: 14 }}>Fetching iCloud emails...</div>
//             </div>
//           ) : nylasEmails.length === 0 ? (
//             <div style={{ textAlign: "center", padding: "60px 0", color: "#444" }}>
//               <div style={{ fontSize: 14 }}>No unread emails found</div>
//             </div>
//           ) : (
//             <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//               {nylasEmails.map((email) => (
//                 <div
//                   key={email.id}
//                   style={{
//                     background: "#141414",
//                     border: "1px solid #222",
//                     borderRadius: 10,
//                     padding: "20px 24px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "flex-start",
//                       marginBottom: 8,
//                       gap: 12,
//                     }}
//                   >
//                     <div
//                       style={{
//                         fontWeight: 600,
//                         fontSize: 14,
//                         color: "#fff",
//                         lineHeight: 1.4,
//                         flex: 1,
//                       }}
//                     >
//                       {email.subject}
//                     </div>
//                     <div
//                       style={{
//                         fontSize: 11,
//                         color: "#444",
//                         whiteSpace: "nowrap",
//                         flexShrink: 0,
//                       }}
//                     >
//                       {new Date(email.date).toLocaleDateString("en-US", {
//                         month: "short",
//                         day: "numeric",
//                         year: "numeric",
//                       })}
//                     </div>
//                   </div>
//                   <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
//                     {email.from}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 12,
//                       color: "#3a3a3a",
//                       lineHeight: 1.6,
//                       borderTop: "1px solid #1e1e1e",
//                       paddingTop: 10,
//                       whiteSpace: "pre-wrap",
//                       maxHeight: 80,
//                       overflow: "hidden",
//                     }}
//                   >
//                     {email.body?.slice(0, 200)}
//                     {email.body?.length > 200 ? "..." : ""}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     );

//   if (!session)
//     return (
//       <div
//         style={{
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "#0f0f0f",
//           fontFamily: "system-ui",
//           padding: "24px",
//         }}
//       >
//         <div style={{ width: "100%", maxWidth: 360 }}>
//           <div style={{ textAlign: "center", marginBottom: 32 }}>
//             <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
//               AirCierge
//             </h1>
//             <p style={{ color: "#666", fontSize: 14 }}>
//               Connect your email to get started
//             </p>
//           </div>

//           <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//             <button
//               onClick={() => signIn("google")}
//               style={providerBtn("#fff", "#0f0f0f", "#e5e5e5")}
//             >
//               <GoogleIcon />
//               Continue with Google
//             </button>

//             <button
//               onClick={handleAppleSignIn}
//               style={providerBtn("#1c1c1e", "#fff", "#333")}
//             >
//               <AppleIcon />
//               Continue with Apple
//             </button>

//             <button
//               onClick={() => signIn("azure-ad")}
//               style={providerBtn("#1a1a1a", "#fff", "#2a2a2a")}
//             >
//               <MicrosoftIcon />
//               Continue with Outlook
//             </button>

//             <button
//               onClick={() => signIn("yahoo")}
//               style={providerBtn("#1a1a1a", "#fff", "#2a2a2a")}
//             >
//               <YahooIcon />
//               Continue with Yahoo
//             </button>
//           </div>

//           <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
//             <div style={{ flex: 1, height: 1, background: "#222" }} />
//             <span style={{ color: "#444", fontSize: 12 }}>or use your email</span>
//             <div style={{ flex: 1, height: 1, background: "#222" }} />
//           </div>

//           <form onSubmit={handleEmailContinue}>
//             <input
//               type="email"
//               placeholder="you@example.com"
//               value={emailInput}
//               onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
//               style={{
//                 width: "100%",
//                 background: "#1a1a1a",
//                 border: "1px solid #2a2a2a",
//                 borderRadius: 8,
//                 padding: "12px 14px",
//                 fontSize: 14,
//                 color: "#fff",
//                 outline: "none",
//                 boxSizing: "border-box",
//               }}
//             />
//             {emailError && (
//               <p style={{ color: "#f87171", fontSize: 12, marginTop: 6 }}>{emailError}</p>
//             )}
//             <button
//               type="submit"
//               style={{
//                 ...providerBtn("#fff", "#0f0f0f", "#e5e5e5"),
//                 marginTop: 10,
//                 justifyContent: "center",
//               }}
//             >
//               Continue
//             </button>
//           </form>
//         </div>
//       </div>
//     );

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#0f0f0f",
//         fontFamily: "system-ui",
//         color: "#fff",
//       }}
//     >
//       {/* Header */}
//       <div
//         style={{
//           borderBottom: "1px solid #1e1e1e",
//           padding: "16px 32px",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <div>
//           <span
//             style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px" }}
//           >
//             AirCierge
//           </span>
//           <span style={{ color: "#444", fontSize: 13, marginLeft: 12 }}>
//             Gmail Sync
//           </span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
//           <span style={{ fontSize: 13, color: "#666" }}>
//             {session.user?.email}
//           </span>
//           <button
//             onClick={() => signOut()}
//             style={{
//               background: "transparent",
//               color: "#666",
//               border: "1px solid #2a2a2a",
//               borderRadius: 6,
//               padding: "6px 14px",
//               fontSize: 12,
//               cursor: "pointer",
//             }}
//           >
//             Sign out
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>
//         {/* Stats bar */}
//         <div
//           style={{
//             display: "flex",
//             gap: 12,
//             marginBottom: 32,
//             flexWrap: "wrap",
//           }}
//         >
//           <div
//             style={{
//               background: "#1a1a1a",
//               border: "1px solid #2a2a2a",
//               borderRadius: 10,
//               padding: "16px 24px",
//               flex: 1,
//               minWidth: 180,
//             }}
//           >
//             <div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>
//               {loading ? "—" : emails.length}
//             </div>
//             <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//               Emails found
//             </div>
//           </div>
//           <div
//             style={{
//               background: "#1a1a1a",
//               border: "1px solid #2a2a2a",
//               borderRadius: 10,
//               padding: "16px 24px",
//               flex: 2,
//               minWidth: 240,
//             }}
//           >
//             <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc" }}>
//               {dateRange()}
//             </div>
//             <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//               Date range (last 90 days)
//             </div>
//           </div>
//           <div
//             style={{
//               background: "#1a1a1a",
//               border: "1px solid #2a2a2a",
//               borderRadius: 10,
//               padding: "16px 24px",
//               flex: 1,
//               minWidth: 160,
//             }}
//           >
//             <div
//               style={{
//                 fontSize: 14,
//                 fontWeight: 600,
//                 color: loading ? "#f59e0b" : "#22c55e",
//               }}
//             >
//               {loading
//                 ? "Fetching..."
//                 : fetchedAt
//                 ? `Synced ${fetchedAt}`
//                 : "—"}
//             </div>
//             <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
//               Status
//             </div>
//           </div>
//         </div>

//         {/* Email list */}
//         {loading ? (
//           <div
//             style={{ textAlign: "center", padding: "60px 0", color: "#444" }}
//           >
//             <div style={{ fontSize: 14 }}>Fetching AirCierge emails...</div>
//           </div>
//         ) : emails.length === 0 ? (
//           <div
//             style={{ textAlign: "center", padding: "60px 0", color: "#444" }}
//           >
//             <div style={{ fontSize: 14 }}>
//               No AirCierge emails found in the last 90 days
//             </div>
//           </div>
//         ) : (
//           <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
//             {emails.map((email) => (
//               <div
//                 key={email.id}
//                 style={{
//                   background: "#141414",
//                   border: "1px solid #222",
//                   borderRadius: 10,
//                   padding: "20px 24px",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     marginBottom: 8,
//                     gap: 12,
//                   }}
//                 >
//                   <div
//                     style={{
//                       fontWeight: 600,
//                       fontSize: 14,
//                       color: "#fff",
//                       lineHeight: 1.4,
//                       flex: 1,
//                     }}
//                   >
//                     {email.subject || "(no subject)"}
//                   </div>
//                   <div
//                     style={{
//                       fontSize: 11,
//                       color: "#444",
//                       whiteSpace: "nowrap",
//                       flexShrink: 0,
//                     }}
//                   >
//                     {new Date(email.date).toLocaleDateString("en-US", {
//                       month: "short",
//                       day: "numeric",
//                       year: "numeric",
//                     })}
//                   </div>
//                 </div>
//                 <div style={{ fontSize: 12, color: "#555", marginBottom: 10 }}>
//                   {email.from}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: 12,
//                     color: "#3a3a3a",
//                     lineHeight: 1.6,
//                     borderTop: "1px solid #1e1e1e",
//                     paddingTop: 10,
//                     whiteSpace: "pre-wrap",
//                     maxHeight: 80,
//                     overflow: "hidden",
//                   }}
//                 >
//                   {email.body?.slice(0, 200)}
//                   {email.body?.length > 200 ? "..." : ""}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
