import { Server } from 'socket.io'
import { GAME_STATE_INIT } from '../../../config.mjs'
import Manager from '../../../socket/roles/manager.js'
import Player from '../../../socket/roles/player.js'

// FIXED: Prioritize runtime quiz config over file-based fallback
function initializeGameState() {
  // Priorità: 1) Global runtime config 2) File config fallback
  const runtimeConfig = global.currentQuizConfig

  if (runtimeConfig) {
    console.log('🎯 Using RUNTIME quiz config:', {
      subject: runtimeConfig.subject,
      questions: runtimeConfig.questions?.length || 0,
      password: runtimeConfig.password
    })
    return {
      started: false,
      players: [],
      playersAnswer: [],
      manager: null,
      room: null,
      currentQuestion: 0,
      roundStartTime: 0,
      password: runtimeConfig.password || 'CHEMARENA',
      subject: runtimeConfig.subject || 'Quiz',
      questions: runtimeConfig.questions || []
    }
  } else {
    console.log('⚠️ Using FALLBACK quiz config from file:', {
      subject: GAME_STATE_INIT.subject,
      questions: GAME_STATE_INIT.questions?.length || 0,
      password: GAME_STATE_INIT.password
    })
    return {
      started: false,
      players: [],
      playersAnswer: [],
      manager: null,
      room: null,
      currentQuestion: 0,
      roundStartTime: 0,
      password: GAME_STATE_INIT.password,
      subject: GAME_STATE_INIT.subject,
      questions: GAME_STATE_INIT.questions
    }
  }
}

// Initialize game state with priority to runtime config
let gameState = initializeGameState()

let io

// FIXED: Function to update gameState from external APIs
export function updateGameState(newConfig) {
  if (newConfig) {
    // Update global config first
    global.currentQuizConfig = newConfig

    // Reset game state to ensure clean sync
    gameState = {
      ...gameState,
      // Preserve connection state but reset quiz data
      started: false,
      currentQuestion: 0,
      roundStartTime: 0,
      // Update quiz data
      password: newConfig.password || 'CHEMARENA',
      subject: newConfig.subject || 'Quiz',
      questions: newConfig.questions || []
    }

    console.log('🔄 GameState updated and re-synchronized:', {
      password: gameState.password,
      subject: gameState.subject,
      questions: gameState.questions?.length || 0,
      globalConfigUpdated: !!global.currentQuizConfig
    })

    // Notify all connected sockets of the update
    if (io) {
      io.emit('gameState:updated', {
        password: gameState.password,
        subject: gameState.subject,
        questionsCount: gameState.questions?.length || 0
      })
    }
  }
}

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🚀 Starting Socket.IO server...')

    // Create Socket.IO server
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ["https://*.onrender.com", "https://*.render.com"] 
          : "*",
        credentials: true,
      },
    })

    // Socket.IO event handlers
    io.on("connection", (socket) => {
      console.log(`A user connected ${socket.id}`)

      socket.on("player:checkRoom", (roomId) =>
        Player.checkRoom(gameState, io, socket, roomId),
      )

      socket.on("player:join", (player) =>
        Player.join(gameState, io, socket, player),
      )

      socket.on("manager:createRoom", () =>
        Manager.createRoom(gameState, io, socket),
      )
      
      socket.on("manager:kickPlayer", (playerId) =>
        Manager.kickPlayer(gameState, io, socket, playerId),
      )

      socket.on("manager:startGame", () => Manager.startGame(gameState, io, socket))

      socket.on("player:selectedAnswer", (answerKey) =>
        Player.selectedAnswer(gameState, io, socket, answerKey),
      )

      socket.on("manager:abortQuiz", () => Manager.abortQuiz(gameState, io, socket))

      socket.on("manager:showLeaderboard", () =>
        Manager.showLeaderboard(gameState, io, socket),
      )

      socket.on("manager:nextQuestion", () =>
        Manager.nextQuestion(gameState, io, socket),
      )

      socket.on("admin:updateGameState", (newGameState) => {
        Object.assign(gameState, newGameState)
        console.log("🔄 Game state updated:", {
          password: gameState.password,
          subject: gameState.subject,
          questions: gameState.questions?.length
        })
      })

      socket.on("manager:forceReset", () => {
        console.log(`🚨 Force reset requested by ${socket.id} - Current state:`, {
          manager: gameState.manager,
          room: gameState.room
        })
        Manager.forceReset(gameState, io, socket)
        console.log("✅ Legacy game state force reset completed")
      })

      socket.on("disconnect", () => {
        console.log(`User disconnected ${socket.id}`)
        Player.disconnect(gameState, io, socket)
      })
    })

    res.socket.server.io = io
    console.log('✅ Socket.IO server initialized')
  }

  res.end()
}