// Script per marcare quiz come pubblici
const fs = require('fs')
const path = require('path')

const QUIZ_ARCHIVE_PATH = path.join(__dirname, '..', 'data', 'quiz-archive.json')

// ID dei quiz da marcare come pubblici
const PUBLIC_QUIZ_IDS = [
  'quiz_1',  // Geografia Mondiale
  'quiz_2',  // Storia dell'Arte
  'quiz_6'   // Cultura Generale
]

try {
  // Leggi il file
  const fileContent = fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8')
  const quizData = JSON.parse(fileContent)

  console.log(`📚 Total quizzes: ${quizData.quizzes.length}`)

  // Marca i quiz selezionati come pubblici
  let markedCount = 0
  quizData.quizzes.forEach(quiz => {
    if (PUBLIC_QUIZ_IDS.includes(quiz.id)) {
      quiz.isPublic = true
      markedCount++
      console.log(`✅ Marked as public: ${quiz.title} (${quiz.id})`)
    } else if (!quiz.isPublic) {
      quiz.isPublic = false // Assicurati che gli altri siano false
    }
  })

  // Backup prima di salvare
  const backupPath = path.join(__dirname, '..', 'data', 'backups', `quiz-archive-backup_${Date.now()}.json`)
  fs.writeFileSync(backupPath, fileContent, 'utf8')
  console.log(`💾 Backup saved: ${backupPath}`)

  // Salva il file aggiornato
  fs.writeFileSync(QUIZ_ARCHIVE_PATH, JSON.stringify(quizData, null, 2), 'utf8')
  console.log(`\n✅ Successfully marked ${markedCount} quizzes as public!`)
  console.log(`📖 Public quizzes are now accessible at /quiz-libero`)

} catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}