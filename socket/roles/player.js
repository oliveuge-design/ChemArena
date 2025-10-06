import convertTimeToPoint from "../utils/convertTimeToPoint.js"
import { abortCooldown } from "../utils/cooldown.js"
import { inviteCodeValidator, usernameValidator } from "../validator.js"
import QuizModeEngine from "../utils/QuizModeEngine.js"

const Player = {
  checkRoom: async (game, io, socket, roomId) => {
    console.log(`🔍 Player ${socket.id} checking room ${roomId} - Current game room: ${game.room}`)
    
    try {
      await inviteCodeValidator.validate(roomId)
    } catch (error) {
      console.log(`❌ Room validation failed: ${error.errors[0]}`)
      socket.emit("game:errorMessage", error.errors[0])
      return
    }

    if (!game.room || roomId !== game.room) {
      console.log(`❌ Room not found or mismatch - game.room: ${game.room}, requested: ${roomId}`)
      socket.emit("game:errorMessage", "Room not found")
      return
    }

    console.log(`✅ Room check success for ${socket.id}`)
    socket.emit("game:successRoom", roomId)
  },

  join: async (game, io, socket, player) => {
    console.log(`🚀 Player ${socket.id} attempting to join room ${player.room} with username: ${player.username}`)
    
    try {
      await usernameValidator.validate(player.username)
    } catch (error) {
      console.log(`❌ Username validation failed: ${error.errors[0]}`)
      socket.emit("game:errorMessage", error.errors[0])
      return
    }

    if (!game.room || player.room !== game.room) {
      console.log(`❌ Join failed - Room mismatch: game.room=${game.room}, player.room=${player.room}`)
      socket.emit("game:errorMessage", "Room not found")
      return
    }

    // Controllo username duplicati spostato in socket/index.js PRIMA di addPlayerToRoom

    if (game.started) {
      console.log(`❌ Game already started, cannot join`)
      socket.emit("game:errorMessage", "Game already started")
      return
    }

    console.log(`✅ Player join successful: ${player.username} in room ${player.room}`)

    socket.join(player.room)

    let playerData = {
      username: player.username,
      displayName: player.displayName || player.username,
      room: player.room,
      id: socket.id,
      points: 0,
      isEducational: player.isEducational || false,
      joinedAt: new Date().toISOString(),
      // Student profile data
      studentId: player.studentId || null,
      isRegistered: player.isRegistered || false,
      className: player.className || null,
    }
    socket.to(player.room).emit("manager:newPlayer", { ...playerData })

    // Verifica se il player è già presente (evita duplicazione dal multiRoomManager)
    const existingPlayer = game.players.find(p => p.id === socket.id)
    if (!existingPlayer) {
      game.players.push(playerData)
      console.log(`👤 Player ${playerData.username} aggiunto alla game.players (totale: ${game.players.length})`)
    } else {
      console.log(`⚠️ Player ${playerData.username} già presente, skip duplicazione`)
    }

    socket.emit("game:successJoin")

    // Invia stato WAIT per mostrare "Sei Dentro, attendi!"
    socket.emit("game:status", {
      name: "WAIT",
      data: {
        text: "✅ Sei Dentro! Attendi l'inizio del quiz..."
      }
    })
  },

  selectedAnswer: (game, io, socket, answerKey) => {
    const player = game.players.find((player) => player.id === socket.id)
    const question = game.questions[game.currentQuestion]
    const gameMode = game.gameMode || 'standard'

    if (!player) {
      return
    }

    // Verifica se il giocatore può ancora rispondere (modalità sopravvivenza)
    if (!QuizModeEngine.canPlayerAnswer(game, socket.id)) {
      socket.emit("game:status", {
        name: "ELIMINATED",
        data: { text: "💀 Sei stato eliminato!" },
      })
      return
    }

    // Verifica se ha già risposto
    if (game.playersAnswer.find((p) => p.id === socket.id)) {
      return
    }

    // Ottieni configurazione modalità per tempi appropriati
    const modeConfig = QuizModeEngine.getModeConfig(gameMode, question, game.gameSettings)

    // Aggiungi risposta con timestamp per calcolo bonus velocità
    game.playersAnswer.push({
      id: socket.id,
      answer: answerKey,
      points: convertTimeToPoint(game.roundStartTime, modeConfig.questionTime),
      timestamp: Date.now(), // Per calcolo bonus velocità preciso
      gameMode: gameMode
    })

    console.log(`🎯 Player ${player.username} answered ${answerKey} in mode ${gameMode}`)

    socket.emit("game:status", {
      name: "WAIT",
      data: {
        text: "Waiting for the players to answer",
        gameMode: gameMode,
        answeredAt: Date.now()
      },
    })

    socket.to(game.room).emit("game:playerAnswer", game.playersAnswer.length)

    // Verifica se tutti i giocatori attivi hanno risposto
    const activePlayers = game.players.filter(p =>
      !game.eliminatedPlayers || !game.eliminatedPlayers.includes(p.id)
    )

    if (game.playersAnswer.length === activePlayers.length) {
      console.log(`✅ All active players answered (${game.playersAnswer.length}/${activePlayers.length}), aborting cooldown`)
      abortCooldown(game, io, game.room)
    }
  },

  disconnect: (game, io, socket) => {
    const playerIndex = game.players.findIndex(player => player.id === socket.id)
    if (playerIndex !== -1) {
      const disconnectedPlayer = game.players[playerIndex]
      game.players.splice(playerIndex, 1)
      game.playersAnswer = game.playersAnswer.filter(answer => answer.id !== socket.id)
      if (game.room) {
        socket.to(game.room).emit("game:playerLeft", {
          playerId: socket.id,
          username: disconnectedPlayer.username,
          remainingPlayers: game.players.length
        })
      }
    }
  },
}

export default Player
