import Button from "@/components/Button"
import GameWrapper from "@/components/game/GameWrapper"
import ManagerPassword from "@/components/ManagerPassword"
import { GAME_STATES, GAME_STATE_COMPONENTS_MANAGER } from "@/constants"
import { usePlayerContext } from "@/context/player"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"
import { createElement, useEffect, useState } from "react"

export default function Manager() {
  const { socket } = useSocketContext()

  const [nextText, setNextText] = useState("Start")
  const [state, setState] = useState({
    ...GAME_STATES,
    status: {
      ...GAME_STATES.status,
      name: "SHOW_ROOM",
    },
  })

  useEffect(() => {
    socket.on("game:status", (status) => {
      setState({
        ...state,
        status: status,
        question: {
          ...state.question,
          current: status.question,
        },
      })
      
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
    socket.on("game:saveStats", (gameStats) => {
      try {
        // Carica cronologia esistente
        const existingHistory = JSON.parse(localStorage.getItem('rahoot-game-history') || '[]')
        
        // Aggiungi nuova partita
        existingHistory.push(gameStats)
        
        // Mantieni solo le ultime 50 partite
        const limitedHistory = existingHistory.slice(-50)
        
        // Salva nel localStorage
        localStorage.setItem('rahoot-game-history', JSON.stringify(limitedHistory))
        
        console.log('📊 Statistiche salvate:', gameStats)
      } catch (error) {
        console.error('Errore nel salvare le statistiche:', error)
      }
    })

    socket.on("manager:inviteCode", (inviteCode) => {
      setState({
        ...state,
        created: true,
        status: {
          ...state.status,
          data: {
            ...state.status.data,
            inviteCode: inviteCode,
          },
        },
      })
    })

    return () => {
      socket.off("game:status")
      socket.off("manager:inviteCode")
    }
  }, [state])

  const handleCreate = (password) => {
    socket.emit("manager:createRoom", password)
  }

  const handleSkip = () => {
    setNextText("Skip")

    switch (state.status.name) {
      case "SHOW_ROOM":
        socket.emit("manager:startGame")
        break

      case "SELECT_ANSWER":
        socket.emit("manager:abortQuiz")
        break

      case "SHOW_RESPONSES":
        socket.emit("manager:showLeaderboard")
        break

      case "SHOW_LEADERBOARD":
        socket.emit("manager:nextQuestion")
        break

      case "FINISH":
        handleEndGame()
        break
    }
  }

  const handleEndGame = () => {
    // Conferma prima di chiudere
    const confirmEnd = confirm("🏆 Quiz completato!\n\nVuoi tornare al Dashboard per scegliere un nuovo quiz?")
    
    if (confirmEnd) {
      // Reset del manager
      setState({
        ...GAME_STATES,
        status: {
          ...GAME_STATES.status,
          name: "SHOW_ROOM",
        },
        created: false
      })
      
      // Naviga al dashboard
      router.push('/dashboard?tab=launch')
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
          <GameWrapper textNext={nextText} onNext={handleSkip} manager>
            {GAME_STATE_COMPONENTS_MANAGER[state.status.name] &&
              createElement(GAME_STATE_COMPONENTS_MANAGER[state.status.name], {
                data: state.status.data,
                manager: true
              })}
          </GameWrapper>
        </>
      )}
    </>
  )
}
