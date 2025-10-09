import { useState } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subject: '',
    acceptPrivacy: false
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validazione password coincidenti
    if (formData.password !== formData.confirmPassword) {
      toast.error('Le password non coincidono')
      return
    }

    // Validazione accettazione privacy
    if (!formData.acceptPrivacy) {
      toast.error('Devi accettare l\'informativa sulla privacy')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/teacher-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          subject: formData.subject
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('🎉 Registrazione completata con successo!')
        
        // Salva l'insegnante registrato nel localStorage per l'autenticazione
        localStorage.setItem('teacher-auth', JSON.stringify(data.teacher))
        
        // Reindirizza alla dashboard degli insegnanti (limitata)
        setTimeout(() => {
          router.push('/teacher-dashboard')
        }, 1000)
      } else {
        toast.error(data.error || 'Errore durante la registrazione')
      }
    } catch (error) {
      console.error('Errore registrazione:', error)
      toast.error('Errore di connessione')
    }

    setLoading(false)
  }

  const isFormValid = formData.name.length >= 2 && 
                     formData.email && 
                     formData.password.length >= 6 && 
                     formData.confirmPassword && 
                     formData.subject && 
                     formData.password === formData.confirmPassword &&
                     formData.acceptPrivacy

  // Evita errori SSR - controlla che siamo sul client
  if (typeof window === 'undefined') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-10 flex items-center justify-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              CHEMARENA
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Registrazione Insegnante ChemArena
          </h1>
          <p className="text-gray-600 text-sm mt-2">
            Crea il tuo account per accedere ai quiz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es. Prof. Mario Rossi"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email istituzionale *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="mario.rossi@scuola.edu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia di insegnamento *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Es. Matematica, Storia, Scienze..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min. 6 caratteri, 1 maiuscola, 1 numero"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conferma Password *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ripeti la password"
              required
            />
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptPrivacy"
              checked={formData.acceptPrivacy}
              onChange={(e) => handleInputChange('acceptPrivacy', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="acceptPrivacy" className="text-sm text-gray-700">
              <span className="text-red-500">*</span> Accetto l'{""}
              <a 
                href="/privacy-policy" 
                target="_blank"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                informativa sulla privacy
              </a>{""} e autorizzo il trattamento dei miei dati personali per le finalità indicate.
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-500 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? "Registrazione..." : "🚀 Registrati"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hai già un account?{" "}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Accedi qui
            </button>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">✨ Cosa potrai fare:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Accedere a tutti i quiz scientifici disponibili</li>
            <li>• Lanciare giochi per le tue classi</li>
            <li>• Gestire i giocatori in tempo reale</li>
            <li>• Visualizzare statistiche dei giochi</li>
          </ul>
        </div>
      </div>
    </div>
  )
}