import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import ConfigUpdater from "./ConfigUpdater"
import BackgroundSelector from "./BackgroundSelector"
import { QuizArchive } from "../../utils/quizArchive"
import toast from "react-hot-toast"

export default function GameLauncher() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [gameSettings, setGameSettings] = useState({
    allowLateJoin: true,
    showLeaderboardBetweenQuestions: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    gameMode: 'standard', // standard, chase, appearing, timed, untimed, survival
    bonusForSpeed: true,
    backgroundTheme: 'laboratory',
    // Nuove funzionalità avanzate
    showHints: false,
    customTime: 10,
    lives: 1,
    pointsMultiplier: 1,
    maxPlayers: 50,
    autoAdvance: false,
    playSound: true
  })
  const [currentGameQuiz, setCurrentGameQuiz] = useState(null)
  const [configStatus, setConfigStatus] = useState('unknown') // 'unknown', 'updated', 'needs-update'

  useEffect(() => {
    loadQuizzesFromArchive()
    
    // Carica il quiz attualmente impostato per il gioco
    const currentQuiz = JSON.parse(localStorage.getItem('current-game-quiz') || 'null')
    setCurrentGameQuiz(currentQuiz)
    if (currentQuiz) {
      setSelectedQuiz(currentQuiz)
      setGameSettings(prev => ({ ...prev, password: currentQuiz.password }))
    }
    
    // Controlla lo stato della configurazione
    checkConfigStatus()
  }, [])

  const loadQuizzesFromArchive = async () => {
    try {
      const data = await QuizArchive.getAllQuizzes()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      toast.error('Errore nel caricamento dei quiz dall\'archivio')
    }
  }

  const checkConfigStatus = () => {
    try {
      const lastUpdate = localStorage.getItem('last-config-update')
      const lastGameSettings = localStorage.getItem('game-settings')
      const currentGameQuizStored = localStorage.getItem('current-game-quiz')

      if (!lastUpdate || !currentGameQuizStored) {
        setConfigStatus('unknown')
        return
      }

      if (selectedQuiz && gameSettings) {
        const needsUpdate = (
          JSON.stringify(selectedQuiz) !== currentGameQuizStored ||
          JSON.stringify(gameSettings) !== lastGameSettings
        )

        setConfigStatus(needsUpdate ? 'needs-update' : 'updated')
      }
    } catch (error) {
      console.warn('Error in checkConfigStatus:', error)
      setConfigStatus('unknown')
    }
  }

  // Helper per aggiornare modalità con auto-sync del config
  const handleModeChange = async (newMode) => {
    setGameSettings(prev => ({ ...prev, gameMode: newMode }))
    console.log('🎮 Modalità cambiata a:', newMode)

    if (selectedQuiz) {
      try {
        console.log('🔧 Auto-aggiornamento config per modalità:', newMode)
        const newSettings = { ...gameSettings, gameMode: newMode }

        const response = await fetch('/api/update-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quiz: selectedQuiz,
            settings: { ...newSettings, password: selectedQuiz.password }
          })
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('game-settings', JSON.stringify(newSettings))
          setConfigStatus('updated')
          toast.success(`⚙️ Modalità aggiornata: ${newMode}!`)
          console.log('✅ Config modalità aggiornato per:', newMode)
        } else {
          toast.error('Errore aggiornamento modalità')
        }
      } catch (error) {
        console.error('❌ Errore aggiornamento modalità:', error)
        toast.error('Errore durante l\'aggiornamento')
      }
    }
  }

  const handleQuizSelection = async (quiz) => {
    console.log('📝 Quiz selezionato:', quiz.title, '- Modalità corrente:', gameSettings.gameMode)
    setSelectedQuiz(quiz)

    // Salva come quiz attivo
    localStorage.setItem('current-game-quiz', JSON.stringify(quiz))
    setCurrentGameQuiz(quiz)

    // AGGIORNA IMMEDIATAMENTE il config con le modalità correnti
    try {
      console.log('🔧 Aggiornamento automatico configurazione...')
      console.log('📊 Modalità da applicare:', gameSettings.gameMode)

      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz: quiz,
          settings: {
            ...gameSettings,
            password: quiz.password
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('game-settings', JSON.stringify(gameSettings))
        localStorage.setItem('last-config-update', new Date().toISOString())
        setConfigStatus('updated')

        toast.success(`✅ Quiz "${quiz.title}" configurato con modalità ${gameSettings.gameMode}!`)
        console.log('✅ Config automatico applicato per quiz:', quiz.title)
      } else {
        toast.error('Errore configurazione: ' + data.message)
        console.error('❌ Errore API:', data)
      }
    } catch (error) {
      console.error('❌ Errore aggiornamento automatico:', error)
      toast.error('Errore durante la configurazione automatica')
    }

    // Aggiorna lo stato della configurazione
    setTimeout(checkConfigStatus, 100)
  }

  const updateGameConfig = async () => {
    if (!selectedQuiz) {
      toast.error('Seleziona prima un quiz!')
      return
    }

    try {
      console.log('🔧 Aggiornamento configurazione completa in corso...')
      console.log('📊 Modalità:', gameSettings.gameMode)
      console.log('⚙️ Settings:', gameSettings)

      // Usa la API update-config che include gameMode e gameSettings
      const response = await fetch('/api/update-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quiz: selectedQuiz,
          settings: {
            ...gameSettings,
            password: selectedQuiz.password // Usa la password del quiz
          }
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Salva nel localStorage per riferimento
        localStorage.setItem('current-game-quiz', JSON.stringify(selectedQuiz))
        localStorage.setItem('game-settings', JSON.stringify(gameSettings))
        localStorage.setItem('last-config-update', new Date().toISOString())

        // Aggiorna lo stato
        setConfigStatus('updated')

        toast.success(`✅ Quiz "${data.quiz.subject}" configurato con modalità ${gameSettings.gameMode}!`)
        console.log('✅ Config aggiornato per:', selectedQuiz.title)
      } else {
        toast.error('Errore: ' + data.message)
        console.error('❌ Errore API:', data)
      }

    } catch (error) {
      console.error('❌ Errore durante l\'aggiornamento:', error)
      toast.error('Errore durante l\'aggiornamento della configurazione')
    }
  }

  const launchGame = async () => {
    if (!selectedQuiz) {
      alert('Seleziona prima un quiz!')
      return
    }

    // Controlla se è necessario aggiornare la configurazione
    const lastUpdate = localStorage.getItem('last-config-update')
    const lastGameSettings = localStorage.getItem('game-settings')
    const currentGameQuiz = localStorage.getItem('current-game-quiz')
    
    const needsUpdate = (
      !lastUpdate ||
      !currentGameQuiz ||
      JSON.stringify(selectedQuiz) !== currentGameQuiz ||
      JSON.stringify(gameSettings) !== lastGameSettings
    )

    // FORZA sempre l'aggiornamento del config per assicurare modalità corretta
    console.log('🚀 Forzando aggiornamento config per modalità:', gameSettings.gameMode)
    await updateGameConfig()

    // Salva il quiz attivo
    localStorage.setItem('current-game-quiz', JSON.stringify(selectedQuiz))
    localStorage.setItem('game-settings', JSON.stringify(gameSettings))

    // Vai alla pagina manager
    const confirmManager = confirm(
      `🚀 Pronto per lanciare il gioco!\n\n🎮 Modalità: ${gameSettings.gameMode}\n📝 Quiz: ${selectedQuiz.title}\n\nVuoi andare alla:\n` +
      `👨‍🏫 Pagina MANAGER (per gestire il gioco) - OK\n` +
      `👥 Pagina STUDENTI (per testare come studente) - Annulla`
    )
    
    if (confirmManager) {
      alert(`📋 Istruzioni per l'insegnante:\n\n1. ${selectedQuiz.password ? `Inserisci la password: ${selectedQuiz.password}` : 'Accedi al manager'}\n2. Ottieni il PIN numerico\n3. Condividi il PIN con gli studenti\n4. Gestisci il gioco dalla dashboard`)
      router.push('/manager')
    } else {
      alert(`📋 Modalità studente:\n\nInserisci il PIN numerico che ti darà l'insegnante per partecipare al quiz.`)
      router.push('/')
    }
  }

  const previewQuiz = (quiz) => {
    const totalTime = quiz.questions.reduce((sum, q) => sum + (q.time || 15) + (q.cooldown || 5), 0)
    const minutes = Math.floor(totalTime / 60)
    const seconds = totalTime % 60
    
    return {
      duration: `${minutes}m ${seconds}s`,
      questionsCount: quiz.questions.length,
      averageTime: Math.round(quiz.questions.reduce((sum, q) => sum + (q.time || 15), 0) / quiz.questions.length),
      hasImages: quiz.questions.some(q => q.image)
    }
  }

  const getDifficulty = (quiz) => {
    const avgTime = quiz.questions.reduce((sum, q) => sum + (q.time || 15), 0) / quiz.questions.length
    const hasImages = quiz.questions.some(q => q.image || q.answers.some(a => a.image))
    const hasComplexQuestions = quiz.questions.some(q => q.question.length > 100)
    
    let difficulty = 0
    
    // Tempo per domanda
    if (avgTime <= 10) difficulty += 2 // Difficile
    else if (avgTime <= 20) difficulty += 1 // Medio
    else difficulty += 0 // Facile
    
    // Presenza di immagini
    if (hasImages) difficulty += 1
    
    // Complessità delle domande
    if (hasComplexQuestions) difficulty += 1
    
    if (difficulty >= 3) return 'Difficile'
    if (difficulty >= 1) return 'Medio'
    return 'Facile'
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lancia un Nuovo Gioco</h2>
          <p className="text-gray-600">
            Configura e avvia un quiz per i tuoi studenti
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {configStatus === 'updated' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✅ Configurazione Aggiornata
            </span>
          )}
          {configStatus === 'needs-update' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              ⚠️ Richiede Aggiornamento
            </span>
          )}
          {configStatus === 'unknown' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              ❓ Stato Sconosciuto
            </span>
          )}
        </div>
      </div>

      {/* Selezione Quiz */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          1. Seleziona Quiz
          {currentGameQuiz?.subject && (
            <span className="ml-2 text-sm font-normal text-green-600">
              (Attivo: {currentGameQuiz.subject})
            </span>
          )}
        </h3>
        
        {quizzes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-gray-600 mb-4">Nessun quiz disponibile nell'archivio</p>
            <Button onClick={() => {
              router.push('/dashboard')
              // Imposta il tab archivio per creare un nuovo quiz
              setTimeout(() => {
                const event = new CustomEvent('setDashboardTab', { detail: 'archive' })
                window.dispatchEvent(event)
              }, 100)
            }}>
              Vai all'Archivio Quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabella quiz dettagliata */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      N° Domande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durata
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficoltà
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Punteggio Max
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Immagini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seleziona
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quizzes.map((quiz) => {
                    const preview = previewQuiz(quiz)
                    const isSelected = selectedQuiz && selectedQuiz.id === quiz.id
                    const difficulty = getDifficulty(quiz)
                    const maxScore = quiz.questions.length * 1000
                    
                    return (
                      <tr 
                        key={quiz.id}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                        onClick={() => handleQuizSelection(quiz)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                          <div className="text-sm text-gray-500">
                            Creato il {quiz.created} {quiz.author && `da ${quiz.author}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {quiz.subject}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {preview.questionsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {preview.duration}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            difficulty === 'Facile' ? 'bg-green-100 text-green-800' :
                            difficulty === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {maxScore.toLocaleString()} pt
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {preview.hasImages ? (
                            <span className="text-purple-600">📸 Sì</span>
                          ) : (
                            <span className="text-gray-400">📄 No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {isSelected ? (
                            <span className="text-blue-500 font-semibold">✓ Selezionato</span>
                          ) : (
                            <button className="text-blue-600 hover:text-blue-900">Seleziona</button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Banner dettagli quiz selezionato */}
        {selectedQuiz && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-blue-900">
                📊 Quiz Selezionato: {selectedQuiz.title}
              </h4>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Domande</div>
                <div className="text-2xl font-bold text-blue-600">{selectedQuiz.questions.length}</div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Durata Stimata</div>
                <div className="text-2xl font-bold text-green-600">{previewQuiz(selectedQuiz).duration}</div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Difficoltà</div>
                <div className={`text-2xl font-bold ${
                  getDifficulty(selectedQuiz) === 'Facile' ? 'text-green-600' :
                  getDifficulty(selectedQuiz) === 'Medio' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {getDifficulty(selectedQuiz)}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-1">Punteggio Max</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(selectedQuiz.questions.length * 1000).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Tempo Medio per Domanda</div>
                <div className="text-lg font-semibold text-gray-700">
                  {previewQuiz(selectedQuiz).averageTime}s
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Contenuti Multimediali</div>
                <div className="text-lg font-semibold text-gray-700">
                  {previewQuiz(selectedQuiz).hasImages ? '📸 Con immagini' : '📄 Solo testo'}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-xs font-medium text-gray-500 uppercase mb-2">Materia</div>
                <div className="text-lg font-semibold text-gray-700">
                  {selectedQuiz.subject}
                </div>
              </div>
            </div>

            {/* Status Configurazione Semplificato */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm text-blue-800">
                🎮 <strong>Modalità attiva:</strong> {
                  gameSettings.gameMode === 'standard' ? 'Standard' :
                  gameSettings.gameMode === 'chase' ? 'Inseguimento' :
                  gameSettings.gameMode === 'appearing' ? 'Risposte a Comparsa' :
                  gameSettings.gameMode === 'timed' ? 'Quiz a Tempo' :
                  gameSettings.gameMode === 'untimed' ? 'Senza Tempo' :
                  gameSettings.gameMode === 'survival' ? 'Sopravvivenza' : 'Standard'
                } |
                ⏩ <strong>Auto-advance:</strong> {gameSettings.autoAdvance ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Impostazioni Gioco */}
      {selectedQuiz && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2. Modalità e Configurazione Gioco
          </h3>
          
          <div className="space-y-6">
            {/* Modalità Quiz */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎮 Modalità Quiz</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="standard"
                    checked={gameSettings.gameMode === 'standard'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'standard' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">📝 Standard</div>
                    <div className="text-sm text-gray-600 mt-1">Modalità tradizionale con tempo fisso</div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="chase"
                    checked={gameSettings.gameMode === 'chase'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'chase' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">🏃 Inseguimento</div>
                    <div className="text-sm text-gray-600 mt-1">Domande a inseguimento veloce</div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="appearing"
                    checked={gameSettings.gameMode === 'appearing'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'appearing' 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">✨ Risposte a Comparsa</div>
                    <div className="text-sm text-gray-600 mt-1">Risposte appaiono gradualmente</div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="timed"
                    checked={gameSettings.gameMode === 'timed'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'timed' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">⏱️ Quiz a Tempo</div>
                    <div className="text-sm text-gray-600 mt-1">Tempo limitato per domanda</div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="untimed"
                    checked={gameSettings.gameMode === 'untimed'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'untimed' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">🎯 Senza Tempo</div>
                    <div className="text-sm text-gray-600 mt-1">Bonus per velocità, senza limite</div>
                  </div>
                </label>

                <label className="relative">
                  <input
                    type="radio"
                    name="gameMode"
                    value="survival"
                    checked={gameSettings.gameMode === 'survival'}
                    onChange={(e) => {
                      handleModeChange(e.target.value)
                    }}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    gameSettings.gameMode === 'survival' 
                      ? 'border-gray-800 bg-gray-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="font-semibold text-gray-900">💀 Sopravvivenza</div>
                    <div className="text-sm text-gray-600 mt-1">Eliminazione per errori</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Opzioni Generali */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">⚙️ Opzioni Generali</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.allowLateJoin}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, allowLateJoin: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Accesso Tardivo</div>
                    <div className="text-sm text-gray-600">Consenti agli studenti di unirsi dopo l'inizio</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.showLeaderboardBetweenQuestions}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, showLeaderboardBetweenQuestions: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Classifica Intermedia</div>
                    <div className="text-sm text-gray-600">Mostra classifica tra le domande</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.shuffleQuestions}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, shuffleQuestions: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Mescola Domande</div>
                    <div className="text-sm text-gray-600">Ordine casuale delle domande</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.shuffleAnswers}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, shuffleAnswers: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Mescola Risposte</div>
                    <div className="text-sm text-gray-600">Ordine casuale delle opzioni</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.bonusForSpeed}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, bonusForSpeed: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">🚀 Bonus Velocità</div>
                    <div className="text-sm text-gray-600">Punti extra per risposte veloci</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.showHints || false}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, showHints: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">💡 Suggerimenti</div>
                    <div className="text-sm text-gray-600">Mostra suggerimenti dopo tempo limite</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Opzioni Avanzate */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎯 Configurazioni Avanzate</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Timer Personalizzato */}
                {gameSettings.gameMode === 'timed' && (
                  <div className="space-y-3">
                    <label className="block">
                      <div className="font-medium text-gray-900 mb-2">⏱️ Tempo Personalizzato</div>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={gameSettings.customTime || 10}
                        onChange={(e) => {
                          setGameSettings(prev => ({ ...prev, customTime: parseInt(e.target.value) }))
                          setTimeout(checkConfigStatus, 100)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="text-sm text-gray-600 mt-1">Secondi per domanda (5-60)</div>
                    </label>
                  </div>
                )}

                {/* Vite Sopravvivenza */}
                {gameSettings.gameMode === 'survival' && (
                  <div className="space-y-3">
                    <label className="block">
                      <div className="font-medium text-gray-900 mb-2">💀 Numero Vite</div>
                      <select
                        value={gameSettings.lives || 1}
                        onChange={(e) => {
                          setGameSettings(prev => ({ ...prev, lives: parseInt(e.target.value) }))
                          setTimeout(checkConfigStatus, 100)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value={1}>1 vita (eliminazione immediata)</option>
                        <option value={2}>2 vite</option>
                        <option value={3}>3 vite</option>
                        <option value={5}>5 vite</option>
                      </select>
                      <div className="text-sm text-gray-600 mt-1">Errori consentiti prima dell'eliminazione</div>
                    </label>
                  </div>
                )}

                {/* Moltiplicatore Punti */}
                <div className="space-y-3">
                  <label className="block">
                    <div className="font-medium text-gray-900 mb-2">📊 Moltiplicatore Punti</div>
                    <select
                      value={gameSettings.pointsMultiplier || 1}
                      onChange={(e) => {
                        setGameSettings(prev => ({ ...prev, pointsMultiplier: parseFloat(e.target.value) }))
                        setTimeout(checkConfigStatus, 100)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value={0.5}>0.5x (Facile)</option>
                      <option value={1}>1x (Standard)</option>
                      <option value={1.5}>1.5x (Sfida)</option>
                      <option value={2}>2x (Difficile)</option>
                      <option value={3}>3x (Estremo)</option>
                    </select>
                    <div className="text-sm text-gray-600 mt-1">Moltiplicatore per tutti i punteggi</div>
                  </label>
                </div>

                {/* Limite Partecipanti */}
                <div className="space-y-3">
                  <label className="block">
                    <div className="font-medium text-gray-900 mb-2">👥 Limite Partecipanti</div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={gameSettings.maxPlayers || 50}
                      onChange={(e) => {
                        setGameSettings(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) }))
                        setTimeout(checkConfigStatus, 100)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <div className="text-sm text-gray-600 mt-1">Numero massimo di studenti (1-100)</div>
                  </label>
                </div>

                {/* Auto-avanzamento */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.autoAdvance || false}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, autoAdvance: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">⏩ Auto-avanzamento</div>
                    <div className="text-sm text-gray-600">Passa automaticamente alla domanda successiva</div>
                  </div>
                </label>

                {/* Suoni e Notifiche */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.playSound || true}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, playSound: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">🔊 Suoni e Effetti</div>
                    <div className="text-sm text-gray-600">Abilita notifiche audio durante il gioco</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={gameSettings.bonusForSpeed}
                    onChange={(e) => {
                      setGameSettings(prev => ({ ...prev, bonusForSpeed: e.target.checked }))
                      setTimeout(checkConfigStatus, 100)
                    }}
                    className="mr-3 w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Bonus Velocità</div>
                    <div className="text-sm text-gray-600">Punteggio extra per risposte veloci</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Selezione Sfondo */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">🎨 Tema Visuale</h4>
              <BackgroundSelector
                currentTheme={gameSettings.backgroundTheme}
                onThemeChange={(theme) => {
                  setGameSettings(prev => ({ ...prev, backgroundTheme: theme }))
                  setTimeout(checkConfigStatus, 100)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Anteprima e Lancio */}
      {selectedQuiz && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            3. Anteprima e Lancio
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Riepilogo Quiz:</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Titolo:</span>
                  <span className="font-medium">{selectedQuiz.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Materia:</span>
                  <span className="font-medium">{selectedQuiz.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span>Password:</span>
                  <span className="font-medium">{selectedQuiz.password || 'Nessuna'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Modalità:</span>
                  <span className="font-medium capitalize">
                    {gameSettings.gameMode === 'standard' ? '📝 Standard' :
                     gameSettings.gameMode === 'chase' ? '🏃 Inseguimento' :
                     gameSettings.gameMode === 'appearing' ? '✨ Risposte a Comparsa' :
                     gameSettings.gameMode === 'timed' ? '⏱️ Quiz a Tempo' :
                     gameSettings.gameMode === 'untimed' ? '🎯 Senza Tempo' :
                     gameSettings.gameMode === 'survival' ? '💀 Sopravvivenza' :
                     '📝 Standard'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Domande:</span>
                  <span>{selectedQuiz.questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Durata stimata:</span>
                  <span>{previewQuiz(selectedQuiz).duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tema sfondo:</span>
                  <span className="font-medium">
                    {gameSettings.backgroundTheme === 'laboratory' ? '🧪 Laboratorio' :
                     gameSettings.backgroundTheme === 'gaming1' ? '🎮 Gaming Tech 1' :
                     gameSettings.backgroundTheme === 'gaming2' ? '🎮 Gaming Tech 2' :
                     gameSettings.backgroundTheme === 'gaming3' ? '🎮 Gaming Tech 3' :
                     gameSettings.backgroundTheme === 'original' ? '⭐ Completo' :
                     '🧪 Laboratorio'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Istruzioni:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Clicca "Aggiorna Configurazione" per salvare le impostazioni</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Riavvia il server se necessario</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Clicca "Lancia Gioco" per iniziare</span>
                </div>
                <div className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Condividi il PIN con gli studenti per l'accesso</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-6">
            <Button 
              onClick={updateGameConfig}
              className="bg-blue-500 hover:bg-blue-600"
            >
              ⚙️ Aggiorna Configurazione
            </Button>
            <Button 
              onClick={launchGame}
              className="bg-green-500 hover:bg-green-600"
            >
              🚀 Lancia Gioco
            </Button>
          </div>
        </div>
      )}

      {/* Config Updater */}
      {selectedQuiz && (
        <ConfigUpdater 
          quiz={{
            ...selectedQuiz,
            password: gameSettings.password,
            questions: gameSettings.shuffleQuestions 
              ? [...selectedQuiz.questions].sort(() => Math.random() - 0.5)
              : selectedQuiz.questions
          }}
          onConfigUpdate={(config) => {
            console.log('Configurazione aggiornata:', config)
          }}
        />
      )}

      {/* Informazioni Stato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-500 mr-2">ℹ️</div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Configurazione Intelligente</p>
              <p className="text-blue-700 text-xs">
                Il sistema rileva automaticamente se il quiz è cambiato e aggiorna solo quando necessario.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-green-500 mr-2">🎯</div>
            <div className="text-sm">
              <p className="font-medium text-green-900 mb-1">Lancio Rapido</p>
              <p className="text-green-700 text-xs">
                Clicca "Lancia Gioco" per andare direttamente al gioco con le impostazioni correnti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}