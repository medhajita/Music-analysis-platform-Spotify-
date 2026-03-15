export default function ChartCard({ title, children }) {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '1rem',
      padding: '1.5rem',
      animation: 'fadeInUp 0.5s ease-out both',
    }}>
      {title && (
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          marginBottom: '1rem',
        }}>
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
