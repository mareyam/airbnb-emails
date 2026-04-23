export default function StatCard({ title, value, subtitle }: any) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "16px",
        borderRadius: "10px",
        width: "200px",
      }}
    >
      <p style={{ fontSize: "12px", color: "#666" }}>{title}</p>
      <h2>{value}</h2>
      <p style={{ fontSize: "12px", color: "#999" }}>{subtitle}</p>
    </div>
  );
}
