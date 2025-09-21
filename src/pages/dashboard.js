import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/router"
import dynamic from "next/dynamic"
import Button from "@/components/Button"
import { DashboardProvider, useDashboard } from "@/context/DashboardContext"

// Lazy loading per componenti pesanti (>500 righe)
const ClassManager = dynamic(() => import("@/components/dashboard/ClassManager"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>
})
const SmartGameLauncherLazy = dynamic(() => import("@/components/dashboard/SmartGameLauncher"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-80 rounded-lg"></div>
})
const QuizArchiveManager = dynamic(() => import("@/components/dashboard/QuizArchiveManager"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>
})
const QuizCreator = dynamic(() => import("@/components/dashboard/QuizCreator"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>
})
const ThemeCustomizer = dynamic(() => import("@/components/dashboard/ThemeCustomizer"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-64 rounded-lg"></div>
})
const AIQuizGeneratorStatic = dynamic(() => import("@/components/dashboard/AIQuizGeneratorStatic"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>
})
const GoogleSheetsImport = dynamic(() => import("@/components/dashboard/GoogleSheetsImport"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-64 rounded-lg"></div>
})
const AnalyticsDashboard = dynamic(() => import("@/components/dashboard/AnalyticsDashboard"), {
  loading: () => <div className="animate-pulse bg-gray-700 h-96 rounded-lg"></div>
})

// Import sincroni per componenti leggeri (<300 righe)
import QuizManager from "@/components/dashboard/QuizManager"
import Statistics from "@/components/dashboard/Statistics"
// SmartGameLauncher ora lazy-loaded come SmartGameLauncherLazy
import ServerControls from "@/components/dashboard/ServerControls"
import SystemRestart from "@/components/SystemRestart"
import TeachersList from "@/components/dashboard/TeachersList"

// Component interno che usa il context
function DashboardContent() {
  const router = useRouter()
  const {
    activeTab,
    setActiveTab,
    isAuthenticated,
    setAuthentication,
    isLoading,
    setLoading,
    editingQuiz,
    setEditingQuiz,
    clearEditingQuiz
  } = useDashboard()

  const [password, setPassword] = useState("")

  // Controlla se l'utente era già autenticato (per mantenere la sessione)
  useEffect(() => {
    // Controlla prima l'autenticazione insegnante
    const savedTeacher = localStorage.getItem('teacher-auth')
    if (savedTeacher) {
      try {
        const teacherData = JSON.parse(savedTeacher)
        
        // Solo Admin (Eugenio Oliva) può accedere alla dashboard completa
        if (teacherData.role === 'admin' && teacherData.name === 'Eugenio Oliva') {
          setAuthentication(true, teacherData)
          return
        } else {
          // Insegnanti normali vengono reindirizzati alla loro dashboard
          router.push('/teacher-dashboard')
          return
        }
      } catch (error) {
        console.error('Errore parsing teacher data:', error)
      }
    }

    // Fallback al vecchio sistema di autenticazione (per compatibilità)
    const savedAuth = localStorage.getItem('dashboard-auth')
    if (savedAuth === 'true') {
      setAuthentication(true)
    }

    // Controlla se c'è un tab specificato nella query string
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    if (tabParam && ['archive', 'quizzes', 'create', 'ai-generator', 'launch', 'analytics', 'statistics', 'teachers', 'classes', 'import', 'server', 'themes'].includes(tabParam)) {
      setActiveTab(tabParam)
    }

    // Event listener per cambiare tab da altri componenti
    const handleTabChange = (event) => {
      setActiveTab(event.detail)
    }

    window.addEventListener('setDashboardTab', handleTabChange)
    return () => window.removeEventListener('setDashboardTab', handleTabChange)
  }, [])

  const handleAuth = useCallback(async (e) => {
    if (e) e.preventDefault()
    setLoading(true)

    // Simula un piccolo delay per mostrare il loading
    await new Promise(resolve => setTimeout(resolve, 500))

    // Admin authentication attempt
    // Controlla prima se esiste un admin con questa password
    try {
      const response = await fetch('/api/teacher-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@chemarena.edu',
          password: password.trim()
        })
      })

      const data = await response.json()

      if (data.success && data.teacher.role === 'admin' && data.teacher.name === 'Eugenio Oliva') {
        setAuthentication(true, data.teacher)
        localStorage.setItem('teacher-auth', JSON.stringify(data.teacher))
        localStorage.setItem('dashboard-auth', 'true') // Mantieni compatibilità
        console.log("Accesso Admin autorizzato per Eugenio Oliva")
      } else {
        // Fallback al vecchio sistema per compatibilità
        if (password.trim() === "admin123") {
          setAuthentication(true)
          localStorage.setItem('dashboard-auth', 'true')
          console.log("Accesso autorizzato (fallback)")
        } else {
          alert("Password Admin non corretta.")
          console.log("Accesso negato")
        }
      }
    } catch (error) {
      console.error('Errore autenticazione:', error)
      // Fallback al vecchio sistema
      if (password.trim() === "admin123") {
        setAuthentication(true)
        localStorage.setItem('dashboard-auth', 'true')
        console.log("Accesso autorizzato (fallback)")
      } else {
        alert("Password non corretta.")
      }
    }

    setLoading(false)
  }, [password]) // Dipende da password - si aggiorna solo quando cambia

  // Memoizza funzioni per evitare re-creazione ad ogni render
  const handleGoHome = useCallback(() => {
    console.log("Reindirizzamento alla home") // Debug
    router.push('/')
  }, [router])

  const quickRestartServer = useCallback(async () => {
    if (!confirm('Vuoi riavviare il server socket?\n\nQuesto applicherà tutte le modifiche ai quiz.')) return

    try {
      const response = await fetch('/api/restart-server', { method: 'POST' })
      const data = await response.json()

      if (data.success) {
        alert('✅ Server riavviato con successo!')
      } else {
        alert('❌ Errore: ' + data.message)
      }
    } catch (error) {
      alert('❌ Errore di connessione durante il riavvio.')
    }
  }, []) // Nessuna dipendenza - funzione stabile

  const handleEditQuiz = useCallback((quiz) => {
    console.log("Modifica quiz:", quiz) // Debug
    setEditingQuiz(quiz) // Context gestisce automaticamente il cambio tab
  }, [setEditingQuiz])

  const handleClearEdit = useCallback(() => {
    clearEditingQuiz()
  }, [clearEditingQuiz])

  // Memoizza tabs (non cambiano mai durante il ciclo di vita)
  const tabs = useMemo(() => [
    { id: 'archive', name: 'Archivio Quiz', icon: '📚' },
    { id: 'quizzes', name: 'I Miei Quiz', icon: '📝' },
    { id: 'create', name: 'Crea Quiz', icon: '➕' },
    { id: 'ai-generator', name: 'AI Quiz Generator', icon: '🤖' },
    { id: 'launch', name: 'Lancia Gioco', icon: '🚀' },
    { id: 'analytics', name: 'Analytics', icon: '🔬' },
    { id: 'themes', name: 'Personalizzazione', icon: '🎨' },
    { id: 'statistics', name: 'Statistiche', icon: '📊' },
    { id: 'teachers', name: 'Insegnanti', icon: '👥' },
    { id: 'classes', name: 'Gestione Classi', icon: '🏫' },
    { id: 'import', name: 'Import Google Sheets', icon: '📊' },
    { id: 'server', name: 'Server', icon: '⚙️' }
  ], []) // Empty dependency array - mai cambia

  if (!isAuthenticated) {
    return (
      <section className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="absolute h-full w-full overflow-hidden">
          <div className="absolute -left-[15vmin] -top-[15vmin] min-h-[75vmin] min-w-[75vmin] rounded-full bg-cyan-500/10"></div>
          <div className="absolute -bottom-[15vmin] -right-[15vmin] min-h-[75vmin] min-w-[75vmin] rotate-45 bg-pink-500/10"></div>
        </div>

        <div className="mb-6 h-32 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">CHEMARENA</h1>
        </div>
        <h1 className="mb-8 text-3xl font-bold text-white">Dashboard Admin</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative z-10">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Accesso Admin</h2>
          <p className="text-sm text-gray-600 mb-4">
            Solo per amministratori. Gli insegnanti possono accedere{" "}
            <button 
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              qui
            </button>
          </p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la password Admin"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth(e)}
              autoFocus
            />
            <Button 
              type="submit" 
              onClick={handleAuth} 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "🔄 Accesso..." : "Accedi alla Dashboard"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button 
              onClick={handleGoHome}
              className="text-blue-500 hover:text-blue-700 underline text-sm font-medium transition-colors"
              type="button"
            >
              ← Torna alla Home
            </button>
          </div>
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Accesso riservato agli amministratori di sistema</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3 flex items-center justify-center bg-gradient-to-r from-cyan-400 to-pink-400 rounded text-white font-bold text-sm">
                CA
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Dashboard ChemArena</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={quickRestartServer}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                type="button"
                title="Riavvia Server Socket"
              >
                🔄 Riavvia Server
              </button>
              <button 
                onClick={handleGoHome}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                type="button"
              >
                🎮 Vai al Gioco
              </button>
              <button 
                onClick={() => {
                  setIsAuthenticated(false)
                  localStorage.removeItem('dashboard-auth')
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                type="button"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'archive' && <QuizArchiveManager />}
          {activeTab === 'quizzes' && <QuizManager />}
          {activeTab === 'create' && <QuizCreator />}
          {activeTab === 'ai-generator' && <AIQuizGeneratorStatic />}
          {activeTab === 'launch' && <SmartGameLauncherLazy />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'themes' && <ThemeCustomizer />}
          {activeTab === 'statistics' && <Statistics />}
          {activeTab === 'teachers' && <TeachersList />}
          {activeTab === 'classes' && <ClassManager />}
          {activeTab === 'import' && <GoogleSheetsImport />}
          {activeTab === 'server' && (
            <div className="space-y-6">
              <ServerControls />
              <SystemRestart />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// Export principale con Provider wrapper
export default function Dashboard() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}