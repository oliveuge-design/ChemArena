import Button from "@/components/Button"
import GameWrapper from "@/components/game/GameWrapper"
import ManagerPassword from "@/components/ManagerPassword"
import { GAME_STATES, GAME_STATE_COMPONENTS_MANAGER } from "@/constants"
import { usePlayerContext } from "@/context/player"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"
import { createElement, useEffect, useState } from "react"

export default function Manager() {
  const { socket, emit, on, off } = useSocketContext()
  const router = useRouter()

  const [nextText, setNextText] = useState("Start")
  const [state, setState] = useState({
    ...GAME_STATES,
    status: {
      ...GAME_STATES.status,
      name: "SHOW_ROOM",
    },
  })

  useEffect(() => {
    on("game:status", (status) => {
      setState(prevState => ({
        ...prevState,
        status: status,
        question: {
          ...prevState.question,
          current: status.question,
        },
      }))
      
      // Aggiorna il testo del pulsante basandosi sullo stato
      switch (status.name) {
        case "SHOW_ROOM":
          setNextText("Start")
          break
        case "FINISH":
          setNextText("🏠 Nuovo Quiz")
          break
        default:
          setNextText("Skip")
          break
      }
    })

    // Listener per salvare statistiche di gioco
    on("game:saveStats", (gameStats) => {
      try {
        // Carica cronologia esistente
        const existingHistory = JSON.parse(localStorage.getItem('chemarena-game-history') || '[]')
        
        // Aggiungi nuova partita
        existingHistory.push(gameStats)
        
        // Mantieni solo le ultime 50 partite
        const limitedHistory = existingHistory.slice(-50)
        
        // Salva nel localStorage
        localStorage.setItem('chemarena-game-history', JSON.stringify(limitedHistory))
        
        console.log('📊 Statistiche salvate:', gameStats)
      } catch (error) {
        console.error('Errore nel salvare le statistiche:', error)
      }
    })

    on("manager:inviteCode", (inviteCode) => {
      setState(prevState => ({
        ...prevState,
        created: true,
        status: {
          ...prevState.status,
          data: {
            ...prevState.status.data,
            inviteCode: inviteCode,
          },
        },
      }))
    })

    return () => {
      off("game:status")
      off("game:saveStats")
      off("manager:inviteCode")
    }
  }, [on, off])

  const handleCreate = () => {
    console.log('🔌 Attempting to create room...')

    // 1. Carica quiz selezionato dal localStorage
    let quizData = {}
    try {
      const currentQuiz = localStorage.getItem('current-game-quiz')
      const authenticatedTeacher = JSON.parse(localStorage.getItem('teacher-auth') || '{}')

      if (currentQuiz) {
        const quiz = JSON.parse(currentQuiz)
        console.log('📝 QUIZ SELEZIONATO RILEVATO:', quiz.title)
        console.log('📚 Materia:', quiz.subject)
        console.log('🔢 Domande:', quiz.questions?.length || 0)
        console.log('🔑 Password:', quiz.password || 'CHEMARENA')

        // Carica anche le impostazioni di gioco
        const gameSettings = JSON.parse(localStorage.getItem('game-settings') || '{}')

        quizData = {
          teacherId: authenticatedTeacher.id || `teacher_${socket.id}`,
          subject: quiz.subject || 'Quiz',
          questions: quiz.questions || [],
          quizTitle: quiz.title,
          quizId: quiz.id,
          gameMode: gameSettings.gameMode || quiz.gameMode || 'standard',
          gameSettings: gameSettings
        }

        console.log('🎮 Game Mode caricato:', quizData.gameMode)
        console.log('⚙️ Game Settings:', gameSettings)
      } else {
        console.warn('⚠️ Nessun quiz selezionato, uso configurazione default')
        quizData = {
          teacherId: authenticatedTeacher.id || `teacher_${socket.id}`
        }
      }
    } catch (error) {
      console.error('❌ Errore lettura quiz:', error)
      quizData = {
        teacherId: `teacher_${socket.id}`
      }
    }

    // Listener per errori di creazione room
    const handleRoomError = (error) => {
      console.log('❌ Room creation error:', error)
      if (error === "Already manager") {
        const forceReset = confirm("⚠️ Stato server inconsistente!\n\nIl server pensa che ci sia già un manager attivo.\n\nVuoi forzare un reset completo?")
        if (forceReset) {
          console.log('🚨 Forcing server reset...')
          emit("manager:forceReset")
          setTimeout(() => {
            emit("manager:createRoom", quizData)
          }, 500) // Retry dopo il reset CON quiz data
        }
      }
    }

    // Ascolta per errori
    on("game:errorMessage", handleRoomError)

    // Cleanup del listener dopo 5 secondi
    setTimeout(() => {
      off("game:errorMessage", handleRoomError)
    }, 5000)

    // 2. Emetti creazione room CON i dati del quiz
    console.log('🚀 Creazione room con quiz data:', quizData)
    emit("manager:createRoom", quizData)
  }

  const handleSkip = () => {
    // Validazione stato prima di procedere
    if (!state || !state.status || !state.status.name) {
      console.warn('⚠️ Stato non valido per handleSkip:', state)
      return
    }

    setNextText("Skip")

    switch (state.status.name) {
      case "SHOW_ROOM":
        if (socket && emit) emit("manager:startGame")
        break

      case "SHOW_QUESTION":
        // Skip direttamente alla fase di selezione delle risposte
        if (socket && emit) emit("manager:abortQuiz")
        break

      case "SELECT_ANSWER":
        if (socket && emit) emit("manager:abortQuiz")
        break

      case "SHOW_RESPONSES":
        if (socket && emit) emit("manager:showLeaderboard")
        break

      case "SHOW_LEADERBOARD":
        if (socket && emit) emit("manager:nextQuestion")
        break

      case "FINISH":
        handleEndGame()
        break

      default:
        console.warn('⚠️ Stato sconosciuto in handleSkip:', state.status.name)
        break
    }
  }

  const handleEndGame = () => {
    // Conferma prima di chiudere
    const confirmEnd = confirm("🏆 Quiz completato!\n\nVuoi tornare al Dashboard per scegliere un nuovo quiz?")
    
    if (confirmEnd) {
      // Reset del game state sul server
      if (socket && emit) {
        emit("manager:resetGame")
      }
      
      // Reset del manager
      setState({
        ...GAME_STATES,
        status: {
          ...GAME_STATES.status,
          name: "SHOW_ROOM",
        },
        created: false
      })
      
      // Determina il dashboard corretto basato sul ruolo dell'utente
      const savedTeacher = localStorage.getItem('teacher-auth')
      let dashboardUrl = '/dashboard?tab=launch' // Default per admin
      
      if (savedTeacher) {
        try {
          const teacherData = JSON.parse(savedTeacher)
          if (teacherData.role === 'teacher') {
            dashboardUrl = '/teacher-dashboard?tab=launch'
          }
        } catch (error) {
          console.error('Errore parsing teacher data:', error)
        }
      }
      
      // Naviga al dashboard corretto
      router.push(dashboardUrl)
    }
  }

  const handleCreateNewRoom = () => {
    // Messaggio di conferma dinamico basato sullo stato
    const isQuizActive = state.status.name !== "SHOW_ROOM" && state.status.name !== "FINISH"
    const confirmMessage = isQuizActive 
      ? "🚨 Quiz in corso!\n\nVuoi interrompere il quiz e scegliere un nuovo quiz?"
      : "🆕 Vuoi scegliere un nuovo quiz?\n\nVerrai portato al dashboard per la selezione."
    
    const confirmReset = confirm(confirmMessage)
    
    if (confirmReset) {
      // Reset del game state sul server
      if (socket && emit) {
        emit("manager:resetGame")
        if (isQuizActive) {
          emit("manager:abortQuiz")
        }
      }
      
      // Reset completo dello stato locale - forza il reset completo
      setState({
        ...GAME_STATES,
        status: {
          ...GAME_STATES.status,
          name: "SHOW_ROOM",
        },
        created: false // Questo forza il ritorno al ManagerPassword
      })
      
      // Determina il dashboard corretto basato sul ruolo dell'utente
      const savedTeacher = localStorage.getItem('teacher-auth')
      let dashboardUrl = '/dashboard?tab=launch' // Default per admin
      
      if (savedTeacher) {
        try {
          const teacherData = JSON.parse(savedTeacher)
          if (teacherData.role === 'teacher') {
            dashboardUrl = '/teacher-dashboard?tab=launch'
          }
        } catch (error) {
          console.error('Errore parsing teacher data:', error)
        }
      }
      
      // Invece di navigare, resetta completamente lo stato per permettere nuova generazione PIN
      // Questo permette di generare un nuovo PIN subito
      setTimeout(() => {
        router.push(dashboardUrl)
      }, 100)
    }
  }

  return (
    <>
      {!state.created ? (
        <div>
          <ManagerPassword onCreateRoom={handleCreate} />
        </div>
      ) : (
        <>
          <GameWrapper textNext={nextText} onNext={handleSkip} manager backgroundTheme="gaming1">
            {GAME_STATE_COMPONENTS_MANAGER[state.status.name] && (
              <div key={`game-state-${state.status.name}`}>
                {createElement(GAME_STATE_COMPONENTS_MANAGER[state.status.name], {
                  data: state.status.data,
                  manager: true
                })}
              </div>
            )}
          </GameWrapper>
          
          {/* Pulsante per creare nuova room - Sempre disponibile */}
          <div className="fixed bottom-4 left-4 z-50" key="new-room-button">
            <Button
              onClick={handleCreateNewRoom}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-medium rounded-lg shadow-lg"
            >
              Nuova Room
            </Button>
          </div>
        </>
      )}
    </>
  )
}
