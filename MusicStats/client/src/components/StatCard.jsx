import './StatCard.css';

export default function StatCard({ icon, label, value, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-glow" />
      <div className="stat-card-content">
        <div className="stat-card-header">
          <span className="stat-card-icon">{icon}</span>
          {trend && (
            <span className={`stat-card-trend ${trend > 0 ? 'up' : 'down'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="stat-card-value">{value}</p>
        <p className="stat-card-label">{label}</p>
      </div>
    </div>
  );
}
