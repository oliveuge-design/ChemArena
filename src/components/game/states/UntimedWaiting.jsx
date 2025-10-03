import { useState, useEffect } from "react"

export default function UntimedWaiting({ data }) {
  const [animatedText, setAnimatedText] = useState("")
  const message = data?.message || "Modalità senza tempo attiva"

  useEffect(() => {
    let currentIndex = 0
    const interval = setInterval(() => {
      setAnimatedText(message.slice(0, currentIndex))
      currentIndex++
      if (currentIndex > message.length) {
        currentIndex = 0
      }
    }, 100)

    return () => clearInterval(interval)
  }, [message])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      {/* Icona principale */}
      <div className="relative mb-8">
        <div className="text-8xl animate-pulse">🎯</div>
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-ping"></div>
      </div>

      {/* Titolo principale */}
      <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
        MODALITÀ SENZA TEMPO
      </h1>

      {/* Messaggio animato */}
      <div className="text-xl md:text-2xl text-center mb-8 max-w-2xl">
        <span className="font-mono">{animatedText}</span>
        <span className="animate-pulse">|</span>
      </div>

      {/* Informazioni sul controllo */}
      <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 max-w-lg text-center border border-purple-500/30">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">📋 Controlli Manager</h3>
        <div className="space-y-2 text-sm">
          <p>✅ Nessun timer automatico</p>
          <p>🎮 Controllo manuale delle domande</p>
          <p>⚡ Bonus velocità per risposte rapide</p>
          <p>🚀 Usa il pulsante "Prossima Domanda" per continuare</p>
        </div>
      </div>

      {/* Informazioni domanda corrente */}
      {data && (
        <div className="mt-8 text-center">
          <div className="text-lg font-semibold mb-2">
            Domanda {(data.questionIndex || 0) + 1} di {data.totalQuestions || 0}
          </div>
          <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((data.questionIndex || 0) + 1) / (data.totalQuestions || 1) * 100}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Effetti visivi */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full animate-ping opacity-30"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-40" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-20" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-25" style={{animationDelay: '0.5s'}}></div>
      </div>
    </div>
  )
}