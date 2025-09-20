import AnswerButton from "../../AnswerButton"
import { useSocketContext } from "@/context/socket"
import { useEffect, useRef, useState, createElement } from "react"
import clsx from "clsx"
import {
  ANSWERS_COLORS,
  ANSWERS_ICONS,
  SFX_ANSWERS_MUSIC,
  SFX_ANSWERS_SOUND,
  SFX_RESULTS_SOUND,
} from "@/constants"
import useSound from "use-sound"
import { usePlayerContext } from "@/context/player"

const calculatePercentages = (objectResponses) => {
  const keys = Object.keys(objectResponses)
  const values = Object.values(objectResponses)

  if (!values.length) {
    return []
  }

  const totalSum = values.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  )

  let result = {}

  keys.map((key) => {
    result[key] = ((objectResponses[key] / totalSum) * 100).toFixed() + "%"
  })

  return result
}

export default function Answers({
  data: { question, answers, image, time, responses, correct },
}) {
  const { socket, emit, on, off } = useSocketContext()
  const { player } = usePlayerContext()

  const [percentages, setPercentages] = useState([])
  const [cooldown, setCooldown] = useState(time)
  const [totalAnswer, setTotalAnswer] = useState(0)

  const [sfxPop] = useSound(SFX_ANSWERS_SOUND, {
    volume: 0.1,
  })

  const [sfxResults] = useSound(SFX_RESULTS_SOUND, {
    volume: 0.2,
  })

  const [playMusic, { stop: stopMusic, isPlaying }] = useSound(
    SFX_ANSWERS_MUSIC,
    {
      volume: 0.2,
    },
  )

  const handleAnswer = (answer) => {
    if (!player) {
      return
    }

    emit("player:selectedAnswer", answer)
    sfxPop()
  }

  useEffect(() => {
    if (!responses) {
      playMusic()
      return
    }

    stopMusic()
    sfxResults()

    setPercentages(calculatePercentages(responses))
  }, [responses, playMusic, stopMusic])

  useEffect(() => {
    if (!isPlaying) {
      playMusic()
    }
  }, [isPlaying])

  useEffect(() => {
    return () => {
      stopMusic()
    }
  }, [playMusic, stopMusic])

  useEffect(() => {
    on("game:cooldown", (sec) => {
      setCooldown(sec)
    })

    on("game:playerAnswer", (count) => {
      setTotalAnswer(count)
      sfxPop()
    })

    return () => {
      off("game:cooldown")
      off("game:playerAnswer")
    }
  }, [sfxPop, on, off])

  return (
    <>
      <style jsx>{`
        .answer-blue {
          background: linear-gradient(135deg, #1e293b 0%, #0ea5e9 25%, #06b6d4 75%, #1e293b 100%);
          border: 3px solid #0ea5e9;
          box-shadow:
            0 0 25px rgba(14, 165, 233, 0.6),
            inset 0 0 25px rgba(6, 182, 212, 0.2),
            0 0 50px rgba(14, 165, 233, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-blue::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-blue:hover::before {
          left: 100%;
        }
        .answer-blue:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(14, 165, 233, 0.8),
            inset 0 0 40px rgba(6, 182, 212, 0.3),
            0 0 80px rgba(14, 165, 233, 0.5);
          border-color: #0ea5e9;
        }

        .answer-orange {
          background: linear-gradient(135deg, #431407 0%, #f97316 25%, #fb923c 75%, #431407 100%);
          border: 3px solid #f97316;
          box-shadow:
            0 0 25px rgba(249, 115, 22, 0.6),
            inset 0 0 25px rgba(251, 146, 60, 0.2),
            0 0 50px rgba(249, 115, 22, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-orange::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-orange:hover::before {
          left: 100%;
        }

        .answer-orange:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(249, 115, 22, 0.8),
            inset 0 0 40px rgba(251, 146, 60, 0.3),
            0 0 80px rgba(249, 115, 22, 0.5);
          border-color: #f97316;
        }

        .answer-yellow {
          background: linear-gradient(135deg, #451a03 0%, #eab308 25%, #facc15 75%, #451a03 100%);
          border: 3px solid #eab308;
          box-shadow:
            0 0 25px rgba(234, 179, 8, 0.6),
            inset 0 0 25px rgba(250, 204, 21, 0.2),
            0 0 50px rgba(234, 179, 8, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-yellow::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(234, 179, 8, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-yellow:hover::before {
          left: 100%;
        }

        .answer-yellow:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(234, 179, 8, 0.8),
            inset 0 0 40px rgba(250, 204, 21, 0.3),
            0 0 80px rgba(234, 179, 8, 0.5);
          border-color: #eab308;
        }

        .answer-green {
          background: linear-gradient(135deg, #14532d 0%, #22c55e 25%, #4ade80 75%, #14532d 100%);
          border: 3px solid #22c55e;
          box-shadow:
            0 0 25px rgba(34, 197, 94, 0.6),
            inset 0 0 25px rgba(74, 222, 128, 0.2),
            0 0 50px rgba(34, 197, 94, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-green::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(34, 197, 94, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-green:hover::before {
          left: 100%;
        }

        .answer-green:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(34, 197, 94, 0.8),
            inset 0 0 40px rgba(74, 222, 128, 0.3),
            0 0 80px rgba(34, 197, 94, 0.5);
          border-color: #22c55e;
        }

        .answer-purple {
          background: linear-gradient(135deg, #581c87 0%, #a855f7 25%, #c084fc 75%, #581c87 100%);
          border: 3px solid #a855f7;
          box-shadow:
            0 0 25px rgba(168, 85, 247, 0.6),
            inset 0 0 25px rgba(192, 132, 252, 0.2),
            0 0 50px rgba(168, 85, 247, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-purple::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-purple:hover::before {
          left: 100%;
        }

        .answer-purple:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(168, 85, 247, 0.8),
            inset 0 0 40px rgba(192, 132, 252, 0.3),
            0 0 80px rgba(168, 85, 247, 0.5);
          border-color: #a855f7;
        }

        .answer-pink {
          background: linear-gradient(135deg, #831843 0%, #ec4899 25%, #f472b6 75%, #831843 100%);
          border: 3px solid #ec4899;
          box-shadow:
            0 0 25px rgba(236, 72, 153, 0.6),
            inset 0 0 25px rgba(244, 114, 182, 0.2),
            0 0 50px rgba(236, 72, 153, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-pink::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-pink:hover::before {
          left: 100%;
        }

        .answer-pink:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(236, 72, 153, 0.8),
            inset 0 0 40px rgba(244, 114, 182, 0.3),
            0 0 80px rgba(236, 72, 153, 0.5);
          border-color: #ec4899;
        }

        .answer-cyan {
          background: linear-gradient(135deg, #164e63 0%, #06b6d4 25%, #67e8f9 75%, #164e63 100%);
          border: 3px solid #06b6d4;
          box-shadow:
            0 0 25px rgba(6, 182, 212, 0.6),
            inset 0 0 25px rgba(103, 232, 249, 0.2),
            0 0 50px rgba(6, 182, 212, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-cyan::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-cyan:hover::before {
          left: 100%;
        }

        .answer-cyan:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(6, 182, 212, 0.8),
            inset 0 0 40px rgba(103, 232, 249, 0.3),
            0 0 80px rgba(6, 182, 212, 0.5);
          border-color: #06b6d4;
        }

        .answer-lime {
          background: linear-gradient(135deg, #365314 0%, #65a30d 25%, #a3e635 75%, #365314 100%);
          border: 3px solid #65a30d;
          box-shadow:
            0 0 25px rgba(101, 163, 13, 0.6),
            inset 0 0 25px rgba(163, 230, 53, 0.2),
            0 0 50px rgba(101, 163, 13, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
          position: relative;
          overflow: hidden;
        }

        .answer-lime::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(101, 163, 13, 0.4), transparent);
          transition: left 0.5s ease;
        }

        .answer-lime:hover::before {
          left: 100%;
        }

        .answer-lime:hover {
          transform: scale(1.02);
          box-shadow:
            0 0 40px rgba(101, 163, 13, 0.8),
            inset 0 0 40px rgba(163, 230, 53, 0.3),
            0 0 80px rgba(101, 163, 13, 0.5);
          border-color: #65a30d;
        }
      `}</style>

      <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        {!!image && !responses && (
          <img src={image} className="h-48 max-h-60 w-auto rounded-md" />
        )}

        {responses && (
          <div className="w-full max-w-4xl mx-auto mt-8 px-4">
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl border-2 border-cyan-400/30 p-6 shadow-[0_0_40px_rgba(34,211,238,0.3)]">
              <h3 className="text-center text-2xl font-bold text-cyan-100 mb-6 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                📊 RISULTATI LIVE
              </h3>
              <div className={`grid w-full gap-6 grid-cols-${answers.length} h-48`}>
                {answers.map((_, key) => (
                  <div key={key} className="relative group">
                    {/* Effetto glow per la barra */}
                    <div className="absolute -inset-1 bg-gradient-to-t from-blue-600 via-purple-600 to-cyan-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-500"></div>

                    <div className="relative flex flex-col justify-end h-full">
                      <div
                        className={clsx(
                          "relative overflow-hidden rounded-xl border-2 border-white/40 transition-all duration-700 ease-out transform hover:scale-105",
                          ANSWERS_COLORS[key],
                        )}
                        style={{
                          height: percentages[key],
                          minHeight: responses[key] > 0 ? '3rem' : '0.5rem'
                        }}
                      >
                        {/* Effetto scintillio animato */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>

                        {/* Particelle di energia */}
                        <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-60"></div>
                        <div className="absolute bottom-2 right-2 w-1 h-1 bg-white rounded-full animate-pulse opacity-80"></div>

                        {/* Numero risposte */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm border-t border-white/20">
                          <span className="block w-full text-center text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] py-2">
                            {responses[key] || 0}
                          </span>
                        </div>

                        {/* Indicatore percentuale */}
                        <div className="absolute top-2 right-2 bg-black/80 rounded-lg px-2 py-1 border border-white/30">
                          <span className="text-xs font-bold text-white">{percentages[key]}</span>
                        </div>
                      </div>

                      {/* Icona della risposta */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black/80 backdrop-blur-sm rounded-full p-2 border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                          {ANSWERS_ICONS[key] && createElement(ANSWERS_ICONS[key], {
                            className: "h-6 w-6 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        {!responses && (
          <div className="mx-auto mb-6 flex w-full max-w-7xl justify-between gap-4 px-4 text-lg font-bold text-white md:text-xl">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative flex flex-col items-center bg-black/80 backdrop-blur-sm border-2 border-cyan-400/50 rounded-2xl px-6 py-3 shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-cyan-300 font-semibold">TIME</span>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                <span className="text-3xl font-bold text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">{cooldown}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse"></div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-lime-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative flex flex-col items-center bg-black/80 backdrop-blur-sm border-2 border-green-400/50 rounded-2xl px-6 py-3 shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-300 font-semibold">ANSWERS</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                <span className="text-3xl font-bold text-green-100 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">{totalAnswer}</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        <div className={`mx-auto mb-4 grid w-full max-w-7xl gap-4 px-4 text-lg font-bold text-white md:text-xl ${
          answers.length <= 2 ? 'grid-cols-2' :
          answers.length <= 4 ? 'grid-cols-2' :
          answers.length <= 6 ? 'grid-cols-3' :
          'grid-cols-4'
        }`}>
          {answers.map((answer, key) => {
            // Supporta sia il formato stringa che oggetto
            const answerText = typeof answer === 'string' ? answer : (answer.text || '');
            const answerImage = typeof answer === 'object' ? answer.image : '';

            return (
              <div key={key} className="relative group">
                {/* Effetto glow che si espande al hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>

                <AnswerButton
                  className={clsx(ANSWERS_COLORS[key], {
                    "opacity-50 grayscale": responses && correct !== key,
                    "animate-pulse ring-4 ring-green-400 ring-opacity-75": responses && correct === key,
                  })}
                  icon={ANSWERS_ICONS[key]}
                  answerImage={answerImage}
                  onClick={() => handleAnswer(key)}
                >
                  {answerText}
                </AnswerButton>

                {/* Indicatore di risposta corretta */}
                {responses && correct === key && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 animate-bounce shadow-[0_0_20px_rgba(34,197,94,0.8)]">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </>
  )
}
