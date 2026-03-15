export default function Loader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem',
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--color-border)',
        borderTop: '3px solid var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
