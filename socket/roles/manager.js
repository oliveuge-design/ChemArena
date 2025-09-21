import { GAME_STATE_INIT } from "../../config.mjs"
import { abortCooldown, cooldown, sleep } from "../utils/cooldown.js"
import deepClone from "../utils/deepClone.js"
import generateRoomId from "../utils/generateRoomId.js"
import { startRound } from "../utils/round.js"

const Manager = {
  createRoom: (game, io, socket, data = {}) => {
    console.log(`🔍 LEGACY CreateRoom attempt by ${socket.id} - Current manager: ${game.manager}, Current room: ${game.room}`)

    // NOTA: Questo metodo è ora gestito dal MultiRoomManager nel socket/index.js
    // Mantenuto solo per backward compatibility temporanea

    console.log(`⚠️ WARNING: Using legacy createRoom method. Should use MultiRoomManager instead.`)

    if (game.manager || game.room) {
      console.log(`❌ Already manager error - manager: ${game.manager}, room: ${game.room}`)

      // GHOST MANAGER CLEANUP: Se il manager precedente non è più connesso, forza reset
      const managerSocket = io.sockets.sockets.get(game.manager)
      if (!managerSocket) {
        console.log(`🧹 Ghost manager detected (${game.manager} not connected), forcing cleanup...`)
        Object.assign(game, deepClone(GAME_STATE_INIT))

        // Re-apply global config after cleanup if available
        if (global.currentQuizConfig) {
          console.log('🔄 Applying global config after ghost cleanup')
          game.password = global.currentQuizConfig.password || 'CHEMARENA'
          game.subject = global.currentQuizConfig.subject || 'Quiz'
          game.questions = global.currentQuizConfig.questions || []
        }

        console.log(`✅ Ghost manager cleaned, proceeding with room creation`)
        // Procedi con la creazione normale
      } else {
        console.log(`⚠️ Manager ${game.manager} is still connected, cannot create new room`)
        io.to(socket.id).emit("game:errorMessage", "Already manager")
        return
      }
    }

    let roomInvite = generateRoomId()
    game.room = roomInvite
    game.manager = socket.id

    if (data.teacherId) {
      game.teacherId = data.teacherId
    }

    // FORCE SYNC: Re-apply global config if available on room creation
    if (global.currentQuizConfig) {
      console.log('🔄 Re-syncing gameState with global config on room creation')
      game.password = global.currentQuizConfig.password || 'CHEMARENA'
      game.subject = global.currentQuizConfig.subject || 'Quiz'
      game.questions = global.currentQuizConfig.questions || []
      console.log('✅ Room quiz synced:', {
        subject: game.subject,
        questions: game.questions?.length || 0
      })
    }

    socket.join(roomInvite)
    io.to(socket.id).emit("manager:inviteCode", roomInvite)

    console.log("New room created: " + roomInvite + (data.teacherId ? ` by teacher ${data.teacherId}` : ""))
  },

  kickPlayer: (game, io, socket, playerId) => {
    if (game.manager !== socket.id) {
      return
    }

    const player = game.players.find((p) => p.id === playerId)
    game.players = game.players.filter((p) => p.id !== playerId)

    io.in(playerId).socketsLeave(game.room)
    io.to(player.id).emit("game:kick")
    io.to(game.manager).emit("manager:playerKicked", player.id)
  },

  startGame: async (game, io, socket, multiRoomManager = null) => {
    if (game.started || !game.room) {
      return
    }

    // DEBUG: Log current quiz configuration at game start
    console.log('🎮 GAME START - Current quiz configuration:', {
      subject: game.subject,
      password: game.password,
      questions: game.questions?.length || 0,
      firstQuestion: game.questions?.[0]?.question?.substring(0, 50) + '...' || 'No questions',
      globalConfig: global.currentQuizConfig ? {
        subject: global.currentQuizConfig.subject,
        questions: global.currentQuizConfig.questions?.length || 0
      } : 'Not set'
    })

    game.started = true
    game.gameStartTime = Date.now() // Registra l'inizio del gioco

    io.to(game.room).emit("game:status", {
      name: "SHOW_START",
      data: {
        time: 3,
        subject: game.subject,
      },
    })

    await sleep(3)
    io.to(game.room).emit("game:startCooldown")

    await cooldown(3, io, game.room)
    startRound(game, io, socket, multiRoomManager)
  },

  nextQuestion: (game, io, socket, multiRoomManager = null) => {
    if (!game.started) {
      return
    }

    if (socket.id !== game.manager) {
      return
    }

    if (!game.questions[game.currentQuestion + 1]) {
      return
    }

    game.currentQuestion++
    startRound(game, io, socket, multiRoomManager)
  },

  abortQuiz: (game, io, socket) => {
    if (!game.started) {
      return
    }

    if (socket.id !== game.manager) {
      return
    }

    abortCooldown(game, io, game.room)
  },

  resetGame: (game, io, socket) => {
    if (socket.id !== game.manager) {
      console.log(`⚠️ Reset attempt by non-manager ${socket.id} - Current manager: ${game.manager}`)
      return
    }

    // Reset completo del game state
    io.to(game.room).emit("game:reset")
    Object.assign(game, deepClone(GAME_STATE_INIT))
    console.log(`🔄 Game reset by manager ${socket.id}`)
  },

  forceReset: (game, io, socket) => {
    // Reset forzato per situazioni di emergenza - solo per debug
    console.log(`🚨 Force reset by ${socket.id} - Previous manager: ${game.manager}, Previous room: ${game.room}`)
    if (game.room) {
      io.to(game.room).emit("game:reset")
    }
    Object.assign(game, deepClone(GAME_STATE_INIT))
    console.log(`✅ Force reset completed - New state: manager=${game.manager}, room=${game.room}`)
  },

  showLeaderboard: async (game, io, socket) => {
    if (!game.questions[game.currentQuestion + 1]) {
      // Salva statistiche prima di finire il gioco
      const gameEndTime = Date.now()
      const gameStats = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        quizSubject: game.subject,
        teacherId: game.teacherId || null,
        duration: gameEndTime - (game.gameStartTime || gameEndTime),
        questionsCount: game.questions.length,
        players: game.players.map(player => ({
          id: player.id || Date.now() + Math.random(),
          name: player.username || player.name || 'Anonimo',
          score: player.points || 0
        })),
        maxScore: game.questions.length * 1000,
        questionStats: game.questions.map((question, index) => {
          const totalAnswers = game.playersAnswer.filter(a => a.questionIndex === index).length
          const correctAnswers = game.playersAnswer.filter(a =>
            a.questionIndex === index && a.answerKey === question.solution
          ).length

          return {
            questionIndex: index,
            question: question.question,
            correct: correctAnswers,
            total: totalAnswers,
            percentage: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0
          }
        })
      }

      // Salva statistiche per studenti registrati
      await Manager.saveStudentStatistics(game)

      // Invia evento speciale per salvare le statistiche lato client
      socket.emit("game:saveStats", gameStats)
      
      // SOLUZIONE SEMPLICE per classifica finale: Usa Map
      const finishMap = new Map()
      game.players.forEach(player => {
        const existing = finishMap.get(player.username)
        if (!existing || (player.points || 0) > (existing.points || 0)) {
          finishMap.set(player.username, player) // Player ORIGINALE
        }
      })
      const uniquePlayersFinish = Array.from(finishMap.values())

      socket.emit("game:status", {
        name: "FINISH",
        data: {
          subject: game.subject,
          top: uniquePlayersFinish.sort((a, b) => b.points - a.points).slice(0, 3),
        },
      })

      // Reset del game state - modifica direttamente l'oggetto game
      Object.assign(game, deepClone(GAME_STATE_INIT))
      return
    }

    // SOLUZIONE SEMPLICE: Usa Map per deduplicare mantenendo i riferimenti originali
    const playerMap = new Map()

    // Aggiungi ogni player, mantenendo quello con il punteggio più alto per username
    game.players.forEach(player => {
      const existing = playerMap.get(player.username)
      if (!existing || (player.points || 0) > (existing.points || 0)) {
        playerMap.set(player.username, player) // Usa il player ORIGINALE
        console.log(`🏆 Player: ${player.username} = ${player.points || 0} punti`)
      }
    })

    const uniquePlayers = Array.from(playerMap.values())
    console.log(`🏆 Final leaderboard: ${uniquePlayers.length} unique players from ${game.players.length} total`)

    socket.emit("game:status", {
      name: "SHOW_LEADERBOARD",
      data: {
        leaderboard: uniquePlayers
          .sort((a, b) => b.points - a.points)
          .slice(0, 5),
      },
    })
  },

  saveStudentStatistics: async (game) => {
    try {
      console.log('📊 Saving statistics with enhanced tracking system...')

      // Calcola posizioni finali per tutti i player
      const sortedPlayers = [...game.players].sort((a, b) => (b.points || 0) - (a.points || 0))
      const playerPositions = new Map()
      sortedPlayers.forEach((player, index) => {
        playerPositions.set(player.id || player.username, index + 1)
      })

      // Prepara dati completi del gioco per l'API statistiche enhanced
      const enhancedGameResult = {
        quizId: game.quizId || null,
        quizTitle: game.quizTitle || game.subject,
        subject: game.subject,
        difficulty: game.difficulty || "media",
        totalQuestions: game.questions.length,
        gameMode: game.gameMode || "standard",
        timeLimit: game.timeLimit || null,

        // Informazioni sessione
        teacherId: game.teacherId || null,
        classId: game.classId || null,
        sessionDuration: Date.now() - (game.gameStartTime || Date.now()),
        totalPlayers: game.players.length,
        completedPlayers: game.players.filter(p => p.finished || p.completed).length,

        // Player results con statistiche dettagliate
        players: game.players.map(player => {
          const playerAnswers = game.playersAnswer.filter(answer => answer.id === player.id)
          const correctAnswers = playerAnswers.filter(answer => {
            const question = game.questions[answer.questionIndex || game.currentQuestion]
            return question && answer.answerKey === question.solution
          }).length

          return {
            studentId: player.studentId || null,
            nickname: player.username || player.name || 'Anonimo',
            fullName: player.fullName || player.username || 'Anonimo',
            score: player.points || 0,
            correctAnswers: correctAnswers,
            totalAnswers: playerAnswers.length,
            accuracy: playerAnswers.length > 0 ? (correctAnswers / playerAnswers.length) * 100 : 0,
            position: playerPositions.get(player.id || player.username) || null,
            timeSpent: Date.now() - (player.joinTime || game.gameStartTime || Date.now()),
            isRegistered: player.isRegistered || false,
            className: player.className || null,
            answers: playerAnswers.map(answer => ({
              questionIndex: answer.questionIndex || game.currentQuestion,
              answerKey: answer.answerKey,
              isCorrect: (() => {
                const question = game.questions[answer.questionIndex || game.currentQuestion]
                return question && answer.answerKey === question.solution
              })(),
              timeToAnswer: answer.timeToAnswer || null
            }))
          }
        }),

        // Statistiche per domanda
        questionsStats: game.questions.map((question, index) => {
          const totalAnswers = game.playersAnswer.filter(a => a.questionIndex === index).length
          const correctAnswers = game.playersAnswer.filter(a =>
            a.questionIndex === index && a.answerKey === question.solution
          ).length

          return {
            questionIndex: index,
            question: question.question,
            correctAnswer: question.solution,
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0,
            difficulty: question.difficulty || "media",
            timeSpent: null // Calcolabile in future versioni
          }
        })
      }

      console.log(`📊 Enhanced game result prepared:`, {
        quizTitle: enhancedGameResult.quizTitle,
        totalPlayers: enhancedGameResult.totalPlayers,
        registeredPlayers: enhancedGameResult.players.filter(p => p.isRegistered).length,
        averageScore: enhancedGameResult.players.reduce((sum, p) => sum + p.score, 0) / enhancedGameResult.players.length
      })

      // Chiama la nuova API per salvare i risultati completi
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/quiz-statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'saveGameResult',
          gameResult: enhancedGameResult
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.success) {
        console.log(`✅ Enhanced game statistics saved successfully. Game ID: ${result.gameId}`)

        // Log registrazione studenti
        const registeredCount = enhancedGameResult.players.filter(p => p.isRegistered).length
        if (registeredCount > 0) {
          console.log(`📊 Statistics updated for ${registeredCount} registered students`)
        }
      } else {
        console.error(`❌ Failed to save enhanced game statistics:`, result.error)
      }

      console.log('📊 Enhanced statistics saving completed')

    } catch (error) {
      console.error('❌ Error in enhanced saveStudentStatistics:', error)

      // Fallback al sistema precedente in caso di errore
      console.log('🔄 Attempting fallback to legacy statistics system...')
      try {
        await Manager.legacySaveStudentStatistics(game)
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError)
      }
    }
  },

  // Mantieni il sistema legacy come fallback
  legacySaveStudentStatistics: async (game) => {
    try {
      console.log('📊 Using legacy statistics system...')

      const registeredPlayers = game.players.filter(player => player.isRegistered && player.studentId)

      if (registeredPlayers.length === 0) {
        console.log('📊 No registered students found in this game')
        return
      }

      console.log(`📊 Found ${registeredPlayers.length} registered students to save legacy statistics for`)

      for (const player of registeredPlayers) {
        try {
          // Calcola statistiche del player
          const playerAnswers = game.playersAnswer.filter(answer => answer.id === player.id)
          const correctAnswers = playerAnswers.filter(answer => {
            const question = game.questions[answer.questionIndex || game.currentQuestion]
            return question && answer.answerKey === question.solution
          }).length

          const totalQuestions = game.questions.length
          const averageScore = totalQuestions > 0 ? Math.round((player.points / (totalQuestions * 1000)) * 100) : 0

          const gameData = {
            gameId: `legacy_game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            teacherId: game.teacherId || null,
            className: player.className || null,
            date: new Date().toISOString(),
            gameStartTime: game.gameStartTime ? new Date(game.gameStartTime).toISOString() : new Date().toISOString(),
            quizSubject: game.subject,
            quizTitle: game.quizTitle || game.subject,
            score: player.points || 0,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            averageScore: averageScore,
            position: null,
            duration: Date.now() - (game.gameStartTime || Date.now()),
            responseTime: null
          }

          // Chiama API legacy per salvare le statistiche
          const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/students`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'update-statistics',
              studentId: player.studentId,
              gameData: gameData
            })
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              console.log(`✅ Legacy statistics saved for student ${player.username}`)
            }
          }

        } catch (error) {
          console.error(`❌ Error saving legacy statistics for student ${player.username}:`, error)
        }
      }

    } catch (error) {
      console.error('❌ Error in legacySaveStudentStatistics:', error)
    }
  },
}

export default Manager
