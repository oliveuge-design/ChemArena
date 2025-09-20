import { useState, useEffect } from "react"
import Button from "@/components/Button"
import QuizTemplateManager from "./QuizTemplateManager"
import { QUIZ_CATEGORIES, autoCategorizateQuiz } from "@/constants/categories"

export default function QuizCreator({ editingQuiz, onClearEdit }) {
  const [quiz, setQuiz] = useState({
    id: '',
    subject: '',
    password: 'QUIZ123',
    category: '',
    subcategory: '',
    questions: []
  })
  
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    answers: ['', '', '', '', '', '', '', ''],
    solution: 0,
    time: 15,
    cooldown: 5,
    image: ''
  })

  const [numAnswers, setNumAnswers] = useState(4)

  const [editingIndex, setEditingIndex] = useState(-1)
  const [showPreview, setShowPreview] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Carica il quiz in modifica quando viene passato
  useEffect(() => {
    if (editingQuiz) {
      console.log("QuizCreator - Caricamento quiz per modifica:", editingQuiz) // Debug
      setQuiz({
        id: editingQuiz.id || '',
        subject: editingQuiz.subject || '',
        password: editingQuiz.password || 'QUIZ123',
        questions: editingQuiz.questions || []
      })
      setIsEditMode(true)
    }
  }, [editingQuiz])

  // Reset quando si esce dalla modalità modifica
  useEffect(() => {
    if (!editingQuiz && isEditMode) {
      resetForm()
      setIsEditMode(false)
    }
  }, [editingQuiz, isEditMode])


  const resetQuestion = (keepNumAnswers = false) => {
    setCurrentQuestion({
      question: '',
      answers: ['', '', '', '', '', '', '', ''],
      solution: 0,
      time: 15,
      cooldown: 5,
      image: ''
    })
    if (!keepNumAnswers) {
      setNumAnswers(4)
    }
  }

  const resetForm = () => {
    setQuiz({
      id: '',
      subject: '',
      password: 'QUIZ123',
      category: '',
      subcategory: '',
      questions: []
    })
    resetQuestion()
    setEditingIndex(-1)
    setShowPreview(false)
  }

  const handleQuizChange = (field, value) => {
    setQuiz(prev => {
      const updated = { ...prev, [field]: value }

      // Auto-categorizza quando cambia il subject
      if (field === 'subject' && value) {
        const suggestion = autoCategorizateQuiz({ subject: value, title: prev.title || '' })
        if (suggestion.confidence === 'auto') {
          updated.category = suggestion.category
          updated.subcategory = suggestion.subcategory
        }
      }

      return updated
    })
  }

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({ ...prev, [field]: value }))
  }

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...currentQuestion.answers]
    newAnswers[index] = value
    setCurrentQuestion(prev => ({ ...prev, answers: newAnswers }))
  }

  const handleNumAnswersChange = (newNum) => {
    setNumAnswers(newNum)
    // Assicurati che la soluzione non sia fuori range
    if (currentQuestion.solution >= newNum) {
      setCurrentQuestion(prev => ({ ...prev, solution: 0 }))
    }
  }

  const handleSelectTemplate = (template) => {
    // Carica il template selezionato
    setQuiz({
      id: template.id,
      subject: template.title,
      password: template.password || 'QUIZ123',
      questions: template.questions || []
    })

    // Nascondi i template dopo la selezione
    setShowTemplates(false)

    // Mostra messaggio di conferma
    alert(`✅ Template "${template.title}" caricato con successo!\n\n📊 ${template.questionCount} domande incluse\n⏱️ Tempo stimato: ${template.estimatedTime} minuti`)
  }

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || !currentQuestion.answers.slice(0, numAnswers).some(a => a.trim())) {
      alert('Compila almeno la domanda e una risposta!')
      return
    }

    // Valida che ci siano almeno 2 risposte compilate
    const filledAnswers = currentQuestion.answers.slice(0, numAnswers).filter(a => a.trim())
    if (filledAnswers.length < 2) {
      alert('Compila almeno 2 risposte!')
      return
    }

    // Crea la domanda con solo le risposte necessarie
    const questionToAdd = {
      ...currentQuestion,
      answers: currentQuestion.answers.slice(0, numAnswers),
      numAnswers: numAnswers
    }

    console.log('🔧 DEBUG - Aggiungendo domanda:', questionToAdd)
    console.log('🔧 DEBUG - Quiz corrente:', quiz.questions.length, 'domande')

    const newQuestions = [...quiz.questions]
    if (editingIndex >= 0) {
      newQuestions[editingIndex] = questionToAdd
      setEditingIndex(-1)
    } else {
      newQuestions.push(questionToAdd)
    }

    console.log('🔧 DEBUG - Nuove domande:', newQuestions.length, 'domande')

    setQuiz(prev => {
      const updated = { ...prev, questions: newQuestions }
      console.log('🔧 DEBUG - Quiz aggiornato:', updated.questions.length, 'domande')
      return updated
    })
    resetQuestion(true) // Mantieni il numAnswers corrente
  }

  const editQuestion = (index) => {
    const question = quiz.questions[index]
    const questionNumAnswers = question.numAnswers || question.answers.length

    // Estendi a 8 se necessario per l'editing
    const extendedAnswers = [...question.answers]
    while (extendedAnswers.length < 8) {
      extendedAnswers.push('')
    }

    setCurrentQuestion({ ...question, answers: extendedAnswers })
    setNumAnswers(questionNumAnswers)
    setEditingIndex(index)
  }

  const deleteQuestion = (index) => {
    if (confirm('Sei sicuro di voler eliminare questa domanda?')) {
      const newQuestions = quiz.questions.filter((_, i) => i !== index)
      setQuiz(prev => ({ ...prev, questions: newQuestions }))
    }
  }

  const saveQuiz = async () => {
    if (!quiz.subject.trim() || quiz.questions.length === 0) {
      alert('Inserisci un titolo e almeno una domanda!')
      return
    }

    // Converte il formato interno nel formato archivio
    const quizToSave = {
      id: quiz.id || `manual_${Date.now()}`,
      title: quiz.subject,
      subject: quiz.subject,
      created: quiz.createdAt ? quiz.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      author: "Manager",
      password: quiz.password || 'QUIZ123',
      category: quiz.category || '',
      subcategory: quiz.subcategory || '',
      questions: quiz.questions.map((q, index) => ({
        id: q.id || `q${index + 1}`,
        question: q.question,
        answers: q.answers,
        solution: q.solution,
        time: q.time || 15,
        cooldown: q.cooldown || 5,
        image: q.image || ""
      }))
    }

    console.log('🔧 DEBUG - Salvando quiz nell\'archivio:', quizToSave)

    try {
      const response = await fetch('/api/quiz-archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizToSave)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`✅ Quiz ${isEditMode ? 'aggiornato' : 'creato'} con successo nell'archivio!\n🎯 ${quizToSave.questions.length} domande salvate`)

        // Reset del form e uscita dalla modalità modifica
        if (onClearEdit) {
          onClearEdit()
        }
        resetForm()
        setIsEditMode(false)
      } else {
        const error = await response.json()
        console.error('❌ Errore salvataggio:', error)
        alert(`❌ Errore salvataggio quiz: ${error.error || 'Errore sconosciuto'}\n\nDettagli: ${error.details || 'Nessun dettaglio disponibile'}`)
      }
    } catch (error) {
      console.error('❌ Errore di rete:', error)
      alert(`❌ Errore di connessione al server.\n\nVerifica che il server sia attivo e riprova.`)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isEditMode ? `✏️ Modifica Quiz: ${quiz.subject || 'Quiz Senza Nome'}` : 'Crea Nuovo Quiz'}
            </h2>
            <p className="text-gray-600">
              {isEditMode ? 'Modifica il quiz esistente' : 'Crea un quiz personalizzato per i tuoi studenti'}
            </p>
          </div>
          {isEditMode && (
            <div className="flex space-x-3">
              <Button 
                onClick={() => {
                  if (onClearEdit) onClearEdit()
                  resetForm()
                  setIsEditMode(false)
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                ❌ Annulla Modifica
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Template Manager */}
      {!isEditMode && (
        <div className="bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border-2 border-cyan-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">🧬 Template Sci-Fi</h3>
              <p className="text-gray-600 text-sm">Inizia da template predefiniti per accelerare la creazione</p>
            </div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:from-cyan-400 hover:to-purple-500 transition-all duration-300 font-medium"
            >
              {showTemplates ? '🔼 Nascondi Template' : '🔽 Mostra Template'}
            </button>
          </div>

          {showTemplates && (
            <QuizTemplateManager onSelectTemplate={handleSelectTemplate} />
          )}
        </div>
      )}

      {/* Informazioni Quiz */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Generali</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titolo Quiz *
            </label>
            <input
              type="text"
              value={quiz.subject}
              onChange={(e) => handleQuizChange('subject', e.target.value)}
              placeholder="es. Chimica - Titolazioni"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Quiz
            </label>
            <input
              type="text"
              value={quiz.password}
              onChange={(e) => handleQuizChange('password', e.target.value)}
              placeholder="PASSWORD"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categoria e Sottocategoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoria
            </label>
            <select
              value={quiz.category}
              onChange={(e) => handleQuizChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">🎯 Seleziona categoria...</option>
              {Object.entries(QUIZ_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sottocategoria
            </label>
            <select
              value={quiz.subcategory}
              onChange={(e) => handleQuizChange('subcategory', e.target.value)}
              disabled={!quiz.category}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">🏷️ Seleziona sottocategoria...</option>
              {quiz.category && Object.entries(QUIZ_CATEGORIES[quiz.category]?.subcategories || {}).map(([key, subcategory]) => (
                <option key={key} value={key}>
                  {subcategory.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview categoria selezionata */}
        {quiz.category && quiz.subcategory && (
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Categoria selezionata:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${QUIZ_CATEGORIES[quiz.category]?.color || 'bg-gray-100 text-gray-800'}`}>
                {QUIZ_CATEGORIES[quiz.category]?.label}
              </span>
              <span className="text-gray-400">→</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${QUIZ_CATEGORIES[quiz.category]?.subcategories[quiz.subcategory]?.color || 'bg-gray-100 text-gray-800'}`}>
                {QUIZ_CATEGORIES[quiz.category]?.subcategories[quiz.subcategory]?.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Editor Domande */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {editingIndex >= 0 ? 'Modifica Domanda' : 'Aggiungi Domanda'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Testo Domanda *
            </label>
            <textarea
              value={currentQuestion.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
              placeholder="Inserisci la tua domanda qui..."
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Risposte
              </label>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Numero opzioni:</label>
                <select
                  value={numAnswers}
                  onChange={(e) => handleNumAnswersChange(parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.answers.slice(0, numAnswers).map((answer, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={currentQuestion.solution === index}
                    onChange={() => handleQuestionChange('solution', index)}
                    className="text-green-500"
                  />
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Risposta ${String.fromCharCode(65 + index)}`}
                    className={`flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      currentQuestion.solution === index ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Seleziona il radio button per indicare la risposta corretta • Fino a 8 opzioni supportate
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tempo (secondi)
              </label>
              <input
                type="number"
                value={currentQuestion.time}
                onChange={(e) => handleQuestionChange('time', parseInt(e.target.value) || 15)}
                min="5"
                max="120"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pausa (secondi)
              </label>
              <input
                type="number"
                value={currentQuestion.cooldown}
                onChange={(e) => handleQuestionChange('cooldown', parseInt(e.target.value) || 5)}
                min="0"
                max="30"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Immagine (URL)
              </label>
              <input
                type="url"
                value={currentQuestion.image}
                onChange={(e) => handleQuestionChange('image', e.target.value)}
                placeholder="https://..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={addQuestion}>
              {editingIndex >= 0 ? 'Aggiorna Domanda' : 'Aggiungi Domanda'}
            </Button>
            {editingIndex >= 0 && (
              <Button 
                onClick={() => {
                  resetQuestion()
                  setEditingIndex(-1)
                }}
                className="bg-gray-500 hover:bg-gray-600"
              >
                Annulla
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lista Domande */}
      {quiz.questions.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Domande Aggiunte ({quiz.questions.length})
            </h3>
            <Button onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? 'Nascondi Anteprima' : 'Mostra Anteprima'}
            </Button>
          </div>
          
          <div className="space-y-3">
            {quiz.questions.map((q, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {index + 1}. {q.question}
                    </h4>
                    {showPreview && (
                      <div className="mt-2 space-y-1">
                        {q.answers.map((answer, ansIndex) => (
                          <div
                            key={ansIndex}
                            className={`text-sm px-2 py-1 rounded ${
                              q.solution === ansIndex
                                ? 'bg-green-100 text-green-800 font-medium'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {String.fromCharCode(65 + ansIndex)}. {answer}
                            {q.solution === ansIndex && ' ✓'}
                          </div>
                        ))}
                        <div className="text-xs text-gray-500 mt-1">
                          {q.answers.length} opzioni | Tempo: {q.time}s | Pausa: {q.cooldown}s
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => editQuestion(index)}
                      className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm"
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => deleteQuestion(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 rounded text-sm"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Salva Quiz */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditMode ? 'Aggiorna Quiz' : 'Salva Quiz'}
            </h3>
            <p className="text-gray-600">
              Quiz con {quiz.questions.length} domande pronto per {isEditMode ? 'l\'aggiornamento' : 'il salvataggio'}
            </p>
          </div>
          <Button 
            onClick={saveQuiz}
            disabled={!quiz.subject.trim() || quiz.questions.length === 0}
            className={quiz.subject.trim() && quiz.questions.length > 0 
              ? "bg-green-500 hover:bg-green-600" 
              : "bg-gray-400 cursor-not-allowed"
            }
          >
            {isEditMode ? '✅ Aggiorna Quiz' : '💾 Salva Quiz'}
          </Button>
        </div>
      </div>
    </div>
  )
}