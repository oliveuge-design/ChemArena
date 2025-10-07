import AnimatedLeaderboard from "@/components/AnimatedLeaderboard"

export default function Leaderboard({ data: { leaderboard } }) {
  // Converto formato leaderboard in formato players per AnimatedLeaderboard
  const players = leaderboard.map(({ username, points }) => ({
    name: username,
    username: username,
    score: points
  }))

  return (
    <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center px-4">
      {/* Titolo sci-fi */}
      <div className="relative mb-8 mt-12">
        <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-gold to-orange-400 drop-shadow-lg text-center filter drop-shadow-[0_0_40px_rgba(255,215,0,0.9)] animate-pulse">
          🏆 CLASSIFICA PARZIALE 🏆
        </h2>
      </div>

      {/* AnimatedLeaderboard con DNA e Atomo */}
      <AnimatedLeaderboard players={players} />

      {/* Messaggio motivazionale */}
      {leaderboard.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-2xl text-cyan-300 font-bold animate-pulse">
            💫 Continua così! La partita non è ancora finita! 💫
          </p>
        </div>
      )}
    </section>
  )
}
