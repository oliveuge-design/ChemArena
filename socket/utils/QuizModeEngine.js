/**
 * ChemArena - Quiz Mode Engine
 *
 * Sistema modulare per gestire le 6 modalità di quiz:
 * - 📝 Standard: Modalità tradizionale
 * - 🏃 Inseguimento: Domande a inseguimento veloce (timer accelerato)
 * - ✨ Risposte a Comparsa: Opzioni appaiono gradualmente
 * - ⏱️ Quiz a Tempo: Tempo limitato per domanda
 * - 🎯 Senza Tempo: Bonus velocità senza limite
 * - 💀 Sopravvivenza: Eliminazione per errori
 */

import { sleep } from "./cooldown.js"

const QuizModeEngine = {
  /**
   * Ottiene la configurazione per una modalità specifica
   */
  getModeConfig(gameMode, question = null, gameSettings = {}) {
    const configs = {
      standard: {
        name: "Standard",
        icon: "📝",
        description: "Modalità tradizionale con timing normale",
        questionTime: question?.time || 15,
        showAnswersDelay: 0,
        allowLateAnswers: true,
        eliminateOnWrongAnswer: false,
        speedBonus: false,
        timerMultiplier: 1.0
      },

      chase: {
        name: "Inseguimento",
        icon: "🏃",
        description: "Timer accelerato per aumentare la pressione",
        questionTime: Math.max(5, Math.round((question?.time || 15) * 0.6)), // 60% del tempo normale, min 5s
        showAnswersDelay: 0,
        allowLateAnswers: false,
        eliminateOnWrongAnswer: false,
        speedBonus: true,
        timerMultiplier: 0.6,
        pressureMode: true
      },

      appearing: {
        name: "Risposte a Comparsa",
        icon: "✨",
        description: "Le opzioni di risposta appaiono gradualmente",
        questionTime: (question?.time || 15) + 3, // Tempo extra per la comparsa
        showAnswersDelay: 2, // Inizia a mostrare dopo 2s
        answerRevealInterval: 1.5, // Mostra una risposta ogni 1.5s
        allowLateAnswers: true,
        eliminateOnWrongAnswer: false,
        speedBonus: false,
        timerMultiplier: 1.0,
        progressiveReveal: true
      },

      timed: {
        name: "Quiz a Tempo",
        icon: "⏱️",
        description: "Tempo limitato specifico per ogni domanda",
        questionTime: gameSettings.customTime || 10, // Tempo fisso configurabile
        showAnswersDelay: 0,
        allowLateAnswers: false,
        eliminateOnWrongAnswer: false,
        speedBonus: true,
        timerMultiplier: 1.0,
        strictTiming: true
      },

      untimed: {
        name: "Senza Tempo",
        icon: "🎯",
        description: "Nessun limite di tempo, bonus per velocità",
        questionTime: 300, // 5 minuti max (praticamente illimitato)
        showAnswersDelay: 0,
        allowLateAnswers: true,
        eliminateOnWrongAnswer: false,
        speedBonus: true,
        timerMultiplier: 1.0,
        noTimeLimit: true,
        maxSpeedBonus: 500 // Bonus massimo per risposte veloci
      },

      survival: {
        name: "Sopravvivenza",
        icon: "💀",
        description: "Eliminazione progressiva per risposte sbagliate",
        questionTime: question?.time || 15,
        showAnswersDelay: 0,
        allowLateAnswers: false,
        eliminateOnWrongAnswer: true,
        speedBonus: false,
        timerMultiplier: 1.0,
        survivalMode: true,
        livesSystem: gameSettings.lives || 1 // Numero di vite (default 1 = eliminazione immediata)
      }
    }

    return configs[gameMode] || configs.standard
  },

  /**
   * Calcola il punteggio basato sulla modalità e performance
   */
  calculateScore(gameMode, baseScore, answerTime, questionTime, isCorrect, playerLives = null) {
    const config = this.getModeConfig(gameMode)

    if (!isCorrect) {
      return 0 // Nessun punteggio per risposte sbagliate
    }

    let finalScore = baseScore

    // Bonus velocità per modalità che lo supportano
    if (config.speedBonus) {
      const speedRatio = Math.max(0, (questionTime - answerTime) / questionTime)

      if (gameMode === 'untimed') {
        // Bonus speciale per modalità senza tempo
        const speedBonus = Math.min(config.maxSpeedBonus, Math.round(speedRatio * 1000))
        finalScore += speedBonus
      } else if (gameMode === 'chase') {
        // Bonus extra per modalità inseguimento
        const chaseBonus = Math.round(speedRatio * baseScore * 0.5)
        finalScore += chaseBonus
      } else {
        // Bonus standard
        const speedBonus = Math.round(speedRatio * baseScore * 0.3)
        finalScore += speedBonus
      }
    }

    // Moltiplicatori speciali per modalità sopravvivenza
    if (gameMode === 'survival' && playerLives !== null) {
      const survivalMultiplier = 1 + (playerLives * 0.1) // 10% bonus per vita rimanente
      finalScore = Math.round(finalScore * survivalMultiplier)
    }

    return Math.max(0, finalScore)
  },

  /**
   * Gestisce l'eliminazione in modalità sopravvivenza
   */
  handleSurvivalElimination(game, playerId, isCorrect) {
    if (game.gameMode !== 'survival' || isCorrect) {
      return { eliminated: false, livesRemaining: null }
    }

    // Inizializza le vite del giocatore se non esistono
    if (!game.playerLives) {
      game.playerLives = {}
    }

    const config = this.getModeConfig('survival', null, game.gameSettings)

    if (!game.playerLives[playerId]) {
      game.playerLives[playerId] = config.livesSystem
    }

    // Rimuovi una vita
    game.playerLives[playerId]--

    const eliminated = game.playerLives[playerId] <= 0

    if (eliminated) {
      // Aggiungi alla lista eliminati
      if (!game.eliminatedPlayers) {
        game.eliminatedPlayers = []
      }

      if (!game.eliminatedPlayers.includes(playerId)) {
        game.eliminatedPlayers.push(playerId)
      }

      // Rimuovi dalle risposte future
      game.players = game.players.filter(p => p.id !== playerId)
    }

    return {
      eliminated,
      livesRemaining: game.playerLives[playerId]
    }
  },

  /**
   * Gestisce la logica di timing per la modalità "Risposte a Comparsa"
   */
  async handleAppearingAnswers(game, io, question) {
    const config = this.getModeConfig('appearing', question, game.gameSettings)

    if (!config.progressiveReveal) {
      return // Non applicable per altre modalità
    }

    // Invia la domanda senza risposte
    io.to(game.room).emit("game:status", {
      name: "SHOW_QUESTION",
      data: {
        question: question.question,
        answers: [], // Nessuna risposta inizialmente
        image: question.image,
        totalAnswers: question.answers.length,
        questionNumber: game.currentQuestion + 1,
        mode: 'appearing',
        revealDelay: config.answerRevealInterval
      }
    })

    // Aspetta il delay iniziale
    await sleep(config.showAnswersDelay)

    // Rivela le risposte una alla volta
    for (let i = 0; i < question.answers.length; i++) {
      const revealedAnswers = question.answers.slice(0, i + 1)

      io.to(game.room).emit("game:revealAnswer", {
        answerIndex: i,
        answer: question.answers[i],
        revealedAnswers: revealedAnswers,
        totalAnswers: question.answers.length
      })

      // Aspetta prima di rivelare la prossima (tranne per l'ultima)
      if (i < question.answers.length - 1) {
        await sleep(config.answerRevealInterval)
      }
    }

    // Tutte le risposte rivelate, invia l'evento di completamento
    io.to(game.room).emit("game:allAnswersRevealed", {
      answers: question.answers,
      questionTime: config.questionTime
    })

    // 🔧 FIX: Dopo reveal, invia SELECT_ANSWER per far scegliere agli studenti
    console.log(`✅ All answers revealed, sending SELECT_ANSWER...`)
    io.to(game.room).emit("game:status", {
      name: "SELECT_ANSWER",
      data: {
        question: question.question,
        answers: question.answers,
        image: question.image,
        time: config.questionTime,
        totalPlayer: game.players.length,
        gameMode: 'appearing',
        modeConfig: config,
        backgroundTheme: game.gameSettings?.backgroundTheme || 'gaming1'
      },
    })
  },

  /**
   * Verifica se un giocatore può ancora rispondere
   */
  canPlayerAnswer(game, playerId) {
    // Verifica se eliminato in modalità sopravvivenza
    if (game.gameMode === 'survival' && game.eliminatedPlayers && game.eliminatedPlayers.includes(playerId)) {
      return false
    }

    // Verifica altre condizioni...
    return true
  },

  /**
   * Ottiene il messaggio di stato per la modalità corrente
   */
  getModeStatusMessage(gameMode, gameState = {}) {
    const config = this.getModeConfig(gameMode)
    const { eliminatedPlayers = [], players = [] } = gameState

    switch (gameMode) {
      case 'chase':
        return `${config.icon} MODALITÀ INSEGUIMENTO - Timer accelerato!`

      case 'appearing':
        return `${config.icon} RISPOSTE A COMPARSA - Le opzioni appariranno gradualmente...`

      case 'survival':
        const remaining = players.length - eliminatedPlayers.length
        return `${config.icon} SOPRAVVIVENZA - ${remaining} giocatori rimasti`

      case 'timed':
        return `${config.icon} QUIZ A TEMPO - Tempo limitato per ogni domanda!`

      case 'untimed':
        return `${config.icon} SENZA TEMPO - Bonus per velocità, nessun limite!`

      default:
        return `${config.icon} MODALITÀ STANDARD`
    }
  },

  /**
   * Verifica se il gioco può continuare (per modalità sopravvivenza)
   */
  canGameContinue(game) {
    if (game.gameMode === 'survival') {
      const activePlayers = game.players.filter(p =>
        !game.eliminatedPlayers || !game.eliminatedPlayers.includes(p.id)
      )

      return activePlayers.length > 1 // Almeno 2 giocatori per continuare
    }

    return true // Altre modalità continuano sempre
  }
}

export default QuizModeEngine