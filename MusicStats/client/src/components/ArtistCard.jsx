export default function ArtistCard({ name, image, listeners, genre }) {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '1rem',
      padding: '1.25rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      animation: 'fadeInUp 0.5s ease-out both',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(29,185,84,0.3), rgba(30,215,96,0.1))',
        margin: '0 auto 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        color: 'var(--color-accent)',
        overflow: 'hidden',
      }}>
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          name?.charAt(0)?.toUpperCase()
        )}
      </div>
      <h4 style={{ fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
        {name || 'Artist Name'}
      </h4>
      {genre && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-accent)', marginBottom: '0.25rem' }}>
          {genre}
        </p>
      )}
      {listeners && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          {listeners} listeners
        </p>
      )}
    </div>
  );
}
