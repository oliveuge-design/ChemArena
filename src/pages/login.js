import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import SimpleLabBackground from "@/components/SimpleLabBackground"
import toast from 'react-hot-toast'

export default function LoginPage() {
  // Evita errori SSR - controlla che siamo sul client PRIMA di useRouter
  if (typeof window === 'undefined') {
    return null
  }

  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  // Controlla se l'utente è già autenticato
  useEffect(() => {
    const savedAuth = localStorage.getItem('teacher-auth')
    if (savedAuth) {
      const teacher = JSON.parse(savedAuth)
      if (teacher.role === 'admin') {
        router.push('/dashboard')
      } else {
        router.push('/teacher-dashboard')
      }
    }
  }, [router])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Login attempt
      const response = await fetch('/api/teacher-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      // Process login response

      if (data.success) {
        // Salva i dati dell'insegnante
        localStorage.setItem('teacher-auth', JSON.stringify(data.teacher))
        
        toast.success(`Benvenuto/a ${data.teacher.name}! 🎉`)
        
        // Reindirizza in base al ruolo
        setTimeout(() => {
          if (data.teacher.role === 'admin') {
            router.push('/dashboard')
          } else {
            router.push('/teacher-dashboard')
          }
        }, 1000)
        
      } else {
        toast.error(data.error || 'Credenziali non valide')
      }
    } catch (error) {
      console.error('Errore login:', error)
      toast.error('Errore di connessione')
    }

    setLoading(false)
  }

  const isFormValid = formData.name && formData.password

  return (
    <>
      <SimpleLabBackground />
      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-10 flex items-center justify-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              CHEMARENA
            </h1>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Accesso Insegnanti ChemArena
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Entra con le tue credenziali
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Prof. Mario Rossi"
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="La tua password"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Accesso..." : "🚀 Accedi"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Non hai un account?{" "}
            <button
              onClick={() => router.push('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Registrati qui
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">ℹ️ Informazioni Accesso:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Utilizza il tuo nome completo e la password assegnata</p>
            <p>Per supporto contatta l'amministratore di sistema</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}