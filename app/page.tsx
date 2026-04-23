"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [emails, setEmails] = useState<any[]>([]);

  const accessToken = session?.accessToken;

  useEffect(() => {
    async function loadEmails() {
      if (!accessToken) return;

      const query = encodeURIComponent(
        "from:aircierge.n8n@gmail.com newer_than:90d"
      );

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();

      const fullEmails = await Promise.all(
        (data.messages || []).map(async (msg: any) => {
          const r = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          return r.json();
        })
      );

      const cleaned = fullEmails.map((email: any) => {
        const headers = email.payload?.headers || [];

        const get = (name: string) =>
          headers.find((h: any) => h.name === name)?.value || "";

        const part =
          email.payload?.parts?.find((p: any) => p.mimeType === "text/plain") ||
          email.payload?.body;

        const body = part?.body?.data
          ? atob(part.body.data.replace(/-/g, "+").replace(/_/g, "/"))
          : "";

        return {
          id: email.id,
          threadId: email.threadId,
          from: get("From"),
          to: get("To"),
          subject: get("Subject"),
          date: get("Date"),
          body,
        };
      });

      setEmails(cleaned);

      // ✅ SEND TO WEBHOOK (ONLY ONCE AFTER LOAD)
      await fetch(
        "https://airciergen8n.app.n8n.cloud/webhook/8330befc-bdbf-487b-b107-dabaff32f299",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: session?.user,
            emails: cleaned,
          }),
        }
      );
    }

    loadEmails();
  }, [accessToken]);

  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return <button onClick={() => signIn("google")}>Login</button>;
  }

  return (
    <div>
      <button onClick={() => signOut()}>Logout</button>

      <h2>User</h2>
      <p>{session.user?.name}</p>
      <p>{session.user?.email}</p>

      <b>Access Token:</b>
      <pre style={{ wordBreak: "break-all" }}>{session?.accessToken}</pre>

      <h2>Emails</h2>

      {emails.map((email: any) => (
        <div key={email.id} style={{ marginBottom: 20 }}>
          <h4>{email.subject}</h4>
          <p>
            <b>From:</b> {email.from}
          </p>
          <p>
            <b>Date:</b> {email.date}
          </p>
          <pre style={{ whiteSpace: "pre-wrap" }}>{email.body}</pre>
          <hr />
        </div>
      ))}
    </div>
  );
}
