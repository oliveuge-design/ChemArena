import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Button from "@/components/Button"

export default function PrivacyPolicyPage() {
  // Evita errori SSR - controlla che siamo sul client PRIMA di useRouter
  if (typeof window === 'undefined') {
    return null
  }

  const router = useRouter()
  const [showTOC, setShowTOC] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setShowTOC(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="cursor-pointer h-6 flex items-center"
              onClick={() => router.push('/')}
            >
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                CHEMARENA
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Informativa Privacy</h1>
              <p className="text-sm text-gray-600">Ultimo aggiornamento: 11 settembre 2025</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowTOC(!showTOC)}
              className="hidden md:flex bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg text-sm font-medium"
            >
              📋 Indice
            </Button>
            <Button
              onClick={() => router.back()}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium"
            >
              ← Torna indietro
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex gap-8">
        {/* Indice laterale */}
        {(showTOC || isLargeScreen) && (
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">📋 Indice</h3>
              <nav className="space-y-2 text-sm">
                <button onClick={() => scrollToSection('generale')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">📋 Informazioni Generali</button>
                <button onClick={() => scrollToSection('dati')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">🎯 Dati Raccolti</button>
                <button onClick={() => scrollToSection('base-giuridica')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">⚖️ Base Giuridica</button>
                <button onClick={() => scrollToSection('finalita')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">🎯 Finalità</button>
                <button onClick={() => scrollToSection('trattamento')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">🏢 Modalità Trattamento</button>
                <button onClick={() => scrollToSection('comunicazione')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">👥 Comunicazione Dati</button>
                <button onClick={() => scrollToSection('conservazione')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">⏰ Conservazione</button>
                <button onClick={() => scrollToSection('diritti')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">🛡️ Diritti</button>
                <button onClick={() => scrollToSection('sicurezza')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">🛡️ Sicurezza</button>
                <button onClick={() => scrollToSection('contatti')} className="block text-left text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded w-full">📞 Contatti</button>
              </nav>
            </div>
          </div>
        )}

        {/* Contenuto principale */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm">
            {/* Alert importante */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-t-xl">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>🔒 La tua privacy è importante</strong> - Leggi attentamente questa informativa per comprendere come gestiamo i tuoi dati personali.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 prose max-w-none">
              {/* Informazioni Generali */}
              <section id="generale" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  📋 Informazioni Generali
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Titolare del Trattamento:</strong> ChemArena Educational Platform</p>
                  <p><strong>Contatti:</strong> admin@chemarena.edu</p>
                  <p><strong>Finalità:</strong> Sistema educativo per quiz interattivi</p>
                </div>
              </section>

              {/* Dati Raccolti */}
              <section id="dati" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🎯 Dati Raccolti durante la Registrazione
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Dati Obbligatori</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Nome completo</li>
                      <li>• Email istituzionale</li>
                      <li>• Password (crittografata)</li>
                      <li>• Materia di insegnamento</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🔄 Dati Automatici</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Data registrazione</li>
                      <li>• Ultimo accesso</li>
                      <li>• ID univoco generato</li>
                      <li>• Accettazione privacy</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Base Giuridica */}
              <section id="base-giuridica" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  ⚖️ Base Giuridica del Trattamento
                </h2>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800">
                    Il trattamento è basato su <strong>consenso esplicito</strong> (Art. 6 GDPR) e <strong>esecuzione di servizi educativi</strong> richiesti.
                  </p>
                </div>
              </section>

              {/* Finalità */}
              <section id="finalita" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🎯 Finalità del Trattamento
                </h2>
                
                <div className="grid gap-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">✅ Utilizziamo i dati per:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Autenticazione e accesso sicuro</li>
                      <li>• Gestione account e preferenze</li>
                      <li>• Erogazione servizi educativi</li>
                      <li>• Statistiche aggregate anonime</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">❌ NON utilizziamo i dati per:</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Marketing commerciale</li>
                      <li>• Profilazione pubblicitaria</li>
                      <li>• Cessione a terze parti</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Sicurezza */}
              <section id="sicurezza" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🛡️ Sicurezza dei Dati
                </h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🔒 Misure di Sicurezza:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                    <div>
                      <p><strong>Tecniche:</strong></p>
                      <ul className="space-y-1">
                        <li>• Password crittografate</li>
                        <li>• Controlli accesso ruoli</li>
                        <li>• Validazione rigorosa input</li>
                      </ul>
                    </div>
                    <div>
                      <p><strong>Organizzative:</strong></p>
                      <ul className="space-y-1">
                        <li>• Accesso limitato personale</li>
                        <li>• Backup sicuri</li>
                        <li>• Monitoraggio attività</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Diritti */}
              <section id="diritti" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  🛡️ I Tuoi Diritti
                </h2>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Secondo il GDPR, hai diritto a:</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
                    <div>
                      <ul className="space-y-1">
                        <li>📋 <strong>Accesso:</strong> Conoscere i tuoi dati</li>
                        <li>✏️ <strong>Rettifica:</strong> Correggere dati inesatti</li>
                        <li>🗑️ <strong>Cancellazione:</strong> Eliminare l'account</li>
                        <li>🚫 <strong>Limitazione:</strong> Limitare trattamenti</li>
                      </ul>
                    </div>
                    <div>
                      <ul className="space-y-1">
                        <li>📤 <strong>Portabilità:</strong> Ricevere i dati</li>
                        <li>⚠️ <strong>Opposizione:</strong> Opporti ai trattamenti</li>
                        <li>📝 <strong>Revoca:</strong> Ritirare il consenso</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-purple-100 rounded">
                    <p className="font-medium text-purple-800">📧 Per esercitare i tuoi diritti:</p>
                    <p className="text-purple-700">Contatta: <strong>admin@chemarena.edu</strong></p>
                    <p className="text-purple-700">Risposta entro: <strong>30 giorni</strong></p>
                  </div>
                </div>
              </section>

              {/* Contatti */}
              <section id="contatti" className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  📞 Contatti e Reclami
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Titolare del Trattamento</h4>
                      <p className="text-gray-600">📧 Email: admin@chemarena.edu</p>
                      <p className="text-gray-600">⏱️ Risposta: Entro 72 ore</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Autorità di Controllo</h4>
                      <p className="text-gray-600">🏛️ Garante Privacy</p>
                      <p className="text-gray-600">🌐 www.gpdp.it</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Consenso */}
              <section className="mb-8">
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">✅ Consenso Informato</h3>
                  <p className="text-green-700 text-sm">
                    Registrandoti accetti questa informativa e autorizzi il trattamento dei tuoi dati per le finalità educative indicate. 
                    Puoi revocare il consenso in qualsiasi momento contattandoci.
                  </p>
                </div>
              </section>
            </div>

            {/* Footer documento */}
            <div className="bg-gray-50 px-8 py-4 rounded-b-xl border-t">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <p>🎓 <strong>CHEMARENA</strong> - Privacy First Education</p>
                <p>Ultimo aggiornamento: <strong>11 settembre 2025</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulsanti azioni rapide mobile */}
      <div className="lg:hidden fixed bottom-4 right-4 space-y-2">
        <Button
          onClick={() => setShowTOC(!showTOC)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          📋
        </Button>
      </div>

      {/* Overlay mobile per indice */}
      {showTOC && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowTOC(false)}>
          <div className="bg-white m-4 rounded-xl p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">📋 Indice</h3>
              <button onClick={() => setShowTOC(false)} className="text-gray-500">✕</button>
            </div>
            <nav className="space-y-2 text-sm">
              <button onClick={() => scrollToSection('generale')} className="block text-left text-blue-600 hover:bg-blue-50 px-2 py-2 rounded w-full">📋 Informazioni Generali</button>
              <button onClick={() => scrollToSection('dati')} className="block text-left text-blue-600 hover:bg-blue-50 px-2 py-2 rounded w-full">🎯 Dati Raccolti</button>
              <button onClick={() => scrollToSection('finalita')} className="block text-left text-blue-600 hover:bg-blue-50 px-2 py-2 rounded w-full">🎯 Finalità</button>
              <button onClick={() => scrollToSection('diritti')} className="block text-left text-blue-600 hover:bg-blue-50 px-2 py-2 rounded w-full">🛡️ I Tuoi Diritti</button>
              <button onClick={() => scrollToSection('contatti')} className="block text-left text-blue-600 hover:bg-blue-50 px-2 py-2 rounded w-full">📞 Contatti</button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}