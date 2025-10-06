import Loader from "@/components/Loader"
import AnimatedLeaderboard from "@/components/AnimatedLeaderboard"
import {
  SFX_PODIUM_FIRST,
  SFX_PODIUM_SECOND,
  SFX_PODIUM_THREE,
  SFX_SNEAR_ROOL,
} from "@/constants"
import useScreenSize from "@/hook/useScreenSize"
import clsx from "clsx"
import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import useSound from "use-sound"

export default function Podium({ data: { subject, top }, manager = false }) {
  const [apparition, setApparition] = useState(0)

  const { width, height } = useScreenSize()

  const [sfxtThree] = useSound(SFX_PODIUM_THREE, {
    volume: 0.2,
  })

  const [sfxSecond] = useSound(SFX_PODIUM_SECOND, {
    volume: 0.2,
  })

  const [sfxRool, { stop: sfxRoolStop }] = useSound(SFX_SNEAR_ROOL, {
    volume: 0.2,
  })

  const [sfxFirst] = useSound(SFX_PODIUM_FIRST, {
    volume: 0.2,
  })

  useEffect(() => {
    console.log(apparition)
    switch (apparition) {
      case 4:
        sfxRoolStop()
        sfxFirst()
        break
      case 3:
        sfxRool()
        break
      case 2:
        sfxSecond()
        break
      case 1:
        sfxtThree()
        break
    }
  }, [apparition, sfxFirst, sfxSecond, sfxtThree, sfxRool])

  useEffect(() => {
    if (top.length < 3) {
      setApparition(4)
      return
    }

    const interval = setInterval(() => {
      if (apparition > 4) {
        clearInterval(interval)
        return
      }
      setApparition((value) => value + 1)
    }, 2000)

    return () => clearInterval(interval)
  }, [apparition])

  return (
    <>
      {apparition >= 4 && (
        <ReactConfetti
          width={width}
          height={height}
          className="h-full w-full"
        />
      )}

      {apparition >= 3 && top.length >= 3 && (
        <div className="absolute min-h-screen w-full overflow-hidden">
          <div className="spotlight"></div>{" "}
        </div>
      )}
      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-between">
        <h2 className="anim-show text-center text-3xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl mb-8">
          {subject}
        </h2>

        {/* AnimatedLeaderboard con DNA, Atomo, Microscopio */}
        <div className={clsx(
          "w-full flex-1 flex items-center justify-center opacity-0 transition-opacity duration-1000",
          { "opacity-100": apparition >= 4 }
        )}>
          <AnimatedLeaderboard
            players={top.map(player => ({
              ...player,
              score: player.points,
              name: player.username
            }))}
          />
        </div>

        {/* Messaggio per il manager - ridotto e spostato in alto */}
        {manager && apparition >= 4 && (
          <div className="anim-show absolute top-4 right-4 bg-green-600 bg-opacity-90 rounded-lg px-3 py-2 text-center backdrop-blur-sm shadow-lg border border-green-400/30">
            <p className="text-white text-xs font-medium">
              🏆 Quiz completato!
            </p>
          </div>
        )}
      </section>
    </>
  )
}
