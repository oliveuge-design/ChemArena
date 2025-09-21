import { useState, useEffect } from 'react'
import Button from '@/components/Button'
import ClassStatistics from './ClassStatistics'

export default function ClassManager() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [selectedClass, setSelectedClass] = useState(null)
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showCreateStudent, setShowCreateStudent] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [showClassStats, setShowClassStats] = useState(false)
  const [selectedClassForStats, setSelectedClassForStats] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [filterTeacher, setFilterTeacher] = useState('')
  const [sortBy, setSortBy] = useState('name') // name, students, games, score
  const [selectedStudents, setSelectedStudents] = useState([])
  const [bulkMode, setBulkMode] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Form states enhanced
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    school: '',
    academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
    teachers: [],
    settings: {
      requiresPassword: false,
      allowAnonymous: true,
      trackStats: true,
      autoEnrollment: true
    }
  })

  const [newStudent, setNewStudent] = useState({
    nickname: '',
    fullName: '',
    email: '',
    classes: [], // Many-to-Many
    teacherEmails: [],
    password: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh ogni 30 secondi se abilitato
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      loadData()
      setLastRefresh(new Date())
    }, 30000) // 30 secondi

    return () => clearInterval(interval)
  }, [autoRefresh])

  const loadData = async () => {
    setLoading(true)
    try {
      // Carica classi enhanced
      const classesRes = await fetch('/api/classes?action=list')
      const classesData = await classesRes.json()

      // Carica studenti enhanced
      const studentsRes = await fetch('/api/students?action=list')
      const studentsData = await studentsRes.json()

      // Carica teachers per select
      const teachersRes = await fetch('/api/teachers')
      const teachersData = await teachersRes.json()

      setClasses(classesData.classes || [])
      setStudents(studentsData.students || [])
      setTeachers(teachersData.teachers || [])
    } catch (error) {
      console.error('Errore caricamento dati enhanced:', error)
      setError('Errore nel caricamento dei dati enhanced')
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
        body: JSON.stringify(newClass)
      })

      const data = await response.json()

      if (data.class) {
        setClasses([...classes, data.class])
        setNewClass({
          name: '',
          description: '',
          school: '',
          academicYear: new Date().getFullYear() + '/' + (new Date().getFullYear() + 1),
          teachers: [],
          settings: {
            requiresPassword: false,
            allowAnonymous: true,
            trackStats: true,
            autoEnrollment: true
          }
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

  const handleDeleteStudent = (studentId) => {
    const student = students.find(s => s.id === studentId)
    setStudentToDelete(student)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return

    try {
      const response = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          studentId: studentToDelete.id
        })
      })

      const data = await response.json()

      if (data.success) {
        setStudents(students.filter(s => s.id !== studentToDelete.id))
        setShowDeleteConfirm(false)
        setStudentToDelete(null)
        setError('')
        loadData() // Ricarica i dati per aggiornare le statistiche
      } else {
        setError(data.error || 'Errore nella eliminazione dello studente')
      }
    } catch (error) {
      console.error('Errore eliminazione studente:', error)
      setError('Errore di connessione')
    }
  }

  const handleEditStudent = (student) => {
    setEditingStudent({
      ...student,
      originalNickname: student.nickname // Per identificare lo studente durante l'update
    })
    setShowEditStudent(true)
  }

  const handleUpdateStudent = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          studentId: editingStudent.id,
          updateData: {
            nickname: editingStudent.nickname,
            fullName: editingStudent.fullName,
            email: editingStudent.email,
            classes: editingStudent.classes || [editingStudent.className], // Fallback per compatibility
            teachers: editingStudent.teachers || [] // Nuovo campo teachers
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        // Aggiorna la lista studenti
        setStudents(students.map(s =>
          s.id === editingStudent.id ? { ...s, ...data.student } : s
        ))
        setShowEditStudent(false)
        setEditingStudent(null)
        setError('')
        console.log('✅ Studente aggiornato:', data.student.nickname)
      } else {
        setError(data.error || 'Errore nell\'aggiornamento dello studente')
      }
    } catch (error) {
      console.error('Errore aggiornamento studente:', error)
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

  // Funzioni per filtering e sorting
  const getFilteredAndSortedClasses = () => {
    let filteredClasses = [...classes]

    // Filtro per ricerca testuale
    if (searchTerm) {
      filteredClasses = filteredClasses.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.school.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro per teacher
    if (filterTeacher) {
      filteredClasses = filteredClasses.filter(cls =>
        cls.teachers && cls.teachers.some(t =>
          typeof t === 'string' ? t === filterTeacher : t.id === filterTeacher
        )
      )
    }

    // Sorting
    filteredClasses.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'students':
          return (b.studentsCount || 0) - (a.studentsCount || 0)
        case 'games':
          return (b.totalGames || 0) - (a.totalGames || 0)
        case 'score':
          return (b.averageScore || 0) - (a.averageScore || 0)
        default:
          return 0
      }
    })

    return filteredClasses
  }

  const getFilteredStudents = () => {
    let filteredStudents = [...students]

    // Filtro per ricerca testuale
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filtro per classe
    if (filterClass) {
      filteredStudents = filteredStudents.filter(student =>
        (student.classes && student.classes.includes(filterClass)) ||
        student.className === filterClass
      )
    }

    // Filtro per teacher
    if (filterTeacher) {
      filteredStudents = filteredStudents.filter(student =>
        student.teachers && student.teachers.includes(filterTeacher)
      )
    }

    return filteredStudents
  }

  // Funzioni per operazioni di massa
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    const allVisibleStudents = getFilteredStudents().map(s => s.id)
    setSelectedStudents(allVisibleStudents)
  }

  const deselectAllStudents = () => {
    setSelectedStudents([])
  }

  const bulkDeleteStudents = async () => {
    if (!selectedStudents.length) return

    const confirmMsg = `Sei sicuro di voler eliminare ${selectedStudents.length} studenti selezionati?\n\nQuesta azione non può essere annullata.`
    if (!confirm(confirmMsg)) return

    try {
      const promises = selectedStudents.map(studentId =>
        fetch('/api/students', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            studentId: studentId
          })
        })
      )

      await Promise.all(promises)

      // Rimuovi studenti eliminati dallo stato
      setStudents(students.filter(s => !selectedStudents.includes(s.id)))
      setSelectedStudents([])
      setBulkMode(false)
      setError('')
      loadData() // Ricarica per aggiornare statistiche

    } catch (error) {
      console.error('Errore eliminazione multipla:', error)
      setError('Errore durante l\'eliminazione multipla')
    }
  }

  const bulkMoveToClass = async (targetClassId) => {
    if (!selectedStudents.length || !targetClassId) return

    try {
      const promises = selectedStudents.map(studentId => {
        const student = students.find(s => s.id === studentId)
        if (!student) return Promise.resolve()

        const newClasses = student.classes ? [...student.classes] : [student.className]
        if (!newClasses.includes(targetClassId)) {
          newClasses.push(targetClassId)
        }

        return fetch('/api/students', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            studentId: studentId,
            updateData: { classes: newClasses }
          })
        })
      })

      await Promise.all(promises)
      setSelectedStudents([])
      setBulkMode(false)
      setError('')
      loadData()

    } catch (error) {
      console.error('Errore spostamento multiplo:', error)
      setError('Errore durante lo spostamento multiplo')
    }
  }

  // Funzioni per CSV Export
  const generateStudentCSV = (studentsData) => {
    const headers = [
      'ID',
      'Nickname',
      'Nome Completo',
      'Email',
      'Classi',
      'Teachers',
      'Partite Giocate',
      'Punti Totali',
      'Media Punteggio',
      'Risposte Corrette',
      'Data Creazione',
      'Attivo'
    ]

    const rows = studentsData.map(student => [
      student.id,
      student.nickname,
      student.fullName,
      student.email || '',
      (student.classes ? student.classes.join('; ') : student.className) || '',
      student.teachers ? student.teachers.join('; ') : '',
      student.statistics?.totalGames || 0,
      student.statistics?.totalPoints || 0,
      student.statistics?.averageScore || 0,
      student.statistics?.correctAnswers || 0,
      new Date(student.createdAt).toLocaleDateString('it-IT'),
      student.isActive ? 'Sì' : 'No'
    ])

    return [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const generateClassCSV = (classesData) => {
    const headers = [
      'ID',
      'Nome Classe',
      'Descrizione',
      'Scuola',
      'Anno Accademico',
      'Numero Studenti',
      'Numero Teachers',
      'Partite Totali',
      'Punti Totali',
      'Media Punteggio',
      'Teachers',
      'Data Creazione',
      'Attiva'
    ]

    const rows = classesData.map(cls => [
      cls.id,
      cls.name,
      cls.description,
      cls.school,
      cls.academicYear,
      cls.studentsCount || 0,
      cls.teachersCount || 0,
      cls.totalGames || 0,
      cls.totalPoints || 0,
      cls.averageScore || 0,
      cls.teachers ? cls.teachers.map(t => typeof t === 'string' ? t : t.name).join('; ') : '',
      new Date(cls.createdAt).toLocaleDateString('it-IT'),
      cls.isActive ? 'Sì' : 'No'
    ])

    return [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
  }

  const generateCompleteReport = () => {
    const studentCSV = generateStudentCSV(students)
    const classCSV = generateClassCSV(classes)

    const reportContent = `REPORT COMPLETO GESTIONE CLASSI - ${new Date().toLocaleDateString('it-IT')}

========================
STATISTICHE GENERALI
========================
Totale Classi: ${classes.length}
Totale Studenti: ${students.length}
Totale Teachers: ${teachers.length}
Partite Totali: ${students.reduce((sum, s) => sum + (s.statistics?.totalGames || 0), 0)}
Punti Totali: ${students.reduce((sum, s) => sum + (s.statistics?.totalPoints || 0), 0)}

========================
DATI CLASSI
========================
${classCSV}

========================
DATI STUDENTI
========================
${studentCSV}
`

    return reportContent
  }

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
            {/* Auto-refresh controls */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-refresh</span>
              </label>
              <div className="text-xs text-gray-500">
                Ultimo: {lastRefresh.toLocaleTimeString()}
              </div>
              <Button
                onClick={() => {loadData(); setLastRefresh(new Date())}}
                className="text-xs bg-gray-500 hover:bg-gray-600 px-2 py-1"
              >
                🔄
              </Button>
            </div>
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
            <div className="relative">
              <Button
                onClick={() => {
                  const csv = generateStudentCSV(students)
                  downloadCSV(csv, `tutti-studenti-${new Date().toISOString().split('T')[0]}.csv`)
                }}
                className="bg-purple-500 hover:bg-purple-600"
              >
                📁 Esporta Studenti
              </Button>
            </div>
            <div className="relative">
              <Button
                onClick={() => {
                  const csv = generateClassCSV(classes)
                  downloadCSV(csv, `tutte-classi-${new Date().toISOString().split('T')[0]}.csv`)
                }}
                className="bg-orange-500 hover:bg-orange-600"
              >
                📋 Esporta Classi
              </Button>
            </div>
            <div className="relative">
              <Button
                onClick={() => {
                  const report = generateCompleteReport()
                  downloadCSV(report, `report-completo-${new Date().toISOString().split('T')[0]}.txt`)
                }}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                📊 Report Completo
              </Button>
            </div>
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

          {/* Search and Filter Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔍 Ricerca
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cerca classi, studenti, scuole..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Filter by Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🏫 Filtra per Classe
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tutte le classi</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentsCount} studenti)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👨‍🏫 Filtra per Insegnante
                </label>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tutti gli insegnanti</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📊 Ordina per
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="name">Nome A-Z</option>
                  <option value="students">Più Studenti</option>
                  <option value="games">Più Partite</option>
                  <option value="score">Punteggio Migliore</option>
                </select>
              </div>
            </div>

            {/* Bulk Operations Toggle */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkMode}
                    onChange={(e) => {
                      setBulkMode(e.target.checked)
                      if (!e.target.checked) {
                        setSelectedStudents([])
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    📋 Modalità Selezione Multipla
                  </span>
                </label>

                {bulkMode && (
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={selectAllStudents}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                    >
                      ✅ Seleziona Tutti
                    </Button>
                    <Button
                      onClick={deselectAllStudents}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
                    >
                      ❌ Deseleziona
                    </Button>
                    {selectedStudents.length > 0 && (
                      <Button
                        onClick={() => setShowBulkActions(!showBulkActions)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 text-sm"
                      >
                        ⚙️ Azioni ({selectedStudents.length})
                      </Button>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Clear Filters */}
            {(searchTerm || filterClass || filterTeacher || sortBy !== 'name') && (
              <div className="mt-3 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Filtri attivi: {[
                    searchTerm && `Ricerca: "${searchTerm}"`,
                    filterClass && `Classe: ${classes.find(c => c.id === filterClass)?.name}`,
                    filterTeacher && `Teacher: ${teachers.find(t => t.id === filterTeacher)?.name}`,
                    sortBy !== 'name' && `Ordinamento: ${sortBy}`
                  ].filter(Boolean).join(', ')}
                </div>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setFilterClass('')
                    setFilterTeacher('')
                    setSortBy('name')
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
                >
                  🗑️ Cancella Filtri
                </Button>
              </div>
            )}

            {/* Bulk Actions Panel */}
            {bulkMode && showBulkActions && selectedStudents.length > 0 && (
              <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-3">
                  ⚙️ Azioni per {selectedStudents.length} studenti selezionati
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Elimina Multipla */}
                  <Button
                    onClick={bulkDeleteStudents}
                    className="bg-red-500 hover:bg-red-600 text-white w-full"
                  >
                    🗑️ Elimina Selezionati
                  </Button>

                  {/* Sposta a Classe */}
                  <div>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          bulkMoveToClass(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    >
                      <option value="">🏫 Aggiungi a Classe...</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Export Selezionati */}
                  <Button
                    onClick={() => {
                      const selectedStudentData = students.filter(s => selectedStudents.includes(s.id))
                      const csv = generateStudentCSV(selectedStudentData)
                      downloadCSV(csv, `studenti-selezionati-${new Date().toISOString().split('T')[0]}.csv`)
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white w-full"
                  >
                    📁 Esporta Selezionati
                  </Button>
                </div>
              </div>
            )}
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
          <h2 className="text-lg font-semibold text-gray-900">
            Classi ({getFilteredAndSortedClasses().length}{getFilteredAndSortedClasses().length !== classes.length ? ` di ${classes.length}` : ''})
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {getFilteredAndSortedClasses().map((classData) => {
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
                      onClick={() => {
                        setSelectedClassForStats(classData)
                        setShowClassStats(true)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm"
                    >
                      📊 Statistiche
                    </Button>
                    <Button
                      onClick={() => {
                        const classStudents = getFilteredStudents().filter(s =>
                          (s.classes && s.classes.includes(classData.id)) || s.className === classData.name
                        )
                        const csv = generateStudentCSV(classStudents)
                        downloadCSV(csv, `studenti-${classData.name}-${new Date().toISOString().split('T')[0]}.csv`)
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm"
                    >
                      📁 Esporta
                    </Button>
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
                        {getFilteredStudents().filter(s =>
                          (s.classes && s.classes.includes(classData.id)) || s.className === classData.name
                        ).map((student) => (
                          <div key={student.id} className={`bg-gray-50 rounded-lg p-4 ${selectedStudents.includes(student.id) ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-start space-x-3">
                                {/* Checkbox per selezione multipla */}
                                {bulkMode && (
                                  <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student.id)}
                                    onChange={() => toggleStudentSelection(student.id)}
                                    className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                  />
                                )}
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
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleEditStudent(student)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
                                >
                                  ✏️
                                </Button>
                                <Button
                                  onClick={() => handleDeleteStudent(student.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                                >
                                  🗑️
                                </Button>
                              </div>
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

      {/* Edit Student Modal */}
      {showEditStudent && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">✏️ Modifica Studente</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nickname *
                </label>
                <input
                  type="text"
                  value={editingStudent.nickname}
                  onChange={(e) => setEditingStudent({...editingStudent, nickname: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome utente per il gioco"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Il nickname sarà utilizzato per accedere ai giochi
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({...editingStudent, fullName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome e cognome dello studente"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editingStudent.email || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@studente.it"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📚 Classi Assegnate
                </label>
                <select
                  multiple
                  value={editingStudent.classes || [editingStudent.className] || []}
                  onChange={(e) => {
                    const selectedClasses = Array.from(e.target.selectedOptions, option => option.value)
                    setEditingStudent({...editingStudent, classes: selectedClasses})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="3"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.studentsCount} studenti)
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tieni premuto Ctrl/Cmd per selezionare più classi
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👨‍🏫 Teachers Assegnati
                </label>
                <select
                  multiple
                  value={editingStudent.teachers || []}
                  onChange={(e) => {
                    const selectedTeachers = Array.from(e.target.selectedOptions, option => option.value)
                    setEditingStudent({...editingStudent, teachers: selectedTeachers})
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  size="3"
                >
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Seleziona i teachers per questo studente
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Informazioni
                </label>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>📊 {editingStudent.statistics?.totalGames || 0} partite giocate</div>
                  <div>🏆 {editingStudent.statistics?.totalPoints || 0} punti totali</div>
                  <div>📈 {editingStudent.statistics?.averageScore || 0}% media punteggio</div>
                  <div>📅 Creato: {new Date(editingStudent.createdAt).toLocaleDateString('it-IT')}</div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  💾 Salva Modifiche
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditStudent(false)
                    setEditingStudent(null)
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Statistiche Classe */}
      {showClassStats && selectedClassForStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">📊 Statistiche Classe</h3>
              <Button
                onClick={() => {
                  setShowClassStats(false)
                  setSelectedClassForStats(null)
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
              >
                ✕ Chiudi
              </Button>
            </div>
            <div className="p-6">
              <ClassStatistics classData={selectedClassForStats} />
            </div>
          </div>
        </div>
      )}

      {/* Modal Conferma Eliminazione Studente */}
      {showDeleteConfirm && studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Conferma Eliminazione Studente
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-3">
                  Sei sicuro di voler eliminare definitivamente questo studente?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <div className="font-medium text-red-800 mb-2">👤 {studentToDelete.fullName}</div>
                  <div className="text-sm text-red-700 space-y-1">
                    <div>🎮 Nickname: <span className="font-medium">{studentToDelete.nickname}</span></div>
                    <div>📧 Email: <span className="font-medium">{studentToDelete.email || 'Non specificata'}</span></div>
                    <div>🏫 Classi: <span className="font-medium">
                      {studentToDelete.classes ? studentToDelete.classes.join(', ') : studentToDelete.className || 'Nessuna'}
                    </span></div>
                    <div>📊 Partite giocate: <span className="font-medium">{studentToDelete.statistics?.totalGames || 0}</span></div>
                    <div>🏆 Punti totali: <span className="font-medium">{studentToDelete.statistics?.totalPoints || 0}</span></div>
                  </div>
                </div>
                <p className="text-xs text-red-600 mt-3 font-medium">
                  ⚠️ Questa azione non può essere annullata. Tutti i dati e le statistiche del giocatore saranno persi definitivamente.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setStudentToDelete(null)
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2"
                >
                  ❌ Annulla
                </Button>
                <Button
                  onClick={confirmDeleteStudent}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
                >
                  🗑️ Elimina Definitivamente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}