/**
 * Script di Migrazione Categorie Quiz
 *
 * Questo script categorizza automaticamente i quiz esistenti
 * basandosi su subject e title utilizzando l'algoritmo di auto-categorizzazione.
 */

const fs = require('fs');
const path = require('path');

// Configurazione categorie (copiato da constants/categories.js)
const QUIZ_CATEGORIES = {
  "scienze": {
    label: "🧪 Scienze",
    color: "bg-green-100 text-green-800",
    subcategories: {
      "chimica": {
        label: "Chimica",
        color: "bg-green-200 text-green-900",
        keywords: ["chimica", "analitica", "organica", "ammoniaca", "idrogeno", "titolazioni"]
      },
      "medicina": {
        label: "Medicina",
        color: "bg-red-200 text-red-900",
        keywords: ["medicina", "anatomia", "farmacologia", "test accesso"]
      },
      "fisica": {
        label: "Fisica",
        color: "bg-blue-200 text-blue-900",
        keywords: ["fisica", "meccanica", "termodinamica", "elettromagnetismo"]
      },
      "biologia": {
        label: "Biologia",
        color: "bg-emerald-200 text-emerald-900",
        keywords: ["biologia", "cellula", "genetica", "evoluzione"]
      }
    }
  },
  "tecnologia": {
    label: "💻 Tecnologia",
    color: "bg-blue-100 text-blue-800",
    subcategories: {
      "informatica": {
        label: "Informatica",
        color: "bg-blue-200 text-blue-900",
        keywords: ["informatica", "programmazione", "algoritmi", "database"]
      },
      "elettronica": {
        label: "Elettronica",
        color: "bg-purple-200 text-purple-900",
        keywords: ["elettronica", "arduino", "circuiti", "microcontrollori"]
      },
      "web": {
        label: "Sviluppo Web",
        color: "bg-indigo-200 text-indigo-900",
        keywords: ["web", "html", "css", "javascript", "react", "node"]
      }
    }
  },
  "cultura": {
    label: "🎓 Cultura Generale",
    color: "bg-yellow-100 text-yellow-800",
    subcategories: {
      "geografia": {
        label: "Geografia",
        color: "bg-yellow-200 text-yellow-900",
        keywords: ["geografia", "mondiale", "italiana", "europea", "capitale", "fiume"]
      },
      "arte": {
        label: "Arte",
        color: "bg-pink-200 text-pink-900",
        keywords: ["arte", "storia dell'arte", "artisti", "correnti", "pittura"]
      },
      "sport": {
        label: "Sport",
        color: "bg-orange-200 text-orange-900",
        keywords: ["sport", "calcio", "olimpiadi", "atletica", "tennis"]
      },
      "storia": {
        label: "Storia",
        color: "bg-amber-200 text-amber-900",
        keywords: ["storia", "antica", "medievale", "moderna", "contemporanea"]
      },
      "letteratura": {
        label: "Letteratura",
        color: "bg-rose-200 text-rose-900",
        keywords: ["letteratura", "scrittori", "poesia", "romanzi", "teatro"]
      }
    }
  },
  "test": {
    label: "🧪 Test e Debug",
    color: "bg-gray-100 text-gray-800",
    subcategories: {
      "sistema": {
        label: "Test Sistema",
        color: "bg-gray-200 text-gray-900",
        keywords: ["test", "debug", "prova", "sperimentale", "aaaa", "dddd", "piolo"]
      },
      "demo": {
        label: "Demo",
        color: "bg-gray-300 text-gray-900",
        keywords: ["demo", "esempio", "campione"]
      }
    }
  }
}

// Funzione per auto-categorizzare un quiz
function autoCategorizateQuiz(quiz) {
  const searchText = `${quiz.subject} ${quiz.title}`.toLowerCase()

  for (const [categoryKey, category] of Object.entries(QUIZ_CATEGORIES)) {
    for (const [subcategoryKey, subcategory] of Object.entries(category.subcategories)) {
      if (subcategory.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return {
          category: categoryKey,
          subcategory: subcategoryKey,
          confidence: 'auto'
        }
      }
    }
  }

  // Fallback alla categoria cultura
  return {
    category: 'cultura',
    subcategory: 'generale',
    confidence: 'fallback'
  }
}

// Percorsi file
const QUIZ_ARCHIVE_PATH = path.join(__dirname, '..', 'data', 'quiz-archive.json')
const BACKUP_PATH = path.join(__dirname, '..', 'data', 'backups', `migration-backup-${Date.now()}.json`)

async function runMigration() {
  console.log('🚀 Iniziando migrazione categorie quiz...')

  try {
    // 1. Leggi archivio esistente
    if (!fs.existsSync(QUIZ_ARCHIVE_PATH)) {
      console.error('❌ File quiz-archive.json non trovato!')
      return
    }

    const archiveData = JSON.parse(fs.readFileSync(QUIZ_ARCHIVE_PATH, 'utf8'))
    console.log(`📚 Trovati ${archiveData.quizzes.length} quiz da migrare`)

    // 2. Crea backup
    const backupDir = path.dirname(BACKUP_PATH)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    fs.writeFileSync(BACKUP_PATH, JSON.stringify(archiveData, null, 2))
    console.log(`💾 Backup creato: ${path.basename(BACKUP_PATH)}`)

    // 3. Migra ogni quiz
    let migratedCount = 0
    let alreadyCategorizedCount = 0

    archiveData.quizzes.forEach((quiz, index) => {
      // Skip se già categorizzato
      if (quiz.category && quiz.subcategory) {
        alreadyCategorizedCount++
        console.log(`⏭️  Quiz ${index + 1}: "${quiz.title}" già categorizzato (${quiz.category}/${quiz.subcategory})`)
        return
      }

      // Auto-categorizza
      const categorization = autoCategorizateQuiz(quiz)

      quiz.category = categorization.category
      quiz.subcategory = categorization.subcategory

      const categoryLabel = QUIZ_CATEGORIES[categorization.category]?.label || categorization.category
      const subcategoryLabel = QUIZ_CATEGORIES[categorization.category]?.subcategories[categorization.subcategory]?.label || categorization.subcategory

      console.log(`✅ Quiz ${index + 1}: "${quiz.title}" → ${categoryLabel} / ${subcategoryLabel} (${categorization.confidence})`)
      migratedCount++
    })

    // 4. Aggiorna metadata
    archiveData.metadata.lastUpdate = new Date().toISOString().split('T')[0]
    archiveData.metadata.version = "1.1" // Bump version per indicare migrazione categorie

    // 5. Salva archivio aggiornato
    fs.writeFileSync(QUIZ_ARCHIVE_PATH, JSON.stringify(archiveData, null, 2))

    // 6. Report finale
    console.log('\\n🎉 Migrazione completata!')
    console.log(`📊 Risultati:`)
    console.log(`   • Quiz migrati: ${migratedCount}`)
    console.log(`   • Quiz già categorizzati: ${alreadyCategorizedCount}`)
    console.log(`   • Quiz totali: ${archiveData.quizzes.length}`)
    console.log(`\\n📁 Backup salvato: ${BACKUP_PATH}`)
    console.log(`📁 Archivio aggiornato: ${QUIZ_ARCHIVE_PATH}`)

    // 7. Statistiche per categoria
    console.log('\\n📈 Distribuzione per categoria:')
    const stats = {}
    archiveData.quizzes.forEach(quiz => {
      const cat = quiz.category || 'non_categorizzato'
      const subcat = quiz.subcategory || 'generale'

      if (!stats[cat]) stats[cat] = { total: 0, subcategories: {} }
      if (!stats[cat].subcategories[subcat]) stats[cat].subcategories[subcat] = 0

      stats[cat].total++
      stats[cat].subcategories[subcat]++
    })

    Object.entries(stats).forEach(([catKey, catStats]) => {
      const catLabel = QUIZ_CATEGORIES[catKey]?.label || catKey
      console.log(`   ${catLabel}: ${catStats.total} quiz`)
      Object.entries(catStats.subcategories).forEach(([subcatKey, count]) => {
        const subcatLabel = QUIZ_CATEGORIES[catKey]?.subcategories[subcatKey]?.label || subcatKey
        console.log(`     └── ${subcatLabel}: ${count}`)
      })
    })

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error)

    // Tentativo rollback se backup esiste
    if (fs.existsSync(BACKUP_PATH)) {
      console.log('🔄 Tentativo rollback automatico...')
      try {
        const backupData = fs.readFileSync(BACKUP_PATH, 'utf8')
        fs.writeFileSync(QUIZ_ARCHIVE_PATH, backupData)
        console.log('✅ Rollback completato')
      } catch (rollbackError) {
        console.error('❌ Errore rollback:', rollbackError)
      }
    }
  }
}

// Esegui migrazione se script chiamato direttamente
if (require.main === module) {
  runMigration()
}

module.exports = { runMigration, autoCategorizateQuiz, QUIZ_CATEGORIES }