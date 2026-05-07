"use client";
import { useState, useEffect } from "react";

const ATTENTION_COLORS = [
  "#2563eb",
  "#f59e0b",
  "#6366f1",
  "#10b981",
  "#ef4444",
  "#f97316",
  "#8b5cf6",
  "#ec4899",
];
const INITIALS_BG: Record<string, string> = {
  LR: "#dbeafe",
  SB: "#fef3c7",
  SA: "#f3f4f6",
  CH: "#d1fae5",
  MB: "#ede9fe",
  JB: "#fee2e2",
  JF: "#d1fae5",
  NM: "#fef9c3",
};

const INSIGHT_STYLES: Record<string, { tagColor: string; tagText: string }> = {
  "Early Arrival": { tagColor: "#fef9c3", tagText: "#854d0e" },
  "Long Stay": { tagColor: "#dcfce7", tagText: "#166534" },
  "Solo Travel": { tagColor: "#dbeafe", tagText: "#1e40af" },
  "Risk / Attention": { tagColor: "#fee2e2", tagText: "#991b1b" },
  "Couple / Romance": { tagColor: "#fce7f3", tagText: "#9d174d" },
  "Family / Group": { tagColor: "#ede9fe", tagText: "#5b21b6" },
};

interface DashboardData {
  revenue: string;
  bookedNights: number;
  totalRevenue: string;
  adr: string;
  totalNights: number;
  totalDays: number;
  occupancyRatio: number;
  todaysGuests: {
    initials: string;
    name: string;
    status: string;
    property: string;
    amount: string;
  }[];
  needAttention: {
    guest: string;
    property: string;
    issue: string;
    action: string;
  }[];
  AIInsights: {
    category: string;
    guest: string;
    insight: string;
    action: string;
  }[];
  cleaning: { property: string; status: string; note: string }[];
}

const tabs = ["Today", "Calendar", "Upsell", "Guest Intelligence", "Pricing"];

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 0",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "3px solid #e5e7eb",
          borderTopColor: "#2d8f7b",
          animation: "spin 0.7s linear infinite",
        }}
      />
      <span style={{ fontSize: 13, color: "#9ca3af" }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

interface CalBooking {
  from: string;
  to: string;
  guest: string;
  amount: string;
}
interface CalListing {
  name: string;
  bookings: CalBooking[];
}

function buildListings(
  raw: {
    guest_name: string;
    property_name: string;
    stay_start: string;
    stay_end: string;
    amount_paid: string;
  }[]
): CalListing[] {
  const map = new Map<string, CalBooking[]>();
  for (const row of raw) {
    const prop = row.property_name;
    if (!prop || prop === "NA") continue;
    if (!map.has(prop)) map.set(prop, []);
    if (
      row.stay_start !== "NA" &&
      row.stay_end !== "NA" &&
      row.stay_start &&
      row.stay_end
    ) {
      map.get(prop)!.push({
        from: row.stay_start,
        to: row.stay_end,
        guest: row.guest_name === "NA" ? "" : row.guest_name,
        amount: row.amount_paid === "NA" ? "" : row.amount_paid,
      });
    }
  }
  return Array.from(map.entries()).map(([name, bookings]) => ({
    name,
    bookings,
  }));
}

function CalendarView() {
  const [view, setView] = useState<"7d" | "14d" | "30d">("14d");
  const [offset, setOffset] = useState(0);
  const [listings, setListings] = useState<CalListing[]>([]);
  const [loading, setLoading] = useState(true);
  const LISTING_W = 190;
  const COL_W = 64;

  useEffect(() => {
    fetch(
      "https://airciergen8n.app.n8n.cloud/webhook/31a4efc0-9adf-4d1a-baf9-13085f9516e1",
      { method: "POST" }
    )
      .then((r) => r.json())
      .then((json) => {
        const raw = Array.isArray(json)
          ? json[0]?.data ?? json
          : json?.data ?? json;
        setListings(buildListings(raw));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const numDays = view === "7d" ? 7 : view === "14d" ? 14 : 30;
  const today = startOfDay(new Date());
  const windowStart = addDays(today, offset);

  const days = Array.from({ length: numDays }, (_, i) =>
    addDays(windowStart, i)
  );

  const monthLabel = (() => {
    const months = [
      ...new Set(days.map((d) => `${MONTHS[d.getMonth()]} ${d.getFullYear()}`)),
    ];
    return months.join(" – ");
  })();

  function isSameDay(a: Date, b: Date) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Cal header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Calendar</span>
          <span style={{ color: "#6b7280", fontSize: 14 }}>{monthLabel}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setOffset((o) => o - 1)}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ‹
          </button>
          <button
            onClick={() => setOffset(0)}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 6,
              padding: "4px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Today
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            style={{
              border: "1px solid #e5e7eb",
              background: "#fff",
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ›
          </button>
          {(["7d", "14d", "30d"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                setOffset(0);
              }}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 13,
                cursor: "pointer",
                background: view === v ? "#111" : "#fff",
                color: view === v ? "#fff" : "#111",
                fontWeight: view === v ? 600 : 400,
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : (
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: LISTING_W + COL_W * numDays }}>
            {/* Day headers */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
              <div
                style={{
                  width: LISTING_W,
                  flexShrink: 0,
                  padding: "8px 12px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#6b7280",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.06em",
                }}
              >
                LISTING
              </div>
              {days.map((d, i) => {
                const isToday = isSameDay(d, today);
                return (
                  <div
                    key={i}
                    style={{
                      width: COL_W,
                      flexShrink: 0,
                      textAlign: "center" as const,
                      padding: "8px 0",
                      borderLeft: "1px solid #e5e7eb",
                      background: isToday ? "#fff7ed" : "#fff",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: "#6b7280",
                        fontWeight: 600,
                      }}
                    >
                      {DAY_LABELS[d.getDay()]}
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: isToday ? 700 : 400 }}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Listing rows */}
            {listings.map((listing: CalListing, li: number) => (
              <div
                key={li}
                style={{
                  display: "flex",
                  borderBottom: "1px solid #f3f4f6",
                  position: "relative",
                  minHeight: 52,
                }}
              >
                <div
                  style={{
                    width: LISTING_W,
                    flexShrink: 0,
                    padding: "10px 12px",
                    fontSize: 12,
                    color: "#374151",
                    borderRight: "1px solid #f3f4f6",
                    lineHeight: 1.4,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ color: "#9ca3af", fontSize: 11 }}>⌂</span>
                  <span style={{ whiteSpace: "pre-line" as const }}>
                    {listing.name}
                  </span>
                </div>
                <div style={{ flex: 1, position: "relative", display: "flex" }}>
                  {/* Column backgrounds */}
                  {days.map((d, ci) => (
                    <div
                      key={ci}
                      style={{
                        width: COL_W,
                        flexShrink: 0,
                        borderLeft: "1px solid #f3f4f6",
                        background: isSameDay(d, today)
                          ? "#fff7ed"
                          : "transparent",
                        minHeight: 52,
                      }}
                    />
                  ))}
                  {/* Booking bars */}
                  {listing.bookings.map((b: CalBooking, bi: number) => {
                    const bookFrom = startOfDay(new Date(b.from));
                    const bookTo = startOfDay(new Date(b.to));
                    const winEnd = addDays(windowStart, numDays - 1);

                    // clip to visible window
                    const visFrom =
                      bookFrom < windowStart ? windowStart : bookFrom;
                    const visTo = bookTo > winEnd ? winEnd : bookTo;

                    if (visFrom > winEnd || visTo < windowStart) return null;

                    const startCol = Math.round(
                      (visFrom.getTime() - windowStart.getTime()) / 86400000
                    );
                    const spanDays =
                      Math.round(
                        (visTo.getTime() - visFrom.getTime()) / 86400000
                      ) + 1;
                    const left = startCol * COL_W;
                    const width = spanDays * COL_W - 4;

                    return (
                      <div
                        key={bi}
                        style={{
                          position: "absolute",
                          top: "50%",
                          transform: "translateY(-50%)",
                          left: left + 2,
                          width,
                          height: 28,
                          background: "#2d8f7b",
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          padding: "0 10px",
                          gap: 6,
                          cursor: "pointer",
                          zIndex: 1,
                          overflow: "hidden",
                        }}
                      >
                        <span
                          style={{
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            whiteSpace: "nowrap" as const,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "60%",
                          }}
                        >
                          {b.guest}
                        </span>
                        {b.amount && (
                          <span
                            style={{
                              color: "#a7f3d0",
                              fontSize: 11,
                              whiteSpace: "nowrap" as const,
                            }}
                          >
                            {b.amount}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          height: 12,
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
        }}
      />
    </div>
  );
}

interface UpsellGuest {
  name: string;
  property: string;
  nights: number;
  payout: number;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  daysToCheckin: number;
  upsellType: string | null;
}

const BG_COLORS = [
  "#d1fae5",
  "#dbeafe",
  "#fef3c7",
  "#ede9fe",
  "#fee2e2",
  "#fef9c3",
  "#e0f2fe",
  "#fce7f3",
];

function formatRp(n: number) {
  if (!n) return null;
  return `Rp${n.toLocaleString("id-ID")}`;
}

function buildMessage(g: UpsellGuest): string {
  const first = g.name.split(" ")[0];
  const price = formatRp(g.pricePerNight);
  if (g.upsellType === "extend_stay") {
    return price
      ? `Hi ${first}! Hope you're enjoying ${g.property}. Would you like to extend your stay by 1 night for ${price}? Just reply YES.`
      : `Hi ${first}! Hope you're loving your stay. We'd love to have you for an extra night — just reply YES if you're interested!`;
  }
  if (g.upsellType === "early_checkin") {
    return price
      ? `Hi ${first}! Your room at ${g.property} is ready early. You can check in now for ${price}. Reply YES to confirm!`
      : `Hi ${first}! Great news — early check-in is available at ${g.property}. Reply YES if you'd like to arrive early!`;
  }
  return `Hi ${first}! Enjoy your stay at ${g.property}. Let us know if there's anything we can do to make it perfect!`;
}

function UpsellView() {
  // const [guests, setGuests] = useState<UpsellGuest[]>([]);
  // const [selected, setSelected] = useState(0);
  // const [copied, setCopied] = useState(false);

  // useEffect(() => {
  //   fetch("https://airciergen8n.app.n8n.cloud/webhook/5068482f-cd63-4aaf-8724-0d3245e492b5", { method: "POST" })
  //     .then(r => r.json())
  //     .then(json => {
  //       const raw: UpsellGuest[] = Array.isArray(json) ? (json[0]?.result ?? json) : (json?.result ?? json);
  //       // deduplicate by guest+property, keep entries with upsellType preferentially
  //       const seen = new Map<string, UpsellGuest>();
  //       for (const g of raw) {
  //         const key = `${g.guest}__${g.property}`;
  //         if (!seen.has(key) || (!seen.get(key)!.upsellType && g.upsellType)) seen.set(key, g);
  //       }
  //       setGuests(Array.from(seen.values()).map(g => ({ ...g, name: g.guest ?? g.name })) as UpsellGuest[]);
  //     })
  //     .catch(() => {});
  // }, []);

  // if (!guests.length) return <Spinner />;

  const [guests, setGuests] = useState<any[]>([]);
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(
      "https://airciergen8n.app.n8n.cloud/webhook/5068482f-cd63-4aaf-8724-0d3245e492b5",
      { method: "POST" }
    )
      .then((r) => r.json())
      .then((json) => {
        const raw: any[] = Array.isArray(json)
          ? ((json[0]?.result ?? json) as UpsellGuest[])
          : ((json?.result ?? json) as UpsellGuest[]);

        const seen = new Map<string, UpsellGuest>();

        for (const g of raw) {
          const key = `${g.guest ?? ""}__${g.property ?? ""}`;

          const existing = seen.get(key);

          if (!existing || (!existing.upsellType && g.upsellType)) {
            seen.set(key, g);
          }
        }

        const cleaned = Array.from(seen.values()).map((g: any) => ({
          ...g,
          name: g.guest ?? g.name ?? "",
        }));

        setGuests(cleaned);
      })
      .catch(() => {
        setGuests([]);
      });
  }, []);

  if (!guests.length) return <Spinner />;

  const guest = guests[selected];
  // const initials = guest.name.split(" ").slice(0, 2).map(w:any => w[0]:any).join("").toUpperCase();
  const initials = guest.name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const bg = BG_COLORS[selected % BG_COLORS.length];
  const hasExtension = guest.upsellType === "extend_stay";
  const hasEarlyCheckin = guest.upsellType === "early_checkin";
  const offerAmount = formatRp(guest.pricePerNight);
  const offerLabel = hasExtension
    ? `Extend by 1 night · ${guest.nights}-night stay`
    : hasEarlyCheckin
    ? `Early check-in · ${guest.nights}-night stay`
    : null;
  const messageText = buildMessage(guest);

  function copyMessage() {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* Guest pills */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          overflowX: "auto",
        }}
      >
        <div style={{ display: "flex", gap: 8, width: "max-content" }}>
          {guests.map((g, i) => (
            <button
              key={i}
              onClick={() => {
                setSelected(i);
                setCopied(false);
              }}
              style={{
                border: `1.5px solid ${selected === i ? "#111" : "#e5e7eb"}`,
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: selected === i ? 600 : 400,
                background: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap" as const,
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: 20,
          display: "flex",
          flexDirection: "column" as const,
          gap: 16,
        }}
      >
        {/* Offer cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 12,
          }}
        >
          {/* Late Checkout — not in API, always N/A */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>🕐</span> Late Checkout
            </div>
            <div
              style={{
                width: 20,
                height: 2,
                background: "#e5e7eb",
                marginBottom: 8,
              }}
            />
            <div style={{ fontSize: 13, color: "#9ca3af" }}>Not available</div>
          </div>

          {/* Early Check-in */}
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#6b7280",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>✦</span> Early Check-in
            </div>
            <div
              style={{
                width: 20,
                height: 2,
                background: "#e5e7eb",
                marginBottom: 8,
              }}
            />
            {hasEarlyCheckin && offerAmount ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 700 }}>
                  +{offerAmount}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {guest.nights}-night stay
                </div>
              </>
            ) : (
              <div style={{ fontSize: 13, color: "#9ca3af" }}>
                Not available
              </div>
            )}
          </div>

          {/* Stay Extension */}
          <div
            style={{
              border: `1.5px solid ${hasExtension ? "#111" : "#e5e7eb"}`,
              borderRadius: 10,
              padding: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6b7280",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>↗</span> Stay Extension
              </div>
              {hasExtension && offerAmount ? (
                <>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    +{offerAmount}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                    {offerLabel}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#9ca3af" }}>
                  Not available
                </div>
              )}
            </div>
            <span style={{ fontSize: 16, color: "#6b7280" }}>›</span>
          </div>
        </div>

        {/* AI message */}
        <div
          style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  AI-generated message · {guest.name}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {guest.property}
                </div>
              </div>
            </div>
            {offerLabel && (
              <span
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "3px 8px",
                  whiteSpace: "nowrap" as const,
                }}
              >
                {offerLabel}
              </span>
            )}
          </div>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              margin: "0 0 16px",
              color: "#374151",
            }}
          >
            {messageText}
          </p>
          <button
            onClick={copyMessage}
            style={{
              width: "100%",
              border: "1.5px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 0",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>📋</span> {copied ? "Copied!" : "Copy message"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface GuestConfidence {
  initials: string;
  name: string;
  propertyLine: string;
  score: number;
  confidence: string;
  payout: string;
}

function scoreDot(score: number) {
  const color = score >= 80 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <span style={{ color, fontWeight: 700, fontSize: 13 }}>● {score}</span>
  );
}

function GuestIntelligenceView() {
  const [guests, setGuests] = useState<GuestConfidence[]>([]);

  useEffect(() => {
    fetch(
      "https://airciergen8n.app.n8n.cloud/webhook/6c5ad055-0485-4855-962f-f956e0359936",
      { method: "POST" }
    )
      .then((r) => r.json())
      .then((json) => setGuests(Array.isArray(json) ? json : json?.data ?? []))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Feature pills */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 0,
          marginBottom: 24,
        }}
      >
        {[
          {
            icon: "🧩",
            title: "Tone Analysis",
            desc: "AI parses guest messages to flag urgency, friction or VIP cues — before you reply.",
          },
          {
            icon: "🕐",
            title: "Booking History",
            desc: "Full record of past stays, repeat behavior, cancellations and lifetime value per guest.",
          },
          {
            icon: "🛡",
            title: "Risk Scoring",
            desc: "Combine reputation, behavior and communication signals into a 0–100 confidence score.",
          },
        ].map((f, i) => (
          <div key={i} style={{ padding: "0 24px 20px 0" }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              {f.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Guest confidence card */}
      <div
        style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 15 }}>
            Guest confidence
          </span>
          <div style={{ display: "flex", gap: 10, fontSize: 12 }}>
            <span
              style={{
                background: "#dcfce7",
                color: "#166534",
                borderRadius: 999,
                padding: "3px 10px",
                fontWeight: 600,
              }}
            >
              ● 80–100 Trusted
            </span>
            <span
              style={{
                background: "#fef3c7",
                color: "#92400e",
                borderRadius: 999,
                padding: "3px 10px",
                fontWeight: 600,
              }}
            >
              ● 50–79 Review
            </span>
            <span
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                borderRadius: 999,
                padding: "3px 10px",
                fontWeight: 600,
              }}
            >
              ● 0–49 Flag
            </span>
          </div>
        </div>
        {!guests.length && <Spinner />}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {guests.map((g, i) => {
            const bg = BG_COLORS[i % BG_COLORS.length];
            return (
              <div
                key={i}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {g.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 13 }}>
                        {g.name}
                      </span>
                      {scoreDot(g.score)}
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                      {g.propertyLine}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{
                      color: "#ef4444",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    Message guest →
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {g.payout}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PricingRow {
  property: string;
  recommendation: string;
  impact: string;
  level: string;
  bookings: number;
  avgNights: number;
  avgPayout: string;
}

function PricingView() {
  const [rows, setRows] = useState<PricingRow[]>([]);

  useEffect(() => {
    fetch(
      "https://airciergen8n.app.n8n.cloud/webhook/1a31c355-b924-4355-b2af-bf48b164f2c4",
      { method: "POST" }
    )
      .then((r) => r.json())
      .then((json) => {
        const data: PricingRow[] = Array.isArray(json)
          ? json[0]?.properties ?? json
          : json?.properties ?? [];
        setRows(data);
      })
      .catch(() => {});
  }, []);

  const impactColor = (impact: string) =>
    impact.startsWith("+")
      ? "#16a34a"
      : impact.startsWith("-")
      ? "#ef4444"
      : "#9ca3af";

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          Pricing intelligence
        </div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>
          Recommendations based on demand, lead time and comp set movement.
        </div>
      </div>
      {!rows.length && <Spinner />}
      {rows.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span style={{ color: "#9ca3af", fontSize: 12 }}>⌂</span>{" "}
              {p.property}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {p.recommendation} — {p.bookings} booking
              {p.bookings !== 1 ? "s" : ""} · avg {p.avgNights} nights · avg
              payout {p.avgPayout}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
              marginLeft: 24,
            }}
          >
            <span
              style={{
                background: "#f3f4f6",
                color:
                  p.level === "High"
                    ? "#16a34a"
                    : p.level === "Med"
                    ? "#f59e0b"
                    : "#6b7280",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 6,
                padding: "2px 10px",
              }}
            >
              {p.level}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: impactColor(p.impact),
                minWidth: 36,
                textAlign: "right" as const,
              }}
            >
              {p.impact}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("Today");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      "https://airciergen8n.app.n8n.cloud/webhook/bd36dfa0-5a8f-4e90-9cf9-511077dcecb3",
      { method: "POST" }
    )
      .then((r) => r.json())
      .then((json) => {
        setData(Array.isArray(json) ? json[0] : json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const s: Record<string, React.CSSProperties> = {
    page: {
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: "#fff",
      minHeight: "100vh",
      color: "#111",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 32px",
      borderBottom: "1px solid #e5e7eb",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      fontSize: 18,
      fontWeight: 700,
    },
    date: { color: "#6b7280", fontSize: 14, marginLeft: 16 },
    headerRight: { display: "flex", alignItems: "center", gap: 12 },
    toggleWrap: {
      background: "#f3f4f6",
      borderRadius: 999,
      padding: "4px 8px",
      display: "flex",
      alignItems: "center",
      gap: 6,
      cursor: "pointer",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#c4b5fd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      color: "#5b21b6",
    },
    content: { padding: "32px 32px 0" },
    greeting: { fontSize: 28, fontWeight: 700, marginBottom: 24 },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: 16,
      marginBottom: 32,
    },
    statCard: {
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: "20px 24px",
    },
    statLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: "#6b7280",
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      marginBottom: 8,
    },
    statValue: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
    statSub: { fontSize: 12, color: "#16a34a" },
    statSubGray: { fontSize: 12, color: "#6b7280" },
    tabRow: {
      display: "flex",
      gap: 0,
      borderBottom: "1px solid #e5e7eb",
      marginBottom: 24,
    },
    tab: {
      padding: "10px 16px",
      fontSize: 14,
      cursor: "pointer",
      border: "none",
      background: "none",
      color: "#6b7280",
      fontWeight: 500,
    },
    tabActive: {
      padding: "10px 16px",
      fontSize: 14,
      cursor: "pointer",
      border: "none",
      background: "none",
      color: "#111",
      fontWeight: 600,
      borderBottom: "2px solid #111",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
      marginBottom: 24,
    },
    card: { border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    cardTitle: { fontSize: 16, fontWeight: 700 },
    cardCount: { fontSize: 13, color: "#6b7280" },
    attentionItem: {
      display: "flex",
      gap: 12,
      paddingBottom: 16,
      marginBottom: 16,
      borderBottom: "1px solid #f3f4f6",
    },
    attentionBar: { width: 3, borderRadius: 2, flexShrink: 0, minHeight: 40 },
    attentionName: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
    attentionDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
    guestItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      paddingBottom: 16,
      marginBottom: 16,
      borderBottom: "1px solid #f3f4f6",
    },
    guestInitials: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0,
    },
    guestName: { fontSize: 14, fontWeight: 600 },
    checkinBadge: {
      display: "inline-block",
      background: "#dcfce7",
      color: "#166534",
      fontSize: 11,
      fontWeight: 600,
      borderRadius: 4,
      padding: "2px 6px",
      marginLeft: 8,
    },
    guestProp: {
      fontSize: 12,
      color: "#6b7280",
      marginTop: 2,
      lineHeight: 1.4,
    },
    guestRevenue: {
      marginLeft: "auto",
      fontSize: 13,
      fontWeight: 600,
      whiteSpace: "nowrap" as const,
    },
    insightCard: {
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 24,
      marginBottom: 24,
    },
    insightItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 16,
    },
    insightTag: {
      fontSize: 12,
      fontWeight: 600,
      borderRadius: 6,
      padding: "3px 8px",
      flexShrink: 0,
    },
    insightText: { fontSize: 13, color: "#374151", lineHeight: 1.5 },
    cleaningCard: {
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 24,
      marginBottom: 24,
    },
    cleaningItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingBottom: 20,
      marginBottom: 20,
      borderBottom: "1px solid #f3f4f6",
    },
    cleaningLeft: {},
    cleaningProp: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: 6,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    cleaningTag: {
      fontSize: 11,
      fontWeight: 500,
      background: "#f3f4f6",
      borderRadius: 4,
      padding: "2px 8px",
      color: "#374151",
    },
    cleaningDesc: { fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
    scheduledBadge: {
      fontSize: 13,
      fontWeight: 600,
      color: "#16a34a",
      whiteSpace: "nowrap" as const,
    },
    footer: {
      textAlign: "center" as const,
      padding: "24px 0",
      color: "#9ca3af",
      fontSize: 13,
    },
    showAll: {
      fontSize: 13,
      color: "#ef4444",
      fontWeight: 500,
      cursor: "pointer",
      background: "none",
      border: "none",
    },
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          AirCierge
          <span style={s.date}>Saturday, March 21</span>
        </div>
        <div style={s.headerRight}>
          <div style={s.toggleWrap}>
            <span style={{ fontSize: 16 }}>☀️</span>
            <div
              style={{
                width: 32,
                height: 18,
                background: "#d1d5db",
                borderRadius: 999,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: "#fff",
                  borderRadius: "50%",
                  position: "absolute",
                  top: 2,
                  left: 2,
                }}
              />
            </div>
          </div>
          <div style={s.avatar}>HA</div>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.greeting}>Good morning. Here's your day.</div>

        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statLabel}>Revenue (MTD)</div>
            <div style={s.statValue}>
              {loading ? "—" : data?.totalRevenue ?? "—"}
            </div>
            <div style={s.statSub}>Total Paid + Host Payout, all rows</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Occupancy</div>
            <div style={s.statValue}>
              {loading
                ? "—"
                : data
                ? `${Math.round(data.occupancyRatio * 100)}%`
                : "—"}
            </div>
            <div style={s.statSubGray}>
              {loading
                ? ""
                : data
                ? `${data.totalNights} of ${data.totalDays} nights booked`
                : ""}
            </div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>ADR</div>
            <div style={s.statValue}>
              {loading ? "—" : data ? `Rp${data.adr}` : "—"}
            </div>
            <div style={s.statSub}>Revenue ÷ booked nights (90d)</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statLabel}>Next 7 Days</div>
            <div style={s.statValue}>
              {loading ? "—" : data?.bookedNights ?? "—"}
            </div>
            <div style={s.statSubGray}>nights booked next 7 days</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {tabs.map((t) => (
            <button
              key={t}
              style={activeTab === t ? s.tabActive : s.tab}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "Guest Intelligence" && (
          <div style={{ marginBottom: 24 }}>
            <GuestIntelligenceView />
          </div>
        )}

        {activeTab === "Pricing" && (
          <div style={{ marginBottom: 24 }}>
            <PricingView />
          </div>
        )}

        {activeTab === "Upsell" && (
          <div style={{ marginBottom: 24 }}>
            <UpsellView />
          </div>
        )}

        {/* Calendar tab content */}
        {activeTab === "Calendar" && (
          <div style={{ marginBottom: 24 }}>
            <CalendarView />
          </div>
        )}

        {/* Two column */}
        {activeTab === "Today" && loading && <Spinner />}
        {activeTab === "Today" && !loading && (
          <div style={s.twoCol}>
            {/* Needs attention */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Needs your attention</span>
                <span style={s.cardCount}>
                  {data?.needAttention.length ?? 0} items
                </span>
              </div>
              {(data?.needAttention ?? []).map((item, i, arr) => (
                <div
                  key={i}
                  style={{
                    ...s.attentionItem,
                    borderBottom:
                      i === arr.length - 1 ? "none" : "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      ...s.attentionBar,
                      background: ATTENTION_COLORS[i % ATTENTION_COLORS.length],
                    }}
                  />
                  <div>
                    <div style={s.attentionName}>
                      {item.guest} — {item.property}
                    </div>
                    <div style={s.attentionDesc}>
                      {item.issue}. Action: {item.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Today's guests */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>Today's guests</span>
                <span style={s.cardCount}>
                  {data?.todaysGuests.length ?? 0} stays
                </span>
              </div>
              {(data?.todaysGuests ?? []).map((g, i, arr) => (
                <div
                  key={i}
                  style={{
                    ...s.guestItem,
                    borderBottom:
                      i === arr.length - 1 ? "none" : "1px solid #f3f4f6",
                  }}
                >
                  <div
                    style={{
                      ...s.guestInitials,
                      background: INITIALS_BG[g.initials] ?? "#f3f4f6",
                    }}
                  >
                    {g.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={s.guestName}>
                      {g.name}
                      <span style={s.checkinBadge}>{g.status}</span>
                    </div>
                    <div style={s.guestProp}>{g.property}</div>
                  </div>
                  <div style={s.guestRevenue}>
                    {g.amount === "NA" ? "—" : g.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {activeTab === "Today" && !loading && (
          <div style={s.insightCard}>
            <div style={{ ...s.cardHeader, marginBottom: 20 }}>
              <span style={s.cardTitle}>AI insights for today</span>
              <button style={s.showAll}>Show all</button>
            </div>
            {(data?.AIInsights ?? []).map((ins, i) => {
              const style = INSIGHT_STYLES[ins.category] ?? {
                tagColor: "#f3f4f6",
                tagText: "#374151",
              };
              return (
                <div key={i} style={s.insightItem}>
                  <span
                    style={{
                      ...s.insightTag,
                      background: style.tagColor,
                      color: style.tagText,
                    }}
                  >
                    {ins.category}
                  </span>
                  <span style={s.insightText}>
                    {ins.guest} — {ins.insight}. Action: {ins.action}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Cleaning */}
        {activeTab === "Today" && !loading && (
          <div style={s.cleaningCard}>
            <div style={{ ...s.cardHeader, marginBottom: 20 }}>
              <span style={s.cardTitle}>Cleaning</span>
            </div>
            {(data?.cleaning ?? []).map((c, i, arr) => (
              <div
                key={i}
                style={{
                  ...s.cleaningItem,
                  borderBottom:
                    i === arr.length - 1 ? "none" : "1px solid #f3f4f6",
                  paddingBottom: i === arr.length - 1 ? 0 : 20,
                  marginBottom: i === arr.length - 1 ? 0 : 20,
                }}
              >
                <div style={s.cleaningLeft}>
                  <div style={s.cleaningProp}>
                    {c.property}
                    <span style={s.cleaningTag}>
                      {c.status.length < 20 ? c.status : "Scheduled"}
                    </span>
                  </div>
                  <div style={s.cleaningDesc}>{c.note}</div>
                </div>
                <div style={s.scheduledBadge}>Scheduled</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={s.footer}>Demo data · AirCierge AI</div>
    </div>
  );
}
