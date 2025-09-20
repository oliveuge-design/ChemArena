import { useState, useEffect } from 'react'
import Button from '@/components/Button'

export default function ClassManager() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showCreateStudent, setShowCreateStudent] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Form states
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
  })

  const [newStudent, setNewStudent] = useState({
    nickname: '',
    fullName: '',
    className: '',
    password: '',
    email: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Carica classi
      const classesRes = await fetch('/api/classes')
      const classesData = await classesRes.json()

      // Carica studenti
      const studentsRes = await fetch('/api/students?action=list')
      const studentsData = await studentsRes.json()

      setClasses(classesData.classes || [])
      setStudents(studentsData.students || [])
    } catch (error) {
      console.error('Errore caricamento dati:', error)
      setError('Errore nel caricamento dei dati')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newClass
        })
      })

      const data = await response.json()

      if (data.success) {
        setClasses([...classes, data.class])
        setNewClass({
          name: '',
          description: '',
          academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1)
        })
        setShowCreateClass(false)
        setError('')
      } else {
        setError(data.error || 'Errore nella creazione della classe')
      }
    } catch (error) {
      console.error('Errore creazione classe:', error)
      setError('Errore di connessione')
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          ...newStudent
        })
      })

      const data = await response.json()

      if (data.success) {
        setStudents([...students, data.student])
        setNewStudent({
          nickname: '',
          fullName: '',
          className: '',
          password: '',
          email: ''
        })
        setShowCreateStudent(false)
        setError('')
      } else {
        setError(data.error || 'Errore nella creazione dello studente')
      }
    } catch (error) {
      console.error('Errore creazione studente:', error)
      setError('Errore di connessione')
    }
  }

  const handleDeleteClass = async (className) => {
    if (!confirm(`Sei sicuro di voler eliminare la classe "${className}"? Tutti gli studenti della classe verranno rimossi.`)) {
      return
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          name: className
        })
      })

      const data = await response.json()

      if (data.success) {
        setClasses(classes.filter(c => c.name !== className))
        setStudents(students.filter(s => s.className !== className))
        if (selectedClass?.name === className) {
          setSelectedClass(null)
        }
        setError('')
      } else {
        setError(data.error || 'Errore nella eliminazione della classe')
      }
    } catch (error) {
      console.error('Errore eliminazione classe:', error)
      setError('Errore di connessione')
    }
  }

  const handleDeleteStudent = async (studentId) => {
    const student = students.find(s => s.id === studentId)
    if (!confirm(`Sei sicuro di voler eliminare lo studente "${student?.fullName}" (${student?.nickname})?`)) {
      return
    }

    try {
      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          studentId: studentId
        })
      })

      const data = await response.json()

      if (data.success) {
        setStudents(students.filter(s => s.id !== studentId))
        setError('')
      } else {
        setError(data.error || 'Errore nella eliminazione dello studente')
      }
    } catch (error) {
      console.error('Errore eliminazione studente:', error)
      setError('Errore di connessione')
    }
  }

  const getClassStats = (className) => {
    const classStudents = students.filter(s => s.className === className)
    const totalGames = classStudents.reduce((sum, s) => sum + (s.statistics?.totalGames || 0), 0)
    const totalPoints = classStudents.reduce((sum, s) => sum + (s.statistics?.totalPoints || 0), 0)
    const avgScore = classStudents.length > 0 ? Math.round(totalPoints / classStudents.length) : 0

    return {
      studentsCount: classStudents.length,
      totalGames,
      totalPoints,
      avgScore
    }
  }

  const getStudentsForClass = (className) => {
    return students.filter(s => s.className === className)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Caricamento...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏫 Gestione Classi e Studenti</h1>
            <p className="text-gray-600 mt-1">
              Gestisci le classi, gli studenti registrati e visualizza le statistiche
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowCreateClass(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              ➕ Nuova Classe
            </Button>
            <Button
              onClick={() => setShowCreateStudent(true)}
              className="bg-green-500 hover:bg-green-600"
            >
              👤 Nuovo Studente
            </Button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-sm text-blue-800">Classi Totali</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{students.length}</div>
            <div className="text-sm text-green-800">Studenti Registrati</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {students.reduce((sum, s) => sum + (s.statistics?.totalGames || 0), 0)}
            </div>
            <div className="text-sm text-purple-800">Partite Totali</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {students.reduce((sum, s) => sum + (s.statistics?.totalPoints || 0), 0)}
            </div>
            <div className="text-sm text-orange-800">Punti Totali</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Classes List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Classi ({classes.length})</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {classes.map((classData) => {
            const stats = getClassStats(classData.name)
            const classStudents = getStudentsForClass(classData.name)
            const isSelected = selectedClass?.name === classData.name

            return (
              <div key={classData.name} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <button
                      onClick={() => setSelectedClass(isSelected ? null : classData)}
                      className="text-left w-full"
                    >
                      <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                        {classData.name} {isSelected ? '▼' : '▶'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{classData.description}</p>
                      <p className="text-xs text-gray-500">Anno Accademico: {classData.academicYear}</p>
                    </button>

                    {/* Class Statistics */}
                    <div className="flex space-x-6 mt-3">
                      <div className="text-sm">
                        <span className="text-blue-600 font-medium">{stats.studentsCount}</span>
                        <span className="text-gray-500"> studenti</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-green-600 font-medium">{stats.totalGames}</span>
                        <span className="text-gray-500"> partite</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-purple-600 font-medium">{stats.avgScore}</span>
                        <span className="text-gray-500"> punti medi</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleDeleteClass(classData.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
                    >
                      🗑️ Elimina
                    </Button>
                  </div>
                </div>

                {/* Students in Class */}
                {isSelected && (
                  <div className="mt-6 pl-4 border-l-2 border-blue-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Studenti della classe ({classStudents.length})
                    </h4>
                    {classStudents.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nessuno studente in questa classe</p>
                    ) : (
                      <div className="space-y-3">
                        {classStudents.map((student) => (
                          <div key={student.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{student.fullName}</span>
                                  <span className="text-sm text-gray-500">({student.nickname})</span>
                                  {student.requiresPassword && (
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                      🔒 Password
                                    </span>
                                  )}
                                </div>
                                {student.email && (
                                  <div className="text-sm text-gray-600 mt-1">{student.email}</div>
                                )}
                                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                  <span>📊 {student.statistics?.totalGames || 0} partite</span>
                                  <span>🏆 {student.statistics?.totalPoints || 0} punti</span>
                                  <span>🎯 {student.statistics?.correctAnswers || 0} risposte corrette</span>
                                  <span>📈 {student.statistics?.averageScore || 0}% media</span>
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Creato: {new Date(student.createdAt).toLocaleDateString('it-IT')}
                                </div>
                              </div>
                              <Button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                              >
                                🗑️
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {classes.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">🏫</div>
              <p>Nessuna classe creata ancora</p>
              <p className="text-sm">Clicca su "Nuova Classe" per iniziare</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Class Modal */}
      {showCreateClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Crea Nuova Classe</h3>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Classe *
                </label>
                <input
                  type="text"
                  value={newClass.name}
                  onChange={(e) => setNewClass({...newClass, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="es. 3A, 4B Scientifico, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrizione
                </label>
                <input
                  type="text"
                  value={newClass.description}
                  onChange={(e) => setNewClass({...newClass, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrizione opzionale della classe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Anno Accademico
                </label>
                <input
                  type="text"
                  value={newClass.academicYear}
                  onChange={(e) => setNewClass({...newClass, academicYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024/2025"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Crea Classe
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateClass(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Student Modal */}
      {showCreateStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Registra Nuovo Studente</h3>
            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname *
                </label>
                <input
                  type="text"
                  value={newStudent.nickname}
                  onChange={(e) => setNewStudent({...newStudent, nickname: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome utente per il gioco"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome e cognome dello studente"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe *
                </label>
                <select
                  value={newStudent.className}
                  onChange={(e) => setNewStudent({...newStudent, className: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleziona una classe</option>
                  {classes.map((classData) => (
                    <option key={classData.name} value={classData.name}>
                      {classData.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (opzionale)
                </label>
                <input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@studente.it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (opzionale)
                </label>
                <input
                  type="password"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Lascia vuoto per accesso libero"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se inserisci una password, lo studente dovrà inserirla per accedere
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Registra Studente
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateStudent(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}