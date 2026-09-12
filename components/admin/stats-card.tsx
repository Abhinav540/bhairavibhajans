interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  delta?: string;
  tone?: "red" | "gold" | "green" | "blue" | "neutral";
}

export function StatsCard({ label, value, icon, delta, tone = "neutral" }: StatsCardProps) {
  return (
    <div className={`admin-stat-card tone-${tone}`}>
      <div className="admin-stat-icon">{icon}</div>
      <div className="admin-stat-body">
        <span className="admin-stat-label">{label}</span>
        <strong className="admin-stat-value">{value}</strong>
        {delta && <span className="admin-stat-delta">{delta}</span>}
      </div>
    </div>
  );
}