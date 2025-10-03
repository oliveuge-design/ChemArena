import { useState, useEffect } from "react"
import Button from "@/components/Button"
import { useDashboard } from "@/context/DashboardContext"
import { quizLogger } from "@/utils/logger"

export default function QuizManagerAdvanced() {
  const { setEditingQuiz } = useDashboard()
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategories, setEditingCategories] = useState({ category: "", subcategory: "" })

  useEffect(() => {
    loadQuizzes()
  }, [])

  const loadQuizzes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/quiz-archive')
      const data = await response.json()

      console.log('🔍 API Response:', { ok: response.ok, status: response.status, hasQuizzes: !!data.quizzes, quizzesLength: data.quizzes?.length })

      if (response.ok && data.quizzes && Array.isArray(data.quizzes)) {
        setQuizzes(data.quizzes)
        console.log(`✅ Caricati ${data.quizzes.length} quiz dall'archivio`)
      } else {
        console.log('⚠️ Condizione fallback:', { responseOk: response.ok, hasQuizzes: !!data.quizzes, isArray: Array.isArray(data.quizzes) })
        // Fallback al localStorage per compatibilità
        const savedQuizzes = JSON.parse(localStorage.getItem('chemarena-quizzes') || '[]')
        setQuizzes(savedQuizzes)
        console.log(`⚠️ Fallback localStorage: ${savedQuizzes.length} quiz`)
      }
    } catch (error) {
      console.error('Errore caricamento quiz:', error)
      // Fallback al localStorage
      const savedQuizzes = JSON.parse(localStorage.getItem('chemarena-quizzes') || '[]')
      setQuizzes(savedQuizzes)
      console.log(`❌ Errore API, fallback localStorage: ${savedQuizzes.length} quiz`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (quiz) => {
    quizLogger.user("Starting quiz edit", { quizId: quiz?.id, quizName: quiz?.subject })
    setEditingQuiz(quiz)
  }

  const handleDelete = async (quizId) => {
    try {
      const response = await fetch(`/api/quiz-archive?id=${quizId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await loadQuizzes() // Ricarica la lista
        setShowDeleteConfirm(null)
        alert('Quiz eliminato con successo!')
      } else {
        alert('Errore durante l\'eliminazione: ' + result.message)
      }
    } catch (error) {
      console.error('Errore eliminazione quiz:', error)
      alert('Errore di connessione durante l\'eliminazione')
    }
  }

  const handleDuplicate = (quiz) => {
    const newQuiz = {
      ...quiz,
      id: Date.now().toString(),
      subject: quiz.subject + " (Copia)",
      title: (quiz.title || quiz.subject) + " (Copia)",
      created: new Date().toISOString().split('T')[0]
    }

    // Aggiungi sia all'archivio che al localStorage per compatibilità
    const updatedQuizzes = [...quizzes, newQuiz]
    setQuizzes(updatedQuizzes)
    localStorage.setItem('chemarena-quizzes', JSON.stringify(updatedQuizzes))
  }

  const handleTogglePublic = async (quiz) => {
    try {
      const updatedQuiz = {
        ...quiz,
        isPublic: !quiz.isPublic
      }

      const response = await fetch(`/api/quiz-archive?id=${quiz.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedQuiz)
      })

      const result = await response.json()

      if (response.ok) {
        await loadQuizzes()
        console.log(`✅ Quiz ${quiz.id} ${updatedQuiz.isPublic ? 'reso pubblico' : 'reso privato'}`)
      } else {
        alert('Errore durante l\'aggiornamento: ' + (result.error || 'Errore sconosciuto'))
      }
    } catch (error) {
      console.error('Errore toggle pubblico:', error)
      alert('Errore durante l\'aggiornamento del quiz')
    }
  }

  const handleUseInGame = (quiz) => {
    localStorage.setItem('current-game-quiz', JSON.stringify(quiz))
    alert(`Quiz "${quiz.subject}" impostato come quiz attivo! Vai alla sezione "Lancia Gioco" per iniziare.`)
  }

  const handleCategoryUpdate = async (quiz, newCategory, newSubcategory) => {
    try {
      const updatedQuiz = {
        ...quiz,
        category: newCategory,
        subcategory: newSubcategory
      }

      const response = await fetch(`/api/quiz-archive?id=${quiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedQuiz)
      })

      const result = await response.json()

      if (result.success) {
        await loadQuizzes()
        alert('Categoria aggiornata con successo!')
      } else {
        alert('Errore durante l\'aggiornamento: ' + result.message)
      }
    } catch (error) {
      console.error('Errore aggiornamento categoria:', error)
      alert('Errore di connessione durante l\'aggiornamento')
    }
  }

  // Funzioni di filtering
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.title?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || quiz.category === selectedCategory
    const matchesSubcategory = !selectedSubcategory || quiz.subcategory === selectedSubcategory

    return matchesSearch && matchesCategory && matchesSubcategory
  })

  // Estrai categorie e sottocategorie uniche
  const categories = [...new Set(quizzes.map(quiz => quiz.category).filter(Boolean))]
  const subcategories = [...new Set(quizzes
    .filter(quiz => !selectedCategory || quiz.category === selectedCategory)
    .map(quiz => quiz.subcategory)
    .filter(Boolean))]

  // Debug log per verificare stato rendering
  console.log('📊 Rendering QuizManagerAdvanced:', {
    totalQuizzes: quizzes.length,
    filteredQuizzes: filteredQuizzes.length,
    isLoading,
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    categories: categories,
    subcategories: subcategories,
    firstQuizCategory: quizzes[0]?.category,
    firstQuizSubcategory: quizzes[0]?.subcategory
  })

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Quiz Avanzata</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestisci quiz con categorie, ricerca e filtri avanzati
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {filteredQuizzes.length} di {quizzes.length} quiz
          </span>
          <Button onClick={() => loadQuizzes()} disabled={isLoading}>
            {isLoading ? "🔄 Aggiorna..." : "🔄 Aggiorna"}
          </Button>
        </div>
      </div>

      {/* Controlli di ricerca e filtro */}
      <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🔍 Cerca quiz
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome quiz o titolo..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              📁 Categoria
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setSelectedSubcategory("")
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tutte le categorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              🏷️ Sottocategoria
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!selectedCategory}
            >
              <option value="">Tutte le sottocategorie</option>
              {subcategories.map(subcategory => (
                <option key={subcategory} value={subcategory}>{subcategory}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => { setSearchTerm(""); setSelectedCategory(""); setSelectedSubcategory("") }}>
            ❌ Pulisci filtri
          </Button>
        </div>
      </div>

      {/* Lista quiz */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Caricamento quiz...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {quizzes.length === 0 ? "Nessun quiz trovato" : "Nessun quiz corrisponde ai filtri"}
          </h3>
          <p className="text-gray-600 mb-6">
            {quizzes.length === 0
              ? "Inizia creando il tuo primo quiz!"
              : "Prova a modificare i filtri di ricerca"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {quiz.subject || quiz.title}
                    </h3>
                    {quiz.isPublic && (
                      <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                        🌐 PUBBLICO
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {quiz.questions?.length || 0} domande
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    Creato: {new Date(quiz.created || Date.now()).toLocaleDateString('it-IT')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">👤</span>
                    Autore: {quiz.author || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📁</span>
                    Categoria: {quiz.category || 'Non assegnata'}
                  </div>
                  {quiz.subcategory && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🏷️</span>
                      Sottocategoria: {quiz.subcategory}
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => handleUseInGame(quiz)}
                    className="w-full bg-green-500 hover:bg-green-600"
                  >
                    🚀 Usa nel Gioco
                  </Button>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(quiz)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategories({ category: quiz.category || "", subcategory: quiz.subcategory || "" })
                        setSelectedQuiz(quiz)
                        setShowCategoryModal(true)
                      }}
                      className="flex-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                    >
                      🏷️ Categoria
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDuplicate(quiz)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      📋 Duplica
                    </button>
                    <button
                      onClick={() => handleTogglePublic(quiz)}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        quiz.isPublic
                          ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                      title={quiz.isPublic ? 'Rendi privato' : 'Rendi pubblico'}
                    >
                      {quiz.isPublic ? '🔒 Privato' : '🌐 Pubblico'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(quiz.id)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal gestione categorie */}
      {showCategoryModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🏷️ Gestisci Categorie - {selectedQuiz.subject}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={editingCategories.category}
                  onChange={(e) => setEditingCategories(prev => ({...prev, category: e.target.value}))}
                  placeholder="Inserisci categoria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sottocategoria
                </label>
                <input
                  type="text"
                  value={editingCategories.subcategory}
                  onChange={(e) => setEditingCategories(prev => ({...prev, subcategory: e.target.value}))}
                  placeholder="Inserisci sottocategoria..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => {
                  handleCategoryUpdate(selectedQuiz, editingCategories.category, editingCategories.subcategory)
                  setShowCategoryModal(false)
                }}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                💾 Salva
              </Button>
              <Button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                ❌ Annulla
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ⚠️ Conferma Eliminazione
            </h3>
            <p className="text-gray-600 mb-4">
              Sei sicuro di voler eliminare questo quiz? Questa azione non può essere annullata.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                🗑️ Elimina
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                ❌ Annulla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}