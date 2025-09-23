import { cooldown, sleep } from "./cooldown.js"
import QuizModeEngine from "./QuizModeEngine.js"

export const startRound = async (game, io, socket, multiRoomManager = null) => {
  const question = game.questions[game.currentQuestion]
  const gameMode = game.gameMode || 'standard'
  const modeConfig = QuizModeEngine.getModeConfig(gameMode, question, game.gameSettings)

  console.log(`🔍 StartRound: questionIndex=${game.currentQuestion}, started=${game.started}, room=${game.room}, mode=${gameMode}`)
  console.log(`🎮 MODE CONFIG: ${JSON.stringify(modeConfig)} - Timer: ${modeConfig.questionTime}s`)

  // Funzione helper per verificare se la room esiste ancora
  const isRoomValid = () => {
    if (!game.started || !game.room) {
      return false;
    }
    // Se multiRoomManager è disponibile, verifica l'esistenza della room
    if (multiRoomManager && !multiRoomManager.getRoomState(game.room)) {
      console.log(`❌ Room ${game.room} no longer exists in multiRoomManager`)
      return false;
    }
    return true;
  }

  if (!isRoomValid()) {
    console.log(`❌ StartRound aborted: game not started, no room, or room removed`)
    return
  }

  io.to(game.room).emit("game:updateQuestion", {
    current: game.currentQuestion + 1,
    total: game.questions.length,
  })

  io.to(game.room).emit("game:status", {
    name: "SHOW_PREPARED",
    data: {
      totalAnswers: game.questions[game.currentQuestion].answers.length,
      questionNumber: game.currentQuestion + 1,
      gameMode: gameMode,
      modeMessage: QuizModeEngine.getModeStatusMessage(gameMode, game)
    },
  })

  await sleep(2)
  console.log(`🔍 After first sleep, game.started=${game.started}, room=${game.room}`)

  if (!isRoomValid()) {
    console.log(`❌ StartRound aborted after first sleep: room no longer valid`)
    return
  }

  io.to(game.room).emit("game:status", {
    name: "SHOW_QUESTION",
    data: {
      question: question.question,
      image: question.image,
      cooldown: question.cooldown,
      gameMode: gameMode,
    },
  })

  await sleep(question.cooldown)
  console.log(`🔍 After cooldown sleep, game.started=${game.started}, room=${game.room}`)

  if (!isRoomValid()) {
    console.log(`❌ StartRound aborted after cooldown: room no longer valid`)
    return
  }

  game.roundStartTime = Date.now()

  // Gestione speciale per modalità "Risposte a Comparsa"
  if (gameMode === 'appearing') {
    console.log(`✨ Starting appearing answers mode for question ${game.currentQuestion + 1}`)
    await QuizModeEngine.handleAppearingAnswers(game, io, question)
  } else {
    // Modalità standard o altre
    io.to(game.room).emit("game:status", {
      name: "SELECT_ANSWER",
      data: {
        question: question.question,
        answers: question.answers,
        image: question.image,
        time: modeConfig.questionTime, // Usa il tempo della modalità
        totalPlayer: game.players.length,
        gameMode: gameMode,
        modeConfig: modeConfig
      },
    })
  }

  console.log(`🔍 Starting question cooldown for ${modeConfig.questionTime} seconds (mode: ${gameMode})...`)
  await cooldown(modeConfig.questionTime, io, game.room)
  console.log(`🔍 After question cooldown, game.started=${game.started}, room=${game.room}`)

  if (!isRoomValid()) {
    console.log(`❌ StartRound aborted after question timeout: room no longer valid`)
    return
  }

  game.players.map(async (player) => {
    // Verifica se il giocatore può ancora partecipare (modalità sopravvivenza)
    if (!QuizModeEngine.canPlayerAnswer(game, player.id)) {
      return // Salta giocatori eliminati
    }

    let playerAnswer = await game.playersAnswer.find((p) => p.id === player.id)

    let isCorrect = playerAnswer
      ? playerAnswer.answer === question.solution
      : false

    // Calcola punteggio con il sistema delle modalità
    let basePoints = (isCorrect && Math.round(playerAnswer && playerAnswer.points)) || 0
    let answerTime = playerAnswer ? (playerAnswer.timestamp - game.roundStartTime) / 1000 : modeConfig.questionTime
    let playerLives = game.playerLives ? game.playerLives[player.id] : null

    let points = QuizModeEngine.calculateScore(
      gameMode,
      basePoints,
      answerTime,
      modeConfig.questionTime,
      isCorrect,
      playerLives
    )

    // Gestisci eliminazione in modalità sopravvivenza
    let survivalResult = { eliminated: false, livesRemaining: null }
    if (gameMode === 'survival') {
      survivalResult = QuizModeEngine.handleSurvivalElimination(game, player.id, isCorrect)
    }

    if (!survivalResult.eliminated) {
      player.points += points
    }

    let sortPlayers = game.players
      .filter(p => !game.eliminatedPlayers || !game.eliminatedPlayers.includes(p.id))
      .sort((a, b) => b.points - a.points)

    let rank = sortPlayers.findIndex((p) => p.id === player.id) + 1
    let aheadPlayer = sortPlayers[rank - 2]

    let resultMessage = isCorrect ? "Nice !" : "Too bad"
    if (survivalResult.eliminated) {
      resultMessage = "💀 Eliminato!"
    } else if (gameMode === 'survival' && survivalResult.livesRemaining !== null) {
      resultMessage += ` (Vite: ${survivalResult.livesRemaining})`
    }

    io.to(player.id).emit("game:status", {
      name: "SHOW_RESULT",
      data: {
        correct: isCorrect,
        message: resultMessage,
        points: points,
        myPoints: player.points,
        rank: survivalResult.eliminated ? 'ELIMINATO' : rank,
        aheadOfMe: aheadPlayer ? aheadPlayer.username : null,
        gameMode: gameMode,
        eliminated: survivalResult.eliminated,
        livesRemaining: survivalResult.livesRemaining,
        speedBonus: points > basePoints ? points - basePoints : 0
      },
    })
  })

  let totalType = {}

  game.playersAnswer.forEach(({ answer }) => {
    totalType[answer] = (totalType[answer] || 0) + 1
  })

  // Manager - Invia statistiche aggiornate con informazioni modalità
  const activePlayers = game.players.filter(p =>
    !game.eliminatedPlayers || !game.eliminatedPlayers.includes(p.id)
  )

  io.to(game.manager).emit("game:status", {
    name: "SHOW_RESPONSES",
    data: {
      question: game.questions[game.currentQuestion].question,
      responses: totalType,
      correct: game.questions[game.currentQuestion].solution,
      answers: game.questions[game.currentQuestion].answers,
      image: game.questions[game.currentQuestion].image,
      gameMode: gameMode,
      modeConfig: modeConfig,
      activePlayers: activePlayers.length,
      totalPlayers: game.players.length,
      eliminatedPlayers: game.eliminatedPlayers ? game.eliminatedPlayers.length : 0,
      canGameContinue: QuizModeEngine.canGameContinue(game)
    },
  })

  game.playersAnswer = []

  // AUTO-AVANZAMENTO: Se abilitato, passa automaticamente alla domanda successiva
  if (game.gameSettings && game.gameSettings.autoAdvance) {
    console.log(`⏩ Auto-advance abilitato, passando alla domanda successiva in 3 secondi...`)

    setTimeout(async () => {
      // Verifica che la room sia ancora valida
      if (!multiRoomManager || !multiRoomManager.getRoomState(game.room)) {
        console.log(`❌ Auto-advance aborted: room ${game.room} no longer exists`)
        return
      }

      const currentGame = multiRoomManager.getRoomState(game.room)
      if (!currentGame || !currentGame.started) {
        console.log(`❌ Auto-advance aborted: game not started`)
        return
      }

      // Controlla se ci sono altre domande
      if (currentGame.currentQuestion + 1 < currentGame.questions.length) {
        console.log(`⏩ Auto-advance: Avanzando dalla domanda ${currentGame.currentQuestion + 1} alla ${currentGame.currentQuestion + 2}`)

        // Avanza alla domanda successiva
        currentGame.currentQuestion++

        // Avvia automaticamente il prossimo round
        const { startRound } = await import('./round.js')
        await startRound(currentGame, io, socket, multiRoomManager)
      } else {
        console.log(`🏁 Auto-advance: Quiz completato, non ci sono altre domande`)

        // Fine del quiz - mostra risultati finali
        io.to(currentGame.room).emit("game:status", {
          name: "END",
          data: {
            leaderboard: currentGame.players
              .filter(p => !currentGame.eliminatedPlayers || !currentGame.eliminatedPlayers.includes(p.id))
              .sort((a, b) => b.points - a.points),
            gameMode: currentGame.gameMode || 'standard'
          }
        })
      }
    }, 3000) // 3 secondi di pausa prima dell'auto-advance
  }
}
