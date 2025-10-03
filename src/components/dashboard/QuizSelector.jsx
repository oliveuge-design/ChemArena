import { memo } from "react"

const QuizSelector = memo(function QuizSelector({
  filteredQuizzes,
  selectedCategory,
  onQuizSelect,
  getCategoryIcon,
  safeLength,
  safeAverage,
  safeMath
}) {
  const renderQuizCards = () => {
    if (!Array.isArray(filteredQuizzes) || filteredQuizzes.length === 0) {
      return (
        <div className="text-center py-16" key="no-quizzes">
          <div className="text-6xl mb-4">📝</div>
          <h4 className="text-xl font-semibold text-gray-700 mb-2">Nessun quiz trovato</h4>
          <div className="text-gray-500">Non ci sono quiz disponibili per la categoria "{String(selectedCategory || '')}"</div>
        </div>
      )
    }

    const validQuizzes = filteredQuizzes.filter(quiz =>
      quiz && typeof quiz === 'object' && quiz.id && typeof quiz.id === 'string'
    )

    return validQuizzes.map((quiz, index) => {
      const quizKey = `quiz-${quiz.id}-${index}`

      return (
        <button
          key={quizKey}
          onClick={() => onQuizSelect(quiz)}
          className="w-full p-6 bg-white rounded-xl shadow-md hover:shadow-lg text-left group border-2 border-transparent hover:border-blue-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {String(quiz.title || 'Quiz senza titolo')}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <span className="mr-1">📝</span>
                  {safeLength(quiz.questions)} domande
                </span>
                <span className="flex items-center">
                  <span className="mr-1">⏱️</span>
                  Tempo medio: {safeAverage(quiz.questions, 'time', 15)}s
                </span>
                <span className="flex items-center">
                  <span className="mr-1">🎯</span>
                  {safeMath(() => (Array.isArray(quiz.questions) ? quiz.questions.length : 0) * 1000)} punti max
                </span>
                {quiz.password && (
                  <span className="flex items-center">
                    <span className="mr-1">🔑</span>
                    Password: {String(quiz.password)}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">Creato il {String(quiz.created || 'Data sconosciuta')}</div>
            </div>
            <div className="ml-4 text-2xl group-hover:scale-110 transition-transform duration-300">
              🚀
            </div>
          </div>
        </button>
      )
    })
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getCategoryIcon(selectedCategory || '')}</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{String(selectedCategory || 'Categoria')}</h3>
        <div className="text-gray-600">Seleziona il quiz da lanciare</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4 px-4 py-4">
          {renderQuizCards()}
        </div>
      </div>
    </div>
  )
})

export default QuizSelector