import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import GameLauncherSliderFixed from "@/components/dashboard/GameLauncherSliderFixed"
import QuizArchiveManager from "@/components/dashboard/QuizArchiveManager"
import Statistics from "@/components/dashboard/Statistics"
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  // Evita errori SSR - controlla che siamo sul client PRIMA di useRouter
  if (typeof window === 'undefined') {
    return null
  }

  const router = useRouter()
  const [activeTab, setActiveTab] = useState('launch')
  const [teacher, setTeacher] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verifica autenticazione e permessi
  useEffect(() => {
    const savedAuth = localStorage.getItem('teacher-auth')
    if (!savedAuth) {
      router.push('/login')
      return
    }

    try {
      const teacherData = JSON.parse(savedAuth)
      
      // Se è admin, reindirizza alla dashboard completa
      if (teacherData.role === 'admin') {
        router.push('/dashboard')
        return
      }

      // Solo insegnanti normali possono accedere
      if (teacherData.role !== 'teacher') {
        router.push('/login')
        return
      }

      setTeacher(teacherData)
      setIsLoading(false)
    } catch (error) {
      console.error('Errore parsing teacher data:', error)
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('teacher-auth')
    toast.success('Arrivederci! 👋')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento dashboard...</p>
        </div>
      </div>
    )
  }

  if (!teacher) {
    return null
  }

  const tabs = [
    {
      id: 'launch',
      label: '🚀 Lancia Gioco',
      description: 'Avvia un quiz per la tua classe'
    },
    {
      id: 'archive',
      label: '📚 Quiz Disponibili',
      description: 'Sfoglia i quiz da utilizzare'
    },
    {
      id: 'statistics',
      label: '📊 Statistiche',
      description: 'Visualizza i tuoi giochi passati'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  CHEMARENA
                </span>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Dashboard Insegnante ChemArena
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{teacher.name}</p>
                <p className="text-xs text-gray-500">{teacher.subject} • {teacher.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-sm"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold">
            Benvenuto/a, {teacher.name}! 🎉
          </h2>
          <p className="mt-1 text-blue-100">
            Dashboard per la gestione dei quiz • {teacher.subject}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            {tabs.find(t => t.id === activeTab)?.label}
          </h3>
          <p className="text-sm text-gray-500">
            {tabs.find(t => t.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {activeTab === 'launch' && (
            <div className="p-6">
              <GameLauncherSliderFixed />
            </div>
          )}
          
          {activeTab === 'archive' && (
            <div className="p-6">
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>ℹ️ Modalità Insegnante:</strong> Puoi utilizzare tutti i quiz disponibili 
                  ma non puoi creare o modificare quiz. Per funzionalità avanzate, 
                  contatta l'amministratore.
                </p>
              </div>
              <QuizArchiveManager readOnly={true} />
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="p-6">
              <Statistics />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">🎮 Gioco Veloce</h4>
            <p className="text-green-700 text-sm mb-3">
              Avvia subito un quiz dalla libreria
            </p>
            <Button
              onClick={() => setActiveTab('launch')}
              className="w-full bg-green-500 hover:bg-green-600 text-white text-sm"
            >
              Inizia Ora
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">📚 Esplora Quiz</h4>
            <p className="text-blue-700 text-sm mb-3">
              Sfoglia tutti i quiz disponibili
            </p>
            <Button
              onClick={() => setActiveTab('archive')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
            >
              Sfoglia
            </Button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">📊 I Tuoi Dati</h4>
            <p className="text-purple-700 text-sm mb-3">
              Controlla le statistiche dei tuoi giochi
            </p>
            <Button
              onClick={() => setActiveTab('statistics')}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white text-sm"
            >
              Visualizza
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}