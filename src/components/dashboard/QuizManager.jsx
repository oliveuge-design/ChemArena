import { useState, useEffect } from "react"
import Button from "@/components/Button"
import { useDashboard } from "@/context/DashboardContext"

export default function QuizManager() {
  const { setEditingQuiz } = useDashboard()
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    // Carica i quiz salvati dal localStorage
    const savedQuizzes = JSON.parse(localStorage.getItem('chemarena-quizzes') || '[]')
    setQuizzes(savedQuizzes)
  }, [])

  const handleEdit = (quiz) => {
    console.log("QuizManager - Avvio modifica quiz:", quiz) // Debug
    setEditingQuiz(quiz) // Context gestisce automaticamente tab switch
  }

  const handleDelete = (quizId) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId)
    setQuizzes(updatedQuizzes)
    localStorage.setItem('chemarena-quizzes', JSON.stringify(updatedQuizzes))
    setShowDeleteConfirm(null)
  }

  const handleDuplicate = (quiz) => {
    const newQuiz = {
      ...quiz,
      id: Date.now().toString(),
      subject: quiz.subject + " (Copia)",
      createdAt: new Date().toISOString()
    }
    const updatedQuizzes = [...quizzes, newQuiz]
    setQuizzes(updatedQuizzes)
    localStorage.setItem('chemarena-quizzes', JSON.stringify(updatedQuizzes))
  }

  const handleUseInGame = (quiz) => {
    // Salva il quiz selezionato per il gioco
    localStorage.setItem('current-game-quiz', JSON.stringify(quiz))
    alert(`Quiz "${quiz.subject}" impostato come quiz attivo! Vai alla sezione "Lancia Gioco" per iniziare.`)
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">I Miei Quiz</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestisci tutti i tuoi quiz creati
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {quizzes.length} quiz totali
          </span>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun quiz creato</h3>
          <p className="text-gray-600 mb-6">Inizia creando il tuo primo quiz!</p>
          <Button onClick={() => window.location.hash = 'create'}>
            Crea il tuo primo Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {quiz.subject}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {quiz.questions?.length || 0} domande
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">📅</span>
                    Creato: {new Date(quiz.createdAt || Date.now()).toLocaleDateString('it-IT')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">⏱️</span>
                    Tempo medio: {Math.round(quiz.questions?.reduce((acc, q) => acc + (q.time || 15), 0) / (quiz.questions?.length || 1))}s per domanda
                  </div>
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
                      onClick={() => handleDuplicate(quiz)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      📋 Duplica
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

      {/* Conferma eliminazione */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Conferma Eliminazione
            </h3>
            <p className="text-gray-600 mb-4">
              Sei sicuro di voler eliminare questo quiz? Questa azione non può essere annullata.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 bg-red-500 hover:bg-red-600"
              >
                Elimina
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-500 hover:bg-gray-600"
              >
                Annulla
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}