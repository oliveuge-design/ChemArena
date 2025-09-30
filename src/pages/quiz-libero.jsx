import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/router"
import BackgroundManager from "@/components/BackgroundManager"

export default function QuizLibero() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [playerName, setPlayerName] = useState("")

  // Carica quiz pubblici
  useEffect(() => {
    async function loadPublicQuizzes() {
      try {
        const response = await fetch('/api/public-quiz', {
          method: 'GET'
        })
        const data = await response.json()

        if (data.success) {
          setQuizzes(data.quizzes)
          console.log(`📚 Loaded ${data.quizzes.length} public quizzes`)
        }
      } catch (error) {
        console.error('❌ Error loading quizzes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPublicQuizzes()
  }, [])

  // Modalità allenamento solo
  const handleTraining = async () => {
    if (!selectedQuiz) {
      alert('Seleziona un quiz prima!')
      return
    }

    if (!playerName.trim()) {
      alert('Inserisci il tuo nome!')
      return
    }

    console.log(`🏋️ Starting training mode for ${selectedQuiz.title}`)

    // TODO: Implementare modalità allenamento
    alert('Modalità allenamento in arrivo! 🏋️')
  }

  // Crea room pubblica
  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      alert('Seleziona un quiz prima!')
      return
    }

    console.log(`👥 Creating public room for ${selectedQuiz.title}`)

    // Carica il quiz completo
    try {
      const response = await fetch('/api/public-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: selectedQuiz.id })
      })

      const data = await response.json()

      if (data.success) {
        console.log(`✅ Quiz caricato dall'API:`, data.quiz.title, `(ID: ${data.quiz.id})`)
        console.log(`📚 Domande:`, data.quiz.questions?.length)

        // PULISCI localStorage prima di salvare
        localStorage.removeItem('current-game-quiz')
        localStorage.removeItem('game-settings')

        // Salva nel localStorage per il manager
        localStorage.setItem('current-game-quiz', JSON.stringify(data.quiz))
        localStorage.setItem('game-settings', JSON.stringify({
          gameMode: 'standard',
          backgroundTheme: 'gaming1'
        }))

        console.log(`💾 Quiz salvato in localStorage:`, data.quiz.title)

        // Vai alla pagina manager
        router.push('/manager')
      } else {
        alert('Errore: ' + (data.error || 'Quiz non trovato'))
      }
    } catch (error) {
      console.error('❌ Error loading quiz:', error)
      alert('Errore nel caricamento del quiz')
    }
  }

  if (loading) {
    return (
      <BackgroundManager theme="gaming1">
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="text-4xl font-black text-cyan-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Caricamento quiz...
          </motion.div>
        </div>
      </BackgroundManager>
    )
  }

  return (
    <BackgroundManager theme="gaming1">
      <div className="min-h-screen p-8">
        {/* 🏆 HEADER */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600 mb-4 filter drop-shadow-[0_0_30px_rgba(0,255,255,0.6)]">
            🎮 QUIZ LIBERO 🎮
          </h1>
          <p className="text-xl md:text-2xl text-cyan-300 font-semibold">
            Scegli un quiz e inizia subito!
          </p>
        </motion.div>

        {/* 📛 CAMPO NOME */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-cyan-300 font-bold mb-2 text-lg">
            Il tuo nome:
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Inserisci il tuo nome..."
            className="w-full px-6 py-4 rounded-xl bg-gray-900/60 border-2 border-cyan-400/50 text-white text-xl font-mono focus:border-cyan-400 focus:outline-none backdrop-blur-md"
          />
        </motion.div>

        {/* 📚 LISTA QUIZ */}
        <div className="max-w-6xl mx-auto">
          {quizzes.length === 0 ? (
            <motion.div
              className="text-center text-2xl text-orange-400 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Nessun quiz pubblico disponibile al momento 😢
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  className={`
                    relative p-6 rounded-2xl cursor-pointer transition-all duration-300
                    ${selectedQuiz?.id === quiz.id
                      ? 'bg-gradient-to-br from-cyan-500/30 via-purple-600/40 to-pink-600/30 border-4 border-cyan-400 scale-105'
                      : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-600/50 hover:border-cyan-400/70 hover:scale-102'}
                    backdrop-blur-md shadow-2xl
                  `}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  {/* 🏷️ CATEGORIA BADGE */}
                  <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-black shadow-lg">
                    {quiz.category || quiz.subject}
                  </div>

                  {/* ✅ SELECTED INDICATOR */}
                  {selectedQuiz?.id === quiz.id && (
                    <motion.div
                      className="absolute -top-2 -left-2 text-4xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      ✅
                    </motion.div>
                  )}

                  {/* 📖 TITOLO */}
                  <h3 className="text-xl font-black text-cyan-100 mb-2 pr-8">
                    {quiz.title}
                  </h3>

                  {/* 📊 INFO */}
                  <div className="flex items-center gap-4 text-gray-300 text-sm">
                    <span className="flex items-center gap-1">
                      📝 <strong>{quiz.questionCount}</strong> domande
                    </span>
                    <span className="flex items-center gap-1">
                      ⚡ {quiz.difficulty || 'Media'}
                    </span>
                  </div>

                  {/* 👤 AUTORE */}
                  <div className="mt-3 text-xs text-gray-400">
                    By {quiz.author}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 🎮 AZIONI */}
        {selectedQuiz && (
          <motion.div
            className="max-w-4xl mx-auto mt-12 flex flex-col md:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* 🏋️ ALLENAMENTO */}
            <motion.button
              onClick={handleTraining}
              className="flex-1 px-8 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-2xl font-black shadow-2xl border-2 border-green-300/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🏋️</span>
                <div>
                  <div>ALLENAMENTO SOLO</div>
                  <div className="text-sm font-normal text-green-100">
                    Pratica da solo
                  </div>
                </div>
              </div>
            </motion.button>

            {/* 👥 CREA ROOM */}
            <motion.button
              onClick={handleCreateRoom}
              className="flex-1 px-8 py-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-2xl font-black shadow-2xl border-2 border-cyan-300/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">👥</span>
                <div>
                  <div>CREA ROOM</div>
                  <div className="text-sm font-normal text-cyan-100">
                    Invita amici con PIN
                  </div>
                </div>
              </div>
            </motion.button>
          </motion.div>
        )}

        {/* 🏠 TORNA HOME */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-xl bg-gray-800/60 border-2 border-gray-600 text-gray-300 font-bold hover:border-cyan-400 hover:text-cyan-300 transition-all"
          >
            ← Torna alla Home
          </button>
        </motion.div>
      </div>
    </BackgroundManager>
  )
}