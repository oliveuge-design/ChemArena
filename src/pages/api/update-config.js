import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { quiz, settings } = req.body

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quiz data is required and must contain questions' 
      })
    }

    // Processa il quiz con le impostazioni
    let processedQuiz = { ...quiz }
    
    if (settings.shuffleQuestions) {
      processedQuiz.questions = [...processedQuiz.questions].sort(() => Math.random() - 0.5)
    }

    if (settings.shuffleAnswers) {
      processedQuiz.questions = processedQuiz.questions.map(question => {
        const correctAnswer = question.answers[question.solution]
        const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5)
        const newSolutionIndex = shuffledAnswers.indexOf(correctAnswer)
        
        return {
          ...question,
          answers: shuffledAnswers,
          solution: newSolutionIndex
        }
      })
    }

    // Genera il contenuto del file di configurazione
    const configContent = `export const WEBSOCKET_PUBLIC_URL = "http://localhost:5505/"
export const WEBSOCKET_SERVER_PORT = 5505

const QUIZZ_CONFIG = {
  password: "${settings.password || quiz.password}",
  subject: "${processedQuiz.subject}",
  questions: ${JSON.stringify(processedQuiz.questions, null, 4)},
  gameMode: "${settings.gameMode || 'standard'}",
  gameSettings: ${JSON.stringify(settings, null, 4)},
}

// DONT CHANGE
export const GAME_STATE_INIT = {
  started: false,
  players: [],
  playersAnswer: [],
  manager: null,
  room: null,
  currentQuestion: 0,
  roundStartTime: 0,
  eliminatedPlayers: [],
  bonusMultiplier: 1,
  currentAnswers: {},
  ...QUIZZ_CONFIG,
}
`

    // Percorso del file config.mjs
    const configPath = path.join(process.cwd(), 'config.mjs')
    
    // Backup del file esistente
    const backupPath = path.join(process.cwd(), 'config.mjs.backup')
    if (fs.existsSync(configPath)) {
      fs.copyFileSync(configPath, backupPath)
    }

    // Scrive il nuovo file di configurazione
    fs.writeFileSync(configPath, configContent, 'utf8')

    console.log('✅ File config.mjs aggiornato con successo')
    console.log(`📝 Quiz: ${processedQuiz.subject}`)
    console.log(`🔑 Quiz configuration updated with new password`)
    console.log(`🎮 Game Mode: ${settings.gameMode || 'standard'}`)
    console.log(`📊 Domande: ${processedQuiz.questions.length}`)

    res.status(200).json({ 
      success: true, 
      message: 'Configurazione aggiornata con successo',
      quiz: {
        subject: processedQuiz.subject,
        password: settings.password || quiz.password,
        questionsCount: processedQuiz.questions.length
      }
    })

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento del config:', error)
    
    res.status(500).json({ 
      success: false, 
      message: 'Errore durante l\'aggiornamento della configurazione',
      error: error.message 
    })
  }
}