import CricleCheck from "@/components/icons/CricleCheck"
import CricleXmark from "@/components/icons/CricleXmark"
import { SFX_RESULTS_SOUND } from "@/constants"
import { usePlayerContext } from "@/context/player"
import { useEffect } from "react"
import useSound from "use-sound"

export default function Result({ data }) {
  const { correct, message, points, myPoints, totalPlayer, rank, aheadOfMe } = data || {};

  // 🔍 DEBUG: Verifica dati ricevuti
  console.log('🎯 Result component received data object:', data);
  console.log('🎯 Result component values:', {
    correct,
    message,
    points,
    myPoints,
    rank,
    aheadOfMe,
    totalPlayer
  })

  const { dispatch } = usePlayerContext()

  const [sfxResults] = useSound(SFX_RESULTS_SOUND, {
    volume: 0.2,
  })

  useEffect(() => {
    dispatch({
      type: "UPDATE",
      payload: { points: myPoints },
    })

    sfxResults()
  }, [sfxResults])

  return (
    <section className="anim-show relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center pb-8">
      {correct ? (
        <CricleCheck className="aspect-square max-h-60 w-full" />
      ) : (
        <CricleXmark className=" aspect-square max-h-60 w-full" />
      )}

      <h2 className="mt-4 text-4xl font-bold text-white drop-shadow-lg text-center">
        {message}
      </h2>

      {/* Punteggio totale prominente */}
      <div className="mt-6 bg-black/70 backdrop-blur-sm rounded-2xl border-2 border-cyan-400/50 p-6 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
        <div className="text-center">
          <p className="text-lg text-cyan-300 font-semibold mb-2">PUNTEGGIO TOTALE</p>
          <p className="text-5xl font-bold text-cyan-100 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
            {myPoints !== undefined ? myPoints : 0}
          </p>
        </div>
      </div>

      {/* Posizione in classifica */}
      <div className="mt-4 bg-black/60 backdrop-blur-sm rounded-xl border border-yellow-400/40 px-6 py-3 shadow-[0_0_20px_rgba(234,179,8,0.4)]">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏆</div>
          <div>
            <p className="text-yellow-200 text-lg font-bold">
              {rank === 1 ? "🥇 1° POSTO!" :
               rank === 2 ? "🥈 2° Posto" :
               rank === 3 ? "🥉 3° Posto" :
               rank !== undefined ? `${rank}° Posto` : "Calcolando..."}
            </p>
            {aheadOfMe && (
              <p className="text-yellow-300/80 text-sm">
                Dietro a {aheadOfMe}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bonus punti per risposta corretta */}
      {correct && (
        <div className="mt-4 bg-green-600/80 backdrop-blur-sm rounded-xl border border-green-400/50 px-6 py-3 shadow-[0_0_20px_rgba(34,197,94,0.6)] animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              +{points} punti
            </span>
          </div>
        </div>
      )}
    </section>
  )
}
