export default function QuickJoinPanel({
  gamePin,
  playerName,
  isQRAccess,
  onGamePinChange,
  onPlayerNameChange,
  onJoin
}) {
  return (
    <div className="mt-8 max-w-md mx-auto quick-join-panel">
      <div className="tron-panel p-6">
        <h3 className="text-cyan-400 text-xl font-bold mb-4 text-center">
          {isQRAccess ? '📱 ACCESSO RAPIDO' : 'ENTRA NEL QUIZ'}
        </h3>
        {isQRAccess && (
          <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-3 mb-4">
            <p className="text-cyan-300 text-sm text-center">
              ✅ PIN riconosciuto: <span className="font-bold text-cyan-400">{gamePin}</span>
            </p>
          </div>
        )}
        <div className="space-y-3">
          {!isQRAccess && (
            <input
              type="text"
              placeholder="PIN..."
              value={gamePin}
              onChange={(e) => onGamePinChange(e.target.value.toUpperCase())}
              className="tron-input w-full text-lg md:text-base"
              maxLength={6}
              autoComplete="off"
              inputMode="numeric"
            />
          )}
          <input
            type="text"
            placeholder="Il tuo nome..."
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            className="tron-input w-full text-lg md:text-base"
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && onJoin()}
            autoFocus={isQRAccess}
            autoComplete="off"
            autoCapitalize="words"
          />
          <button
            onClick={onJoin}
            disabled={!gamePin.trim() || !playerName.trim()}
            className="tron-join-btn w-full"
          >
            {isQRAccess ? '🚀 ENTRA VELOCEMENTE' : 'ENTRA'}
          </button>
        </div>
      </div>
    </div>
  )
}
