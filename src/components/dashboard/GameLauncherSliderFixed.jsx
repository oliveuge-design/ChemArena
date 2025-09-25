import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import { QuizArchive } from "../../utils/quizArchive"
import toast from "react-hot-toast"

export default function GameLauncherSliderFixed() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [filteredQuizzes, setFilteredQuizzes] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
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

  // Helper per valori sicuri - versione migliorata anti-errori React
  const safeLength = (arr) => {
    try {
      return String((Array.isArray(arr) ? arr.length : 0))
    } catch {
      return "0"
    }
  }

  const safeValue = (value, fallback = 0) => {
    try {
      if (value === null || value === undefined) return String(fallback)
      return String(value)
    } catch {
      return String(fallback)
    }
  }

  const safeQuizCount = (category) => {
    try {
      if (!Array.isArray(quizzes) || !category) return "0"
      const count = quizzes.filter(q =>
        q && typeof q === 'object' && (q.subject || 'Generale') === category
      ).length
      return String(count)
    } catch {
      return "0"
    }
  }

  const safeMath = (calculation) => {
    try {
      const result = calculation()
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return "0"
      }
      return String(Math.round(result))
    } catch {
      return "0"
    }
  }

  const safeAverage = (questions, property, defaultValue = 15) => {
    try {
      if (!Array.isArray(questions) || questions.length === 0) {
        return String(defaultValue)
      }

      const total = questions.reduce((sum, q) => {
        if (!q || typeof q !== 'object') return sum
        const value = q[property]
        return sum + (typeof value === 'number' && !isNaN(value) ? value : defaultValue)
      }, 0)

      const average = total / questions.length
      return String(Math.round(average))
    } catch {
      return String(defaultValue)
    }
  }

  useEffect(() => {
    loadQuizzesFromArchive()
  }, [])

  const loadQuizzesFromArchive = async () => {
    try {
      const data = await QuizArchive.getAllQuizzes()
      const quizList = data.quizzes || []
      setQuizzes(quizList)

      const categorySet = new Set(quizList.map(quiz => quiz.subject || 'Generale'))
      setCategories(Array.from(categorySet).sort())
    } catch (error) {
      console.error('Errore caricamento quiz:', error)
      toast.error('Errore nel caricamento dei quiz')
    }
  }

  const handleCategorySelect = (category) => {
    try {
      setSelectedCategory(category)
      const filtered = quizzes.filter(quiz => (quiz.subject || 'Generale') === category)
      setFilteredQuizzes(filtered)
      setSelectedQuiz(null)
      setCurrentSlide(1)
    } catch (error) {
      console.error('Errore selezione categoria:', error)
      toast.error('Errore durante la selezione della categoria')
    }
  }

  const handleQuizSelect = async (quiz) => {
    try {
      setSelectedQuiz(quiz)

      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz: quiz,
          settings: gameSettings
        })
      })

      if (response.ok) {
        toast.success(`Quiz "${quiz.title || 'Senza titolo'}" configurato!`)
        setCurrentSlide(2)
      } else {
        toast.error('Errore configurazione quiz')
      }
    } catch (error) {
      console.error('Errore selezione quiz:', error)
      toast.error('Errore durante la configurazione')
    }
  }

  const handleModeChange = (newMode) => {
    try {
      setGameSettings(prev => ({ ...prev, gameMode: newMode }))

      if (selectedQuiz) {
        updateConfig(selectedQuiz, { ...gameSettings, gameMode: newMode })
      }
    } catch (error) {
      console.error('Errore cambio modalità:', error)
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
      await updateConfig(selectedQuiz, gameSettings)
      router.push('/manager')
    } catch (error) {
      toast.error('Errore durante il lancio')
      setIsLaunching(false)
    }
  }

  const goBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const getModeConfig = (mode) => {
    const configs = {
      standard: { name: "Standard", desc: "Modalità classica con timer normale", icon: "📝" },
      chase: { name: "Inseguimento", desc: "Timer ridotto del 40%", icon: "🏃" },
      appearing: { name: "Risposte a Comparsa", desc: "Le opzioni appaiono gradualmente", icon: "✨" },
      timed: { name: "Quiz a Tempo", desc: "Tempo limitato per domanda", icon: "⏱️" },
      untimed: { name: "Senza Tempo", desc: "Bonus velocità senza limite", icon: "🎯" },
      survival: { name: "Sopravvivenza", desc: "Eliminazione per errori", icon: "💀" }
    }
    return configs[mode] || configs.standard
  }

  const getCategoryIcon = (category) => {
    const icons = {
      'Scienze': '🧪',
      'Medicina': '🏥',
      'Geografia': '🌍',
      'Chimica': '⚗️',
      'Storia': '📜',
      'Arte': '🎨',
      'Informatica': '💻',
      'Sport': '⚽',
      'Cultura': '📖'
    }
    return icons[category] || '📚'
  }

  const renderQuizCards = () => {
    try {
      if (!Array.isArray(filteredQuizzes) || filteredQuizzes.length === 0) {
        return (
          <div className="text-center py-16" key="no-quizzes">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-gray-700 mb-2">Nessun quiz trovato</h4>
            <p className="text-gray-500">Non ci sono quiz disponibili per la categoria "{String(selectedCategory || '')}"</p>
          </div>
        )
      }

      const validQuizzes = filteredQuizzes.filter(quiz =>
        quiz && typeof quiz === 'object' && quiz.id && typeof quiz.id === 'string'
      )

      return validQuizzes.map((quiz, index) => {
        const quizKey = `quiz-${quiz.id}-${index}`

        return (
          <button
            key={quizKey}
            onClick={() => handleQuizSelect(quiz)}
            className="w-full p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] text-left group border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {String(quiz.title || 'Quiz senza titolo')}
                </h4>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="mr-1">📝</span>
                    {safeLength(quiz.questions)} domande
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">⏱️</span>
                    Tempo medio: {safeAverage(quiz.questions, 'time', 15)}s
                  </span>
                  <span className="flex items-center">
                    <span className="mr-1">🎯</span>
                    {safeMath(() => (Array.isArray(quiz.questions) ? quiz.questions.length : 0) * 1000)} punti max
                  </span>
                  {quiz.password && (
                    <span className="flex items-center">
                      <span className="mr-1">🔑</span>
                      Password: {String(quiz.password)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Creato il {String(quiz.created || 'Data sconosciuta')}</p>
              </div>
              <div className="ml-4 text-2xl group-hover:scale-110 transition-transform duration-300">
                🚀
              </div>
            </div>
          </button>
        )
      })
    } catch (error) {
      console.error('Errore rendering quiz cards:', error)
      return (
        <div className="text-center py-16" key="error-fallback">
          <div className="text-6xl mb-4">⚠️</div>
          <h4 className="text-xl font-semibold text-red-600 mb-2">Errore di caricamento</h4>
          <p className="text-gray-500">Si è verificato un errore nel caricamento dei quiz</p>
        </div>
      )
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header fisso */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🚀 Lancia Nuovo Quiz</h2>
            <p className="text-gray-600 text-sm">
              {currentSlide === 0 && "Scegli una categoria"}
              {currentSlide === 1 && `Quiz disponibili: ${selectedCategory}`}
              {currentSlide === 2 && `Configurazione: ${selectedQuiz?.title || 'Quiz'}`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {[0, 1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step <= currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
              title="Torna alla Dashboard"
            >
              ✕ Chiudi
            </button>
          </div>
        </div>

        {currentSlide > 0 && (
          <button
            onClick={goBack}
            className="mt-3 inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
          >
            ← Indietro
          </button>
        )}
      </div>

      {/* Container slide */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Slide 1: Selezione Categoria */}
          <div className="w-full flex-shrink-0 p-6">
            <div className="h-full flex flex-col">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Seleziona Categoria</h3>
                <p className="text-gray-600">Scegli la materia del quiz che vuoi lanciare</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-gray-600">Caricamento categorie...</p>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 py-6">
                      {Array.isArray(categories) && categories
                        .filter(category => category && typeof category === 'string')
                        .map((category, index) => {
                          const categoryKey = `category-${category}-${index}`
                          return (
                            <button
                              key={categoryKey}
                              onClick={() => handleCategorySelect(category)}
                              className="group p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-200"
                            >
                              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                                {getCategoryIcon(category)}
                              </div>
                              <div className="font-semibold text-gray-900 text-lg mb-1">{String(category)}</div>
                              <div className="text-sm text-gray-500">
                                {safeQuizCount(category)} quiz
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Slide 2: Selezione Quiz */}
          <div className="w-full flex-shrink-0 p-6">
            <div className="h-full flex flex-col">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">{getCategoryIcon(selectedCategory || '')}</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{String(selectedCategory || 'Categoria')}</h3>
                <p className="text-gray-600">Seleziona il quiz da lanciare</p>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
                  {renderQuizCards()}
                </div>
              </div>
            </div>
          </div>

          {/* Slide 3: Configurazione */}
          <div className="w-full flex-shrink-0 p-6">
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Configurazione Quiz</h3>
                <p className="text-gray-600">{selectedQuiz?.title || 'Quiz'}</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8">
                {selectedQuiz && (
                  <>
                    {/* Info Quiz */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <h4 className="font-bold text-lg text-gray-900 mb-4">📊 Informazioni Quiz</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{safeLength(selectedQuiz.questions)}</div>
                          <div className="text-sm text-gray-600">Domande</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {safeMath(() => {
                              if (!Array.isArray(selectedQuiz.questions)) return 0
                              const total = selectedQuiz.questions.reduce((sum, q) => {
                                if (!q || typeof q !== 'object') return sum
                                return sum + (q.time || 15) + (q.cooldown || 5)
                              }, 0)
                              return total / 60
                            })} min
                          </div>
                          <div className="text-sm text-gray-600">Durata</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{safeMath(() => (Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : 0) * 1000)}</div>
                          <div className="text-sm text-gray-600">Punti Max</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">{selectedQuiz.password || 'Nessuna'}</div>
                          <div className="text-sm text-gray-600">Password</div>
                        </div>
                      </div>
                    </div>

                    {/* Modalità Quiz */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <h4 className="font-bold text-lg text-gray-900 mb-4">🎮 Modalità di Gioco</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {['standard', 'chase', 'appearing', 'timed', 'untimed', 'survival'].map((mode) => {
                          const config = getModeConfig(mode)
                          return (
                            <button
                              key={mode}
                              onClick={() => handleModeChange(mode)}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                gameSettings.gameMode === mode
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="text-2xl mb-2">{config.icon}</div>
                              <div className="font-semibold">{config.name}</div>
                              <div className="text-sm text-gray-600">{config.desc}</div>
                            </button>
                          )
                        })}
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="font-semibold text-blue-900">
                          {getModeConfig(gameSettings.gameMode).icon} Modalità attiva: {getModeConfig(gameSettings.gameMode).name}
                        </div>
                        <div className="text-sm text-blue-700 mt-1">{getModeConfig(gameSettings.gameMode).desc}</div>
                      </div>
                    </div>

                    {/* Opzioni Avanzate */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                      <h4 className="font-bold text-lg text-gray-900 mb-4">⚡ Opzioni Avanzate</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { key: 'shuffleQuestions', label: 'Mescola domande', icon: '🔀' },
                          { key: 'shuffleAnswers', label: 'Mescola risposte', icon: '🎲' },
                          { key: 'bonusForSpeed', label: 'Bonus velocità', icon: '⚡' },
                          { key: 'autoAdvance', label: 'Avanzamento auto', icon: '⏭️' },
                          { key: 'allowLateJoin', label: 'Accesso tardivo', icon: '🚪' },
                          { key: 'showLeaderboardBetweenQuestions', label: 'Classifica intermedia', icon: '🏆' }
                        ].map((option) => (
                          <label key={option.key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gameSettings[option.key]}
                              onChange={(e) => setGameSettings(prev => ({ ...prev, [option.key]: e.target.checked }))}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xl">{option.icon}</span>
                            <span className="text-sm font-medium text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Big Launch Button */}
              {selectedQuiz && (
                <div className="text-center pt-6 border-t">
                  <Button
                    onClick={launchGame}
                    disabled={isLaunching}
                    className="px-16 py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl rounded-2xl"
                  >
                    {isLaunching ? "🔄 Avvio in corso..." : "🚀 LANCIA QUIZ"}
                  </Button>
                  <p className="text-sm text-gray-500 mt-3">
                    Ti porterà alla pagina manager per generare il PIN studenti
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}