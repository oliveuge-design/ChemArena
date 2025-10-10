import Form from "@/components/Form"
import Button from "@/components/Button"
import TeacherAuth from "@/components/TeacherAuth"
import BackgroundManager from "@/components/BackgroundManager"
import { useEffect, useState } from "react"
import { useSocketContext } from "@/context/socket"
import toast from "react-hot-toast"

export default function ManagerPassword({ onCreateRoom }) {
  const { socket, emit, on, off } = useSocketContext()
  const [loading, setLoading] = useState(false)
  const [authenticatedTeacher, setAuthenticatedTeacher] = useState(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)

  useEffect(() => {
    // Controlla autenticazione con un piccolo delay per assicurarsi che localStorage sia disponibile
    const checkAuthentication = () => {
      const savedTeacher = localStorage.getItem('teacher-auth')
      console.log('ManagerPassword: localStorage teacher-auth:', savedTeacher ? 'FOUND' : 'NOT FOUND')

      if (savedTeacher) {
        try {
          const teacherData = JSON.parse(savedTeacher)
          console.log('ManagerPassword: Teacher data loaded:', teacherData.name, teacherData.role)
          setAuthenticatedTeacher(teacherData)
        } catch (error) {
          console.error('ManagerPassword: Error parsing teacher data:', error)
          localStorage.removeItem('teacher-auth')
        }
      } else {
        console.log('ManagerPassword: No teacher authentication found, showing login form')
      }
    }

    // Carica il nome del quiz corrente - versione ottimizzata
    const loadCurrentQuiz = () => {
      try {
        const savedQuiz = localStorage.getItem('current-game-quiz')
        if (savedQuiz) {
          const quiz = JSON.parse(savedQuiz)
          // Usa setTimeout per assicurarsi che DOM sia pronto
          setTimeout(() => {
            const quizNameElement = document.getElementById('current-quiz-name')
            if (quizNameElement && quizNameElement.textContent !== quiz.title) {
              quizNameElement.textContent = quiz.title
              quizNameElement.classList.add('animate-pulse')
              console.log('🎯 Quiz corrente caricato:', quiz.title)
            }
          }, 50)
        }
      } catch (error) {
        console.error('Errore caricamento nome quiz:', error)
      }
    }

    // Controlla immediatamente
    checkAuthentication()

    // Solo un timeout per loadCurrentQuiz
    const timeout = setTimeout(() => {
      loadCurrentQuiz()
    }, 200)

    return () => clearTimeout(timeout)
  }, [])


  const handleCreate = async () => {
    if (!authenticatedTeacher) {
      toast.error('Devi autenticarti come insegnante prima di creare una room')
      return
    }

    // Prevenzione loop infinito
    if (isCreatingRoom || loading) {
      console.log('🛑 Creazione già in corso, ignoro chiamata duplicata')
      return
    }

    setIsCreatingRoom(true)
    setLoading(true)

    try {
      // 🔧 FIX RENDER: Verifica connessione socket
      if (!socket || !socket.connected) {
        console.error('❌ Socket not connected, waiting...')
        toast.error('Connessione al server in corso...')

        // Attendi connessione
        const waitForConnection = new Promise((resolve, reject) => {
          let attempts = 0
          const maxAttempts = 20

          const checkConnection = setInterval(() => {
            attempts++
            console.log(`🔄 Checking socket... (${attempts}/${maxAttempts})`)

            if (socket && socket.connected) {
              clearInterval(checkConnection)
              resolve(true)
            } else if (attempts >= maxAttempts) {
              clearInterval(checkConnection)
              reject(new Error('Socket timeout'))
            }
          }, 200)
        })

        try {
          await waitForConnection
          toast.success('Connessione stabilita!')
        } catch (error) {
          toast.error('Errore di connessione. Ricarica la pagina.')
          setLoading(false)
          setIsCreatingRoom(false)
          return
        }
      }

      // SOLUZIONE GENIALE: Carica il quiz selezionato direttamente
      const currentQuiz = localStorage.getItem('current-game-quiz')
      let quizData = {}

      if (currentQuiz) {
        try {
          const quiz = JSON.parse(currentQuiz)
          console.log(`🎯 QUIZ SELEZIONATO RILEVATO: ${quiz.title}`)

          // Prepara i dati del quiz per la room (password rimossa - serve solo per studenti)
          quizData = {
            subject: quiz.subject || 'Quiz',
            questions: quiz.questions || [],
            quizTitle: quiz.title,
            quizId: quiz.id,
            gameMode: quiz.gameMode || 'standard',
            gameSettings: quiz.gameSettings || {}
          }

          console.log(`📊 Dati quiz preparati:`, {
            title: quizData.quizTitle,
            subject: quizData.subject,
            questionsCount: quizData.questions.length
          })
        } catch (parseError) {
          console.error('Errore parsing quiz selezionato:', parseError)
          toast.error('Errore nel caricamento del quiz selezionato')
          setLoading(false)
          setIsCreatingRoom(false)
          return
        }
      } else {
        console.warn('⚠️ Nessun quiz selezionato trovato, uso configurazione default')
        toast.error('Nessun quiz selezionato! Seleziona prima un quiz dal dashboard.')
        setLoading(false)
        setIsCreatingRoom(false)
        return
      }

      // Sempre pulire eventuali room precedenti prima di creare una nuova
      if (socket && emit) {
        emit("manager:closeRoom")
        emit("manager:abortQuiz")

        // Piccolo delay per assicurare che i messaggi siano processati
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      if (onCreateRoom) {
        onCreateRoom()
      } else {
        // 🔧 FIX RENDER: PASSA I DATI DEL QUIZ CON ACKNOWLEDGMENT
        console.log(`🚀 Creazione room con acknowledgment...`)

        socket.emit("manager:createRoom", {
          teacherId: authenticatedTeacher.id,
          ...quizData
        }, (ack) => {
          console.log('📨 ACK received:', ack)

          if (ack && ack.success) {
            console.log(`✅ Room ${ack.roomId} creata con successo via ACK`)
            toast.success(`PIN generato: ${ack.roomId}`)
          } else {
            console.error('❌ Room creation failed:', ack?.error)
            toast.error(`Errore: ${ack?.error || 'Sconosciuto'}`)
          }
        })

        console.log(`✅ Room creata con quiz: ${quizData.quizTitle}`)
      }

    } catch (error) {
      console.error('Errore durante la creazione della room:', error)
      toast.error('Errore durante la creazione della room')
    } finally {
      setLoading(false)
      setIsCreatingRoom(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('teacher-auth')
    setAuthenticatedTeacher(null)
    toast.success('Logout effettuato')
  }

  const handleAuthSuccess = (teacher) => {
    setAuthenticatedTeacher(teacher)
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleCreate()
    }
  }

  useEffect(() => {
    on("game:errorMessage", (message) => {
      toast.error(message)
    })

    return () => {
      off("game:errorMessage")
    }
  }, [on, off])

  if (!authenticatedTeacher) {
    return <TeacherAuth onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <BackgroundManager theme="gaming2" opacity={80} className="min-h-screen">
      {/* CSS personalizzato per le animazioni */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>

      <section className="relative flex min-h-screen flex-col items-center justify-center">
        <div className="absolute h-full w-full overflow-hidden">
          <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-primary/15"></div>
          <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-primary/15"></div>
        </div>

      {/* Logo CHEMARENA Ingrandito con Effetti Sci-Fi */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="relative mb-4">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-400 filter drop-shadow-[0_0_30px_rgba(0,255,136,0.8)] animate-pulse">
            CHEMARENA
          </h1>

          {/* Effetto glow esterno */}
          <div className="absolute inset-0 text-8xl font-bold text-green-400 opacity-30 blur-xl animate-pulse">
            CHEMARENA
          </div>

          {/* Particelle che orbitano */}
          <div className="absolute -top-4 -left-4 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -top-2 right-8 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -bottom-3 left-12 w-1.5 h-1.5 bg-green-300 rounded-full animate-ping opacity-60" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1 -right-2 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping opacity-40" style={{animationDelay: '1.5s'}}></div>
        </div>

        {/* Nome Quiz Corrente */}
        <div className="text-center mb-4">
          <div className="relative inline-block">
            <div className="text-2xl font-semibold text-green-400 drop-shadow-[0_0_10px_rgba(0,255,136,0.6)] mb-2">
              📝 Quiz Selezionato:
            </div>
            <div className="text-xl font-bold text-white border-2 border-green-400 rounded-lg px-6 py-2 bg-black/40 shadow-[0_0_20px_rgba(0,255,136,0.3)]">
              <span id="current-quiz-name">Caricamento quiz...</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 text-center bg-black/60 backdrop-blur-md p-4 rounded-xl border border-green-400/40 shadow-[0_0_30px_rgba(0,255,136,0.2)]">
        <p className="text-green-400 font-semibold text-lg filter drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]">
          ✅ Benvenuto/a {authenticatedTeacher.name}
        </p>
        <p className="text-green-300 text-base mt-1 filter drop-shadow-[0_0_5px_rgba(0,255,136,0.6)]">
          {authenticatedTeacher.subject} • {authenticatedTeacher.email}
        </p>
        <Button
          onClick={handleLogout}
          className="mt-3 bg-red-500 hover:bg-red-600 text-white px-6 py-2 text-sm border-2 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)] transition-all duration-300"
        >
          🚪 Logout
        </Button>
      </div>

      {/* Pulsanti orizzontali sopra il form */}
      <div className="flex items-center justify-center w-full max-w-4xl gap-8 mb-6">
        {/* Pulsante Dashboard a sinistra */}
        <div className="flex flex-col items-center">
          <Button
            onClick={() => {
              const dashboardUrl = authenticatedTeacher.role === 'admin' ? '/dashboard' : '/teacher-dashboard'
              window.open(dashboardUrl, '_blank')
            }}
            className="relative bg-purple-600 hover:bg-purple-500 text-white px-4 py-3 text-sm font-semibold rounded-lg border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)] transition-all duration-300 transform hover:scale-105 mb-2"
          >
            <span className="relative z-10">📚 Dashboard</span>
            <div className="absolute inset-0 bg-purple-400 opacity-20 rounded-lg animate-pulse"></div>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-300 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-40" style={{animationDelay: '0.5s'}}></div>
          </Button>
          <span className="text-green-400 text-xs">Pannello di controllo</span>
        </div>

        {/* Pulsante Cambia Utente a destra */}
        <div className="flex flex-col items-center">
          <Button
            onClick={() => {
              window.location.href = '/login'
            }}
            className="relative bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-3 text-sm font-semibold rounded-lg border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all duration-300 transform hover:scale-105 mb-2"
          >
            <span className="relative z-10">🔄 Cambia Utente</span>
            <div className="absolute inset-0 bg-cyan-400 opacity-20 rounded-lg animate-pulse" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-300 rounded-full animate-ping opacity-60"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping opacity-40" style={{animationDelay: '0.8s'}}></div>
          </Button>
          <span className="text-green-400 text-xs">Switch account</span>
        </div>
      </div>

      {/* Form centrale allineato */}
      <div className="flex justify-center w-full">
        <Form className="w-full max-w-md">
          <div className="mb-6 text-center">
            <p className="text-green-400 text-2xl font-bold mb-4 filter drop-shadow-[0_0_15px_rgba(0,255,136,0.8)]">
              🎯 Pronto per iniziare il quiz?
            </p>

            {/* Icona animata che punta al pulsante */}
            <div className="flex items-center justify-center mb-4">
              <div className="animate-bounce">
                <svg
                  className="w-8 h-8 text-green-400 filter drop-shadow-[0_0_10px_rgba(0,255,136,0.8)]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 12 12;360 12 12"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </svg>
              </div>
              <div className="ml-2">
                <svg
                  className="w-6 h-6 text-green-300 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
            </div>
          </div>

        <Button
          onClick={() => handleCreate()}
          disabled={loading || isCreatingRoom}
          className="relative w-full py-6 text-2xl font-bold bg-gradient-to-r from-green-500 via-green-400 to-cyan-400 hover:from-green-400 hover:via-cyan-400 hover:to-green-500 text-black rounded-xl border-4 border-green-400 shadow-[0_0_40px_rgba(0,255,136,0.8)] hover:shadow-[0_0_60px_rgba(0,255,136,1)] transition-all duration-500 transform hover:scale-105 overflow-hidden"
        >
          <span className="relative z-20">
            {loading || isCreatingRoom ? '🔄 Creazione in corso...' : '🚀 Crea Room e Genera PIN'}
          </span>

          {/* Effetto scintillio animato */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer z-10"></div>

          {/* Particelle volanti */}
          <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-bounce opacity-80" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-3 right-8 w-1.5 h-1.5 bg-white rounded-full animate-bounce opacity-60" style={{animationDelay: '0.3s'}}></div>
          <div className="absolute bottom-2 left-12 w-1 h-1 bg-cyan-200 rounded-full animate-bounce opacity-70" style={{animationDelay: '0.6s'}}></div>
          <div className="absolute bottom-3 right-4 w-2.5 h-2.5 bg-green-200 rounded-full animate-bounce opacity-50" style={{animationDelay: '0.9s'}}></div>

          {/* Linee di energia che scorrono */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-300 to-transparent animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </Button>

          <div className="mt-6 text-center">
            <p className="text-green-400 text-base font-medium filter drop-shadow-[0_0_5px_rgba(0,255,136,0.7)]">
              Dopo aver creato la room, otterrai un PIN numerico da condividere con gli studenti
            </p>
            <div className="mt-2 flex justify-center items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
              <span className="text-green-300 text-sm">Sistema pronto per la connessione</span>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>
          </div>
        </Form>
      </div>
      </section>
    </BackgroundManager>
  )
}
