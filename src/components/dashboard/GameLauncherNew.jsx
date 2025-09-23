import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import { QuizArchive } from "../../utils/quizArchive"
import toast from "react-hot-toast"

export default function GameLauncherNew() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [showQuizDropdown, setShowQuizDropdown] = useState(false)
  const [gameSettings, setGameSettings] = useState({
    allowLateJoin: true,
    showLeaderboardBetweenQuestions: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    gameMode: 'standard',
    bonusForSpeed: true,
    backgroundTheme: 'laboratory',
    showHints: false,
    customTime: 10,
    lives: 1,
    pointsMultiplier: 1,
    maxPlayers: 50,
    autoAdvance: true,
    playSound: true
  })
  const [isLaunching, setIsLaunching] = useState(false)

  useEffect(() => {
    loadQuizzesFromArchive()
  }, [])

  const loadQuizzesFromArchive = async () => {
    try {
      const data = await QuizArchive.getAllQuizzes()
      const quizList = data.quizzes || []
      setQuizzes(quizList)

      // Estrai categorie uniche
      const categorySet = new Set(quizList.map(quiz => quiz.subject || 'Generale'))
      setCategories(Array.from(categorySet).sort())
    } catch (error) {
      toast.error('Errore nel caricamento dei quiz')
    }
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    const filtered = quizzes.filter(quiz => (quiz.subject || 'Generale') === category)
    setFilteredQuizzes(filtered)
    setShowQuizDropdown(true)
    setSelectedQuiz(null)
  }

  const handleQuizSelect = async (quiz) => {
    setSelectedQuiz(quiz)
    setShowQuizDropdown(false)

    // Auto-aggiorna configurazione
    try {
      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: quiz,
          settings: gameSettings
        })
      })

      if (response.ok) {
        toast.success(`Quiz "${quiz.title}" configurato!`)
      } else {
        toast.error('Errore configurazione quiz')
      }
    } catch (error) {
      toast.error('Errore durante la configurazione')
    }
  }

  const handleModeChange = (newMode) => {
    setGameSettings(prev => ({ ...prev, gameMode: newMode }))

    // Auto-sync se quiz selezionato
    if (selectedQuiz) {
      updateConfig(selectedQuiz, { ...gameSettings, gameMode: newMode })
    }
  }

  const updateConfig = async (quiz, settings) => {
    try {
      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: quiz,
          settings: settings
        })
      })

      if (response.ok) {
        console.log('✅ Config aggiornato:', settings.gameMode)
      }
    } catch (error) {
      console.error('❌ Errore config:', error)
    }
  }

  const launchGame = async () => {
    if (!selectedQuiz) {
      toast.error('Seleziona prima un quiz!')
      return
    }

    setIsLaunching(true)

    try {
      // Final config update
      await updateConfig(selectedQuiz, gameSettings)

      // Vai direttamente al manager per generare PIN
      router.push('/manager')

    } catch (error) {
      toast.error('Errore durante il lancio')
      setIsLaunching(false)
    }
  }

  const getModeConfig = () => {
    const configs = {
      standard: { name: "Standard", desc: "Modalità classica con timer normale", icon: "📝" },
      chase: { name: "Inseguimento", desc: "Timer ridotto del 40% per maggiore velocità", icon: "🏃" },
      appearing: { name: "Risposte a Comparsa", desc: "Le opzioni appaiono gradualmente", icon: "✨" },
      timed: { name: "Quiz a Tempo", desc: "Tempo limitato per domanda", icon: "⏱️" },
      untimed: { name: "Senza Tempo", desc: "Bonus velocità senza limite di tempo", icon: "🎯" },
      survival: { name: "Sopravvivenza", desc: "Eliminazione per errori", icon: "💀" }
    }
    return configs[gameSettings.gameMode] || configs.standard
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">🚀 Lancia Nuovo Quiz</h2>
        <p className="text-gray-600">Flusso semplificato per avviare un quiz in 3 step</p>
      </div>

      {/* Step 1: Categoria */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          1️⃣ Seleziona Categoria
        </h3>

        {categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600">Caricamento categorie...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCategory === category
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                <div className="text-2xl mb-1">
                  {category === 'Scienze' ? '🧪' :
                   category === 'Medicina' ? '🏥' :
                   category === 'Geografia' ? '🌍' :
                   category === 'Chimica' ? '⚗️' :
                   category === 'Storia' ? '📜' :
                   category === 'Arte' ? '🎨' : '📖'}
                </div>
                <div className="font-medium">{category}</div>
                <div className="text-xs text-gray-500">
                  {quizzes.filter(q => (q.subject || 'Generale') === category).length} quiz
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Quiz Selection */}
      {showQuizDropdown && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            2️⃣ Seleziona Quiz - {selectedCategory}
          </h3>

          <div className="space-y-3">
            {filteredQuizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleQuizSelect(quiz)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedQuiz?.id === quiz.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {quiz.questions.length} domande •
                      Tempo medio: {Math.round(quiz.questions.reduce((sum, q) => sum + (q.time || 15), 0) / quiz.questions.length)}s
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">{quiz.created}</span>
                    {selectedQuiz?.id === quiz.id && (
                      <span className="text-green-600 text-sm mt-1">✅ Selezionato</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Configurazione */}
      {selectedQuiz && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            3️⃣ Configurazione Quiz - {selectedQuiz.title}
          </h3>

          {/* Quiz Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Domande:</span>
                <span className="ml-2 font-semibold">{selectedQuiz.questions.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Durata stimata:</span>
                <span className="ml-2 font-semibold">
                  {Math.round(selectedQuiz.questions.reduce((sum, q) => sum + (q.time || 15) + (q.cooldown || 5), 0) / 60)} min
                </span>
              </div>
              <div>
                <span className="text-gray-500">Punteggio max:</span>
                <span className="ml-2 font-semibold">{selectedQuiz.questions.length * 1000}</span>
              </div>
              <div>
                <span className="text-gray-500">Password studenti:</span>
                <span className="ml-2 font-semibold text-blue-600">{selectedQuiz.password || 'Nessuna'}</span>
              </div>
            </div>
          </div>

          {/* Modalità Quiz */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Modalità di Gioco</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {['standard', 'chase', 'appearing', 'timed', 'untimed', 'survival'].map((mode) => {
                const config = getModeConfig()
                const modeConfig = {
                  standard: { name: "Standard", desc: "Modalità classica", icon: "📝" },
                  chase: { name: "Inseguimento", desc: "Timer ridotto 40%", icon: "🏃" },
                  appearing: { name: "Risposte a Comparsa", desc: "Opzioni graduali", icon: "✨" },
                  timed: { name: "Quiz a Tempo", desc: "Tempo limitato", icon: "⏱️" },
                  untimed: { name: "Senza Tempo", desc: "Bonus velocità", icon: "🎯" },
                  survival: { name: "Sopravvivenza", desc: "Eliminazione errori", icon: "💀" }
                }[mode]

                return (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      gameSettings.gameMode === mode
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">{modeConfig.icon}</div>
                    <div className="font-medium text-sm">{modeConfig.name}</div>
                    <div className="text-xs text-gray-500">{modeConfig.desc}</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <span className="font-medium">Modalità selezionata:</span>
                <span className="ml-2">{getModeConfig().icon} {getModeConfig().name}</span>
                <div className="text-xs text-gray-600 mt-1">{getModeConfig().desc}</div>
              </div>
            </div>
          </div>

          {/* Opzioni Avanzate */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Opzioni Avanzate</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.shuffleQuestions}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, shuffleQuestions: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Mescola domande</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.shuffleAnswers}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, shuffleAnswers: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Mescola risposte</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.bonusForSpeed}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, bonusForSpeed: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Bonus velocità</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.autoAdvance}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Avanzamento automatico</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.allowLateJoin}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, allowLateJoin: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Accesso tardivo</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={gameSettings.showLeaderboardBetweenQuestions}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, showLeaderboardBetweenQuestions: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Classifica intermedia</span>
              </label>
            </div>
          </div>

          {/* Big Launch Button */}
          <div className="text-center">
            <Button
              onClick={launchGame}
              disabled={isLaunching}
              className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {isLaunching ? (
                <>🔄 Avvio in corso...</>
              ) : (
                <>🚀 LANCIA QUIZ</>
              )}
            </Button>

            <p className="text-sm text-gray-500 mt-3">
              Ti porterà alla pagina manager per generare il PIN studenti
            </p>
          </div>
        </div>
      )}
    </div>
  )
}