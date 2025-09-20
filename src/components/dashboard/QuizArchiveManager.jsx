import { useState, useEffect } from 'react';
import { QuizArchive } from '../../utils/quizArchive';
import { QUIZ_CATEGORIES, filterQuizzesByCategory, getCategoryStats } from '../../constants/categories';
import toast from 'react-hot-toast';

export default function QuizArchiveManager({ readOnly = false }) {
  const [quizzes, setQuizzes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('browse');

  // Filtri per categoria
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [newQuiz, setNewQuiz] = useState({
    title: '',
    subject: '',
    questions: [{ 
      question: '', 
      answers: [
        { text: '', image: '' },
        { text: '', image: '' },
        { text: '', image: '' },
        { text: '', image: '' }
      ], 
      solution: 0, 
      time: 15, 
      cooldown: 5, 
      image: '' 
    }]
  });
  const [editingQuiz, setEditingQuiz] = useState(null);

  useEffect(() => {
    loadQuizzes();
    loadImages();
  }, []);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const data = await QuizArchive.getAllQuizzes();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      toast.error('Errore nel caricamento dei quiz');
    }
    setLoading(false);
  };

  const loadImages = async () => {
    try {
      const data = await QuizArchive.getAllImages();
      setImages(data.images || []);
    } catch (error) {
      toast.error('Errore nel caricamento delle immagini');
    }
  };


  const saveNewQuiz = async () => {
    try {
      const validation = QuizArchive.validateQuiz(newQuiz);
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      if (editingQuiz) {
        await QuizArchive.updateQuiz(editingQuiz.id, newQuiz);
        toast.success('Quiz aggiornato con successo!');
      } else {
        await QuizArchive.saveQuiz(newQuiz);
        toast.success('Quiz salvato nell\'archivio!');
      }

      setNewQuiz({
        title: '',
        subject: '',
        questions: [{ 
          question: '', 
          answers: [
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' },
            { text: '', image: '' }
          ], 
          solution: 0, 
          time: 15, 
          cooldown: 5, 
          image: '' 
        }]
      });
      setEditingQuiz(null);
      loadQuizzes();
      setSelectedTab('browse');
    } catch (error) {
      toast.error('Errore nel salvare il quiz');
    }
  };

  // Logica di filtraggio
  const filteredQuizzes = quizzes.filter(quiz => {
    // Filtro per ricerca testuale
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (!quiz.title.toLowerCase().includes(searchLower) &&
          !quiz.subject.toLowerCase().includes(searchLower) &&
          !(quiz.author || '').toLowerCase().includes(searchLower)) {
        return false
      }
    }

    // Filtro per categoria
    if (selectedCategory && quiz.category !== selectedCategory) return false
    if (selectedSubcategory && quiz.subcategory !== selectedSubcategory) return false

    return true
  })

  const categoryStats = getCategoryStats(quizzes)

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setNewQuiz({
      title: quiz.title,
      subject: quiz.subject,
      questions: quiz.questions.map(q => ({
        ...q,
        answers: q.answers.map(answer => 
          typeof answer === 'string' 
            ? { text: answer, image: '' } 
            : answer
        )
      }))
    });
    setSelectedTab('create');
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm('Sei sicuro di voler eliminare questo quiz?')) return;

    try {
      await QuizArchive.deleteQuiz(quizId);
      toast.success('Quiz eliminato con successo');
      loadQuizzes();
    } catch (error) {
      toast.error('Errore nell\'eliminare il quiz');
    }
  };

  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        question: '', 
        answers: [
          { text: '', image: '' },
          { text: '', image: '' },
          { text: '', image: '' },
          { text: '', image: '' }
        ], 
        solution: 0, 
        time: 15, 
        cooldown: 5, 
        image: '' 
      }]
    }));
  };

  const removeQuestion = (index) => {
    if (newQuiz.questions.length > 1) {
      setNewQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index)
      }));
    }
  };

  const updateQuestion = (questionIndex, field, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const updateAnswer = (questionIndex, answerIndex, field, value) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex ? {
          ...q,
          answers: q.answers.map((a, j) => 
            j === answerIndex ? { ...a, [field]: value } : a
          )
        } : q
      )
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await QuizArchive.uploadImage(file, ['quiz']);
      toast.success('Immagine caricata con successo!');
      loadImages();
    } catch (error) {
      toast.error('Errore nell\'upload dell\'immagine');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">📚 Archivio Quiz</h2>
      
      <div className="mb-6">
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setSelectedTab('browse')}
            className={`py-2 px-4 font-medium ${selectedTab === 'browse' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Sfoglia Quiz ({quizzes.length})
          </button>
          {!readOnly && (
          <button
            onClick={() => {
              setSelectedTab('create');
              if (!editingQuiz) {
                setNewQuiz({
                  title: '',
                  subject: '',
                  questions: [{ 
                    question: '', 
                    answers: [
                      { text: '', image: '' },
                      { text: '', image: '' },
                      { text: '', image: '' },
                      { text: '', image: '' }
                    ], 
                    solution: 0, 
                    time: 15, 
                    cooldown: 5, 
                    image: '' 
                  }]
                });
              }
            }}
            className={`py-2 px-4 font-medium ${selectedTab === 'create' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            {editingQuiz ? 'Modifica Quiz' : 'Crea Quiz'}
          </button>
          )}
          {!readOnly && (
          <button
            onClick={() => setSelectedTab('images')}
            className={`py-2 px-4 font-medium ${selectedTab === 'images' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            Immagini ({images.length})
          </button>
          )}
        </div>
      </div>

      {selectedTab === 'browse' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">🗂️ Quiz Salvati ({quizzes.length})</h3>
            <div className="text-sm text-gray-500">
              {filteredQuizzes.length !== quizzes.length && `Filtrati: ${filteredQuizzes.length}`}
            </div>
          </div>

          {/* Filtri e Ricerca */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Ricerca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🔍 Cerca</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Titolo, materia, autore..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🎯 Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setSelectedSubcategory('') // Reset sottocategoria
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tutte le categorie</option>
                  {Object.entries(QUIZ_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.label} ({categoryStats[key]?.total || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sottocategoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">🏷️ Sottocategoria</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Tutte le sottocategorie</option>
                  {selectedCategory && Object.entries(QUIZ_CATEGORIES[selectedCategory]?.subcategories || {}).map(([key, subcategory]) => (
                    <option key={key} value={key}>
                      {subcategory.label} ({categoryStats[selectedCategory]?.subcategories[key] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filtri */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('')
                    setSelectedSubcategory('')
                  }}
                  className="w-full p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium"
                >
                  🗑️ Reset Filtri
                </button>
              </div>
            </div>

            {/* Statistiche categorie */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryStats).map(([categoryKey, stats]) => {
                const category = QUIZ_CATEGORIES[categoryKey]
                if (!category) return null
                return (
                  <button
                    key={categoryKey}
                    onClick={() => {
                      setSelectedCategory(categoryKey)
                      setSelectedSubcategory('')
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === categoryKey
                        ? category.color
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.label} ({stats.total})
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <p>Caricamento...</p>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nessun quiz nell'archivio</p>
              <button
                onClick={() => setSelectedTab('create')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Crea il tuo primo quiz
              </button>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Nessun quiz corrisponde ai filtri selezionati</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                  setSelectedSubcategory('')
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset Filtri
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{quiz.title}</h4>
                      <p className="text-gray-600">Materia: {quiz.subject}</p>

                      {/* Categorie */}
                      {(quiz.category || quiz.subcategory) && (
                        <div className="flex items-center space-x-2 mt-1 mb-2">
                          {quiz.category && QUIZ_CATEGORIES[quiz.category] && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${QUIZ_CATEGORIES[quiz.category].color}`}>
                              {QUIZ_CATEGORIES[quiz.category].label}
                            </span>
                          )}
                          {quiz.subcategory && quiz.category && QUIZ_CATEGORIES[quiz.category]?.subcategories[quiz.subcategory] && (
                            <>
                              <span className="text-gray-400">→</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${QUIZ_CATEGORIES[quiz.category].subcategories[quiz.subcategory].color}`}>
                                {QUIZ_CATEGORIES[quiz.category].subcategories[quiz.subcategory].label}
                              </span>
                            </>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-gray-500">
                        {quiz.questions.length} domande • Creato il {quiz.created}
                        {quiz.author && ` • da ${quiz.author}`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {!readOnly && (
                        <>
                          <button
                            onClick={() => editQuiz(quiz)}
                            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                          >
                            ✏️ Modifica
                          </button>
                          <button
                            onClick={() => deleteQuiz(quiz.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            🗑️ Elimina
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'create' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">{editingQuiz ? 'Modifica Quiz' : 'Crea Nuovo Quiz'}</h3>
            {editingQuiz && (
              <button
                onClick={() => {
                  setEditingQuiz(null);
                  setNewQuiz({
                    title: '',
                    subject: '',
                    questions: [{ 
                      question: '', 
                      answers: [
                        { text: '', image: '' },
                        { text: '', image: '' },
                        { text: '', image: '' },
                        { text: '', image: '' }
                      ], 
                      solution: 0, 
                      time: 15, 
                      cooldown: 5, 
                      image: '' 
                    }]
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
              >
                Annulla Modifica
              </button>
            )}
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Titolo del quiz"
              value={newQuiz.title}
              onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="text"
              placeholder="Materia"
              value={newQuiz.subject}
              onChange={(e) => setNewQuiz(prev => ({ ...prev, subject: e.target.value }))}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="space-y-6">
            {newQuiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Domanda {questionIndex + 1}</h4>
                  {newQuiz.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Testo della domanda"
                  value={question.question}
                  onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                  className="border rounded px-3 py-2 w-full mb-4"
                />

                <div className="space-y-4 mb-4">
                  <h5 className="font-medium text-gray-700">Opzioni di Risposta:</h5>
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className={`border rounded-lg p-3 ${question.solution === answerIndex ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}>
                      <div className="flex items-center mb-3">
                        <input
                          type="radio"
                          name={`solution-${questionIndex}`}
                          checked={question.solution === answerIndex}
                          onChange={() => updateQuestion(questionIndex, 'solution', answerIndex)}
                          className="mr-2"
                        />
                        <span className="font-medium text-sm">Opzione {answerIndex + 1} {question.solution === answerIndex && '(Corretta)'}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">Testo</label>
                          <input
                            type="text"
                            placeholder={`Testo risposta ${answerIndex + 1}`}
                            value={answer.text || ''}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, 'text', e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Immagine (opzionale)</label>
                          <select
                            value={answer.image || ''}
                            onChange={(e) => updateAnswer(questionIndex, answerIndex, 'image', e.target.value)}
                            className="border rounded px-3 py-2 w-full"
                          >
                            <option value="">Nessuna immagine</option>
                            {images.map(img => (
                              <option key={img.id} value={img.url}>
                                {img.originalName}
                              </option>
                            ))}
                          </select>
                          {answer.image && (
                            <div className="mt-2">
                              <img src={answer.image} alt="Preview risposta" className="max-w-xs max-h-20 object-cover rounded" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tempo (secondi)</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={question.time}
                      onChange={(e) => updateQuestion(questionIndex, 'time', parseInt(e.target.value) || 15)}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cooldown (secondi)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={question.cooldown}
                      onChange={(e) => updateQuestion(questionIndex, 'cooldown', parseInt(e.target.value) || 5)}
                      className="border rounded px-3 py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Immagine</label>
                    <select
                      value={question.image}
                      onChange={(e) => updateQuestion(questionIndex, 'image', e.target.value)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Nessuna immagine</option>
                      {images.map(img => (
                        <option key={img.id} value={img.url}>
                          {img.originalName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {question.image && (
                  <div className="mt-2">
                    <img src={question.image} alt="Preview" className="max-w-xs max-h-32 object-cover rounded" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={addQuestion}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              ➕ Aggiungi Domanda
            </button>
            <button
              onClick={saveNewQuiz}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {editingQuiz ? 'Aggiorna Quiz' : 'Salva Quiz'}
            </button>
          </div>
        </div>
      )}

      {selectedTab === 'images' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Gestione Immagini</h3>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="bg-green-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-600 transition-colors"
              >
                📤 Carica Immagine
              </label>
            </div>
          </div>

          {images.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nessuna immagine caricata</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {images.map(image => (
                <div key={image.id} className="border rounded-lg p-3">
                  <img
                    src={image.url}
                    alt={image.originalName}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                  <p className="text-sm font-medium truncate">{image.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024).toFixed(1)} KB • {image.uploadDate}
                  </p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(image.url);
                        toast.success('URL copiato!');
                      }}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      📋 Copia URL
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Eliminare questa immagine?')) {
                          try {
                            await QuizArchive.deleteImage(image.id);
                            toast.success('Immagine eliminata');
                            loadImages();
                          } catch (error) {
                            toast.error('Errore nell\'eliminazione');
                          }
                        }
                      }}
                      className="text-xs bg-red-500 text-white px-2 py-1 rounded"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}