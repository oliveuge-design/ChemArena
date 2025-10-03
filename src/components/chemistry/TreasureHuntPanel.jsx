// Componente placeholder per TreasureHuntPanel
// Questo componente mostra informazioni treasure hunt delle molecole

export default function TreasureHuntPanel({ compound }) {
  if (!compound?.treasureHunt) {
    return null
  }

  const { alchemySymbol, discoveries, secrets } = compound.treasureHunt

  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      border: '2px solid #00ffff',
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '300px',
      color: '#00ffff',
      fontSize: '12px',
      boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
      zIndex: 100
    }}>
      {alchemySymbol && (
        <div style={{
          fontSize: '32px',
          textAlign: 'center',
          marginBottom: '12px',
          textShadow: '0 0 10px #00ffff'
        }}>
          {alchemySymbol}
        </div>
      )}

      {discoveries && discoveries.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '4px',
            color: '#00ff88'
          }}>
            🔬 Scoperte:
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '11px',
            color: '#ffffff'
          }}>
            {discoveries.map((discovery, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{discovery}</li>
            ))}
          </ul>
        </div>
      )}

      {secrets && secrets.length > 0 && (
        <div>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '4px',
            color: '#ff0088'
          }}>
            🔮 Segreti:
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '11px',
            color: '#ffffff'
          }}>
            {secrets.map((secret, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{secret}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
