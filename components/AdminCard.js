export default function AdminCard({ title, count }) {
  return (
    <div style={{
      border: "1px solid #ccc",
      borderRadius: 8,
      padding: 20,
      minWidth: 120,
      textAlign: "center",
      background: "#f9f9f9"
    }}>
      <h3>{title}</h3>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>{count}</p>
    </div>
  );
}