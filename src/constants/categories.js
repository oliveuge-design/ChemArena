// Configurazione categorie e sottocategorie per l'archivio quiz

export const QUIZ_CATEGORIES = {
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

// Funzione per auto-categorizzare un quiz basato su subject/title
export function autoCategorizateQuiz(quiz) {
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

  // Fallback alla categoria cultura per subject generici
  return {
    category: 'cultura',
    subcategory: 'generale',
    confidence: 'fallback'
  }
}

// Funzione per ottenere le statistiche per categoria
export function getCategoryStats(quizzes) {
  const stats = {}

  quizzes.forEach(quiz => {
    const cat = quiz.category || 'non_categorizzato'
    const subcat = quiz.subcategory || 'generale'

    if (!stats[cat]) {
      stats[cat] = { total: 0, subcategories: {} }
    }

    if (!stats[cat].subcategories[subcat]) {
      stats[cat].subcategories[subcat] = 0
    }

    stats[cat].total++
    stats[cat].subcategories[subcat]++
  })

  return stats
}

// Funzione per filtrare quiz per categoria
export function filterQuizzesByCategory(quizzes, category, subcategory = null) {
  return quizzes.filter(quiz => {
    if (category && quiz.category !== category) return false
    if (subcategory && quiz.subcategory !== subcategory) return false
    return true
  })
}