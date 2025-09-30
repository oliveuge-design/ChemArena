// API per gestire i quiz pubblici accessibili a tutti
import fs from 'fs'
import path from 'path'

const QUIZ_ARCHIVE_PATH = path.join(process.cwd(), 'data', 'quiz-archive.json')

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Leggi tutti i quiz dall'archivio
      const fileContent = fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8')
      const quizData = JSON.parse(fileContent)

      // Filtra solo i quiz pubblici
      const publicQuizzes = quizData.quizzes.filter(quiz => quiz.isPublic === true)

      console.log(`📚 Public Quiz API: Found ${publicQuizzes.length} public quizzes out of ${quizData.quizzes.length} total`)

      // Ritorna solo le informazioni essenziali (non le domande complete)
      const quizList = publicQuizzes.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        category: quiz.category || quiz.subject,
        questionCount: quiz.questions?.length || 0,
        difficulty: quiz.difficulty || 'media',
        created: quiz.created,
        author: quiz.author || 'ChemArena'
      }))

      res.status(200).json({
        success: true,
        quizzes: quizList
      })

    } catch (error) {
      console.error('❌ Error loading public quizzes:', error)
      res.status(500).json({
        success: false,
        error: 'Errore nel caricamento dei quiz pubblici'
      })
    }
  } else if (req.method === 'POST') {
    // Carica un quiz pubblico specifico con tutte le domande
    const { quizId } = req.body

    try {
      const fileContent = fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8')
      const quizData = JSON.parse(fileContent)

      const quiz = quizData.quizzes.find(q => q.id === quizId && q.isPublic === true)

      if (!quiz) {
        return res.status(404).json({
          success: false,
          error: 'Quiz non trovato o non pubblico'
        })
      }

      console.log(`📖 Loading public quiz: ${quiz.title} (${quiz.questions?.length} questions)`)

      res.status(200).json({
        success: true,
        quiz: quiz
      })

    } catch (error) {
      console.error('❌ Error loading quiz:', error)
      res.status(500).json({
        success: false,
        error: 'Errore nel caricamento del quiz'
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}