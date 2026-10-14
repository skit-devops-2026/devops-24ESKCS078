// A small card showing one number, used on the dashboard and analytics pages
export default function StatCard({ label, value, children }) {
  return (
    <div className="card stat-card">
      <p className="muted">{label}</p>
      <h2>{value}</h2>
      {children}
    </div>
  );
}
