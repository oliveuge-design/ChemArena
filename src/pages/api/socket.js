import { Server } from 'socket.io'
import { GAME_STATE_INIT } from '../../../config.mjs'
import Manager from '../../../socket/roles/manager.js'
import Player from '../../../socket/roles/player.js'
import multiRoomManager from '../../../socket/multiRoomManager.js'

// LEGACY: Kept for backward compatibility
let gameState = {
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

let io

console.log('🏢 Multi-Room System initialized in API route')

// 🔧 PRODUCTION FIX: Disabilita bodyParser per WebSocket
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
}

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('🚀 Starting Socket.IO server...')

    // Create Socket.IO server with production-grade config
    io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        // 🔧 FIX RENDER: Permetti tutte le origini Render + localhost dev
        origin: (origin, callback) => {
          const allowedOrigins = [
            'https://chemarena.onrender.com',
            'https://chemarena-ai-generator.onrender.com',
            /https:\/\/.*\.onrender\.com$/,
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
          ]

          // Allow no origin (for mobile apps, curl, etc.)
          if (!origin) {
            return callback(null, true)
          }

          // Check if origin matches
          const allowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
              return allowed === origin
            }

            return allowed.test(origin)
          })

          if (allowed) {
            callback(null, true)
          } else {
            console.warn(`⚠️ CORS blocked origin: ${origin}`)
            callback(null, true) // 🔧 TEMPORARY: Allow all for debug
          }
        },
        credentials: true,
        methods: ["GET", "POST"]
      },
      // 🔧 PRODUCTION FIX: Configurazioni robuste per quiz live ad alto carico
      transports: ['websocket', 'polling'], // WebSocket prioritario, fallback polling
      pingTimeout: 60000,        // 60s - tolleranza reti mobili lente
      pingInterval: 25000,       // 25s - heartbeat frequente
      maxHttpBufferSize: 1e6,    // 1MB - supporto messaggi grandi (leaderboard)
      allowUpgrades: true,       // Permetti upgrade polling→websocket
      perMessageDeflate: false,  // Disabilita compressione per latency
      httpCompression: true,     // Abilita compressione HTTP
      connectTimeout: 45000,     // 45s timeout connessione iniziale
    })

    // Socket.IO event handlers
    io.on("connection", (socket) => {
      console.log(`A user connected ${socket.id}`)

      socket.on("player:checkRoom", (roomId) => {
        const roomState = multiRoomManager.getRoomState(roomId)
        if (roomState) {
          Player.checkRoom(roomState, io, socket, roomId)
        } else {
          socket.emit("player:roomNotFound", { roomId })
        }
      })

      socket.on("player:join", (player) => {
        console.log(`🚀 Player ${socket.id} joining room ${player.room} as ${player.username}`)

        const roomState = multiRoomManager.getPlayerRoom(socket.id) ||
                         multiRoomManager.getRoomState(player.room)

        if (roomState) {
          // Check username duplicates
          if (roomState.players.find((p) => p.username === player.username)) {
            console.log(`❌ Username already exists: ${player.username}`)
            socket.emit("game:errorMessage", "Username already exists")
            return
          }

          const joinResult = multiRoomManager.addPlayerToRoom(
            roomState.room,
            socket.id,
            player
          )

          if (joinResult.success) {
            console.log(`✅ Player ${player.username} added to room ${roomState.room}`)
            Player.join(roomState, io, socket, player)
          } else {
            console.log(`❌ Failed to add player: ${joinResult.error}`)
            socket.emit("player:joinError", { error: joinResult.error })
          }
        } else {
          console.log(`❌ Room ${player.room} not found`)
          socket.emit("player:roomNotFound", { room: player.room })
        }
      })

      socket.on("manager:createRoom", (data = {}, ackCallback) => {
        console.log(`🔍 DEBUG manager:createRoom - data ricevuto:`, {
          quizTitle: data.quizTitle,
          quizId: data.quizId,
          subject: data.subject,
          questionsCount: data.questions?.length,
          teacherId: data.teacherId
        })

        const teacherId = data.teacherId || `teacher_${socket.id}`

        const result = multiRoomManager.createRoom(socket.id, teacherId, data)

        if (result.success) {
          socket.join(result.roomId)

          // 🔧 FIX RENDER: Emit multipli con acknowledgment
          console.log(`📤 Emitting manager:inviteCode with PIN: ${result.roomId}`)
          socket.emit("manager:inviteCode", result.roomId)

          socket.emit("manager:roomCreated", {
            roomId: result.roomId,
            stats: result.stats
          })

          console.log(`✅ Room ${result.roomId} created successfully`)

          // 🔧 FIX: Acknowledge immediato al client
          if (typeof ackCallback === 'function') {
            ackCallback({
              success: true,
              roomId: result.roomId,
              message: 'Room created successfully'
            })
          }

          // 🔧 FIX: Retry emit dopo breve delay per sicurezza Render
          setTimeout(() => {
            console.log(`🔁 Retry emit manager:inviteCode: ${result.roomId}`)
            socket.emit("manager:inviteCode", result.roomId)
          }, 200)

        } else {
          socket.emit("manager:createRoomError", {
            error: result.error,
            suggestions: result.suggestions,
            stats: result.stats
          })
          console.log(`❌ Room creation failed: ${result.error}`)

          if (typeof ackCallback === 'function') {
            ackCallback({
              success: false,
              error: result.error
            })
          }
        }
      })
      
      socket.on("manager:kickPlayer", (playerId) => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          multiRoomManager.removePlayerFromRoom(playerId)
          Manager.kickPlayer(roomState, io, socket, playerId)
        }
      })

      socket.on("manager:startGame", () => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          multiRoomManager.updateRoomActivity(roomState.room, 'active')
          Manager.startGame(roomState, io, socket, multiRoomManager)
        }
      })

      socket.on("player:selectedAnswer", (answerKey) => {
        const roomState = multiRoomManager.getPlayerRoom(socket.id)
        if (roomState) {
          Player.selectedAnswer(roomState, io, socket, answerKey)
        }
      })

      socket.on("manager:abortQuiz", () => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.abortQuiz(roomState, io, socket)
          multiRoomManager.removeRoom(roomState.room, 'aborted')
        }
      })

      socket.on("manager:showLeaderboard", () => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.showLeaderboard(roomState, io, socket)
        }
      })

      socket.on("manager:nextQuestion", () => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.nextQuestion(roomState, io, socket, multiRoomManager)
        }
      })

      socket.on("manager:skipQuestion", () => {
        console.log(`🎯 Skip question request from ${socket.id}`)
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.skipQuestion(roomState, io, socket, multiRoomManager)
        } else {
          console.log(`❌ No room found for manager ${socket.id}`)
        }
      })

      socket.on("manager:resetGame", () => {
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.resetGame(roomState, io, socket)
          multiRoomManager.updateRoomActivity(roomState.room, 'waiting')
        }
      })

      socket.on("admin:updateGameState", (newGameState) => {
        // Legacy support - deprecated in favor of multi-room
        Object.assign(gameState, newGameState)
        console.log("⚠️ Legacy admin:updateGameState used (deprecated)")
      })

      socket.on("manager:forceReset", () => {
        console.log(`🚨 Force reset requested by ${socket.id}`)
        const roomState = multiRoomManager.getManagerRoom(socket.id)
        if (roomState) {
          Manager.forceReset(roomState, io, socket)
          multiRoomManager.removeRoom(roomState.room, 'force_reset')
          console.log(`✅ Room ${roomState.room} force reset completed`)
        } else {
          console.log(`⚠️ No room found for force reset`)
        }
      })

      socket.on("disconnect", () => {
        console.log(`👋 User disconnected ${socket.id}`)

        // Check if manager
        const managerRoom = multiRoomManager.getManagerRoom(socket.id)
        if (managerRoom) {
          console.log(`🚨 Manager disconnected for room ${managerRoom.room}`)
          io.to(managerRoom.room).emit("game:reset")
          multiRoomManager.removeRoom(managerRoom.room, 'manager_disconnect')
          return
        }

        // Check if player
        const playerRoom = multiRoomManager.getPlayerRoom(socket.id)
        if (playerRoom) {
          console.log(`👤 Player disconnected from room ${playerRoom.room}`)
          multiRoomManager.removePlayerFromRoom(socket.id)
          if (playerRoom.manager) {
            socket.to(playerRoom.manager).emit("manager:removePlayer", socket.id)
          }
          return
        }

        console.log(`⚠️ Disconnected socket ${socket.id} had no active room`)
      })
    })

    res.socket.server.io = io
    console.log('✅ Socket.IO server initialized')
  }

  res.end()
}