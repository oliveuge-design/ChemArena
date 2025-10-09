import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import TronButton from '@/components/TronButton'
import PWAInstallButton from '@/components/PWAInstallButton'

export default function Home() {
  // Evita errori SSR - controlla che siamo sul client PRIMA di useRouter
  if (typeof window === 'undefined') {
    return null
  }

  const router = useRouter()
  const [showQuickJoin, setShowQuickJoin] = useState(false)
  const [showStudentOptions, setShowStudentOptions] = useState(false)
  const [showStudentRegistration, setShowStudentRegistration] = useState(false)
  const [gamePin, setGamePin] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [isQRAccess, setIsQRAccess] = useState(false)

  // Stati per registrazione studente
  const [studentForm, setStudentForm] = useState({
    nickname: '',
    fullName: '',
    email: '',
    selectedClass: ''
  })
  const [availableClasses, setAvailableClasses] = useState([])
  const [registrationStatus, setRegistrationStatus] = useState('')
  
  // QR access detection - mantenuto semplice
  useEffect(() => {
    const { pin, qr } = router.query
    if (pin && qr === '1') {
      router.push(`/game?pin=${pin}&qr=1`)
    }
  }, [router.query, router])

  const handleQuickJoin = () => {
    if (gamePin.trim() && playerName.trim()) {
      router.push(`/game?pin=${gamePin.trim()}&name=${encodeURIComponent(playerName.trim())}`)
    }
  }

  const loadAvailableClasses = async () => {
    try {
      const response = await fetch('/api/classes?action=list')
      const data = await response.json()
      setAvailableClasses(data.classes || [])
    } catch (error) {
      console.error('Errore caricamento classi:', error)
      setAvailableClasses([])
    }
  }

  const handleStudentRegistration = async (e) => {
    e.preventDefault()
    setRegistrationStatus('loading')

    try {
      // Registra lo studente tramite il sistema import
      const response = await fetch('/api/students-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          students: [{
            fullName: studentForm.fullName,
            nickname: studentForm.nickname,
            email: studentForm.email,
            className: studentForm.selectedClass,
            teacherEmailsList: [] // Verrà gestito automaticamente dal sistema
          }]
        })
      })

      const data = await response.json()

      if (data.success && data.success.students > 0) {
        setRegistrationStatus('success')
        setStudentForm({ nickname: '', fullName: '', email: '', selectedClass: '' })

        // Reindirizza automaticamente al login dopo 2 secondi
        setTimeout(() => {
          setShowStudentRegistration(false)
          setShowStudentOptions(false)
          setShowQuickJoin(true)
          setPlayerName(studentForm.nickname)
        }, 2000)
      } else {
        setRegistrationStatus('error')
        console.error('Errore registrazione:', data.errors)
      }
    } catch (error) {
      console.error('Errore registrazione studente:', error)
      setRegistrationStatus('error')
    }
  }

  const openStudentRegistration = () => {
    setShowStudentRegistration(true)
    setShowStudentOptions(false)
    loadAvailableClasses()
  }

  return (
    <div className="relative min-h-screen cyberpunk-lab-container">
      {/* Sfondo Laboratorio Cyberpunk */}
      <div className="lab-background"></div>
      
      {/* Overlay effetti */}
      <div className="lab-overlay"></div>
      
      {/* Particelle animate */}
      <div className="particles-container">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>
      
      {/* Circuiti animati */}
      <div className="circuit-lines">
        <div className="circuit-line circuit-top"></div>
        <div className="circuit-line circuit-bottom"></div>
        <div className="circuit-line circuit-left"></div>
        <div className="circuit-line circuit-right"></div>
      </div>

      <div className="min-h-screen flex flex-col relative z-10">
        {/* Header con Logo ChemArena Grande */}
        <header className="text-center py-12 z-20 relative">
          <div className="chemarena-logo-container">
            <h1 className="chemarena-title">
              <span className="chem-part">CHEM</span>
              <span className="arena-part">ARENA</span>
            </h1>
            <div className="logo-circuit-frame">
              <div className="circuit-corner circuit-tl"></div>
              <div className="circuit-corner circuit-tr"></div>
              <div className="circuit-corner circuit-bl"></div>
              <div className="circuit-corner circuit-br"></div>
            </div>
            <p className="lab-subtitle">// LABORATORIO DIGITALE CHIMICO //</p>
          </div>
          
          {/* Pulsante Admin in basso a sinistra */}
          <button
            onClick={() => router.push('/login')}
            className="admin-button"
          >
            <span className="admin-icon">⚙️</span>
            <span className="admin-text">ADMIN</span>
          </button>

          {/* PWA Install Button in alto a destra */}
          <div className="absolute top-4 right-4 z-30">
            <PWAInstallButton />
          </div>
        </header>

        {/* Contenuto principale */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-6xl mx-auto">
            
            {/* Modelli Atomici Centrali */}
            <div className="atomic-center">
              {/* Atomo Principale - Idrogeno */}
              <div className="atom atom-hydrogen">
                <div className="nucleus nucleus-hydrogen">H</div>
                <div className="electron-orbit orbit-1">
                  <div className="electron electron-1"></div>
                </div>
              </div>

              {/* Doppia Elica DNA Animata - Sinistra */}
              <div className="dna-helix dna-left">
                <div className="dna-strand strand-1">
                  <div className="base-pair bp-1"><span>A-T</span></div>
                  <div className="base-pair bp-2"><span>G-C</span></div>
                  <div className="base-pair bp-3"><span>C-G</span></div>
                  <div className="base-pair bp-4"><span>T-A</span></div>
                </div>
                <div className="dna-strand strand-2">
                  <div className="base-pair bp-5"><span>G-C</span></div>
                  <div className="base-pair bp-6"><span>A-T</span></div>
                  <div className="base-pair bp-7"><span>T-A</span></div>
                  <div className="base-pair bp-8"><span>C-G</span></div>
                </div>
              </div>

              {/* Cristallo Quantico Pulsante - Destra */}
              <div className="quantum-crystal">
                <div className="crystal-core">
                  <div className="energy-level level-1"></div>
                  <div className="energy-level level-2"></div>
                  <div className="energy-level level-3"></div>
                  <div className="quantum-particle particle-a"></div>
                  <div className="quantum-particle particle-b"></div>
                  <div className="quantum-particle particle-c"></div>
                </div>
                <div className="crystal-glow"></div>
              </div>
            </div>

            {/* Effetto Pulviscolo Particelle Cadenti */}
            <div className="particle-dust">
              {Array.from({length: 10}, (_, i) => (
                <div key={i} className={`dust-particle dust-${i + 1}`}></div>
              ))}
            </div>

            {/* Banner di selezione al centro */}
            <div className="mt-16 mb-8 selection-area">
              <div className="text-center mb-8">
                <h2 className="mode-selection-title">
                  <span className="title-bracket">[</span>
                  <span className="title-text">ACCESSO LABORATORIO</span>
                  <span className="title-bracket">]</span>
                </h2>
                <p className="mode-subtitle">
                  {">> Seleziona protocollo di accesso <<"}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center">
                <TronButton
                  title="INSEGNANTE"
                  subtitle="Crea e gestisci quiz"
                  icon="👨‍🏫"
                  href="/teacher-dashboard"
                  variant="primary"
                />
                
                <TronButton
                  title="STUDENTE"
                  subtitle="Partecipa o registrati"
                  icon="🎓"
                  onClick={() => setShowStudentOptions(!showStudentOptions)}
                  variant="secondary"
                />
                
                <TronButton
                  title="QUIZ LIBERO"
                  subtitle="Modalità di pratica"
                  icon="🧪"
                  href="/dashboard"
                  variant="accent"
                />
              </div>
              
              {/* Accesso rapido studente */}
              {showQuickJoin && (
                <div className="mt-8 max-w-md mx-auto quick-join-panel">
                  <div className="tron-panel p-6">
                    <h3 className="text-cyan-400 text-xl font-bold mb-4 text-center">
                      {isQRAccess ? '📱 ACCESSO RAPIDO' : 'ENTRA NEL QUIZ'}
                    </h3>
                    {isQRAccess && (
                      <div className="bg-cyan-900/20 border border-cyan-400/30 rounded-lg p-3 mb-4">
                        <p className="text-cyan-300 text-sm text-center">
                          ✅ PIN riconosciuto: <span className="font-bold text-cyan-400">{gamePin}</span>
                        </p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {!isQRAccess && (
                        <input
                          type="text"
                          placeholder="PIN..."
                          value={gamePin}
                          onChange={(e) => setGamePin(e.target.value.toUpperCase())}
                          className="tron-input w-full text-lg md:text-base"
                          maxLength={6}
                          autoComplete="off"
                          inputMode="numeric"
                        />
                      )}
                      <input
                        type="text"
                        placeholder="Il tuo nome..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="tron-input w-full text-lg md:text-base"
                        maxLength={20}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickJoin()}
                        autoFocus={isQRAccess} // Focus automatico se via QR
                        autoComplete="off"
                        autoCapitalize="words"
                      />
                      <button
                        onClick={handleQuickJoin}
                        disabled={!gamePin.trim() || !playerName.trim()}
                        className="tron-join-btn w-full"
                      >
                        {isQRAccess ? '🚀 ENTRA VELOCEMENTE' : 'ENTRA'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Opzioni Studente */}
              {showStudentOptions && (
                <div className="mt-8 max-w-md mx-auto quick-join-panel">
                  <div className="tron-panel p-6">
                    <h3 className="text-cyan-400 text-xl font-bold mb-6 text-center">
                      🎓 AREA STUDENTE
                    </h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => {
                          setShowStudentOptions(false)
                          setShowQuickJoin(true)
                        }}
                        className="tron-join-btn w-full"
                      >
                        🚀 ENTRA IN UN QUIZ
                      </button>
                      <button
                        onClick={openStudentRegistration}
                        className="tron-register-btn w-full"
                      >
                        📝 REGISTRATI NELLA CLASSE
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Registrazione Studente */}
              {showStudentRegistration && (
                <div className="mt-8 max-w-lg mx-auto quick-join-panel">
                  <div className="tron-panel p-6">
                    <h3 className="text-cyan-400 text-xl font-bold mb-6 text-center">
                      📝 REGISTRAZIONE STUDENTE
                    </h3>

                    {registrationStatus === 'success' && (
                      <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4 mb-6">
                        <p className="text-green-300 text-center">
                          ✅ Registrazione completata! Ti stiamo reindirizzando...
                        </p>
                      </div>
                    )}

                    {registrationStatus === 'error' && (
                      <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-6">
                        <p className="text-red-300 text-center">
                          ❌ Errore nella registrazione. Riprova o contatta il tuo insegnante.
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleStudentRegistration} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Nickname (per giocare)..."
                          value={studentForm.nickname}
                          onChange={(e) => setStudentForm({...studentForm, nickname: e.target.value})}
                          className="tron-input w-full"
                          required
                          disabled={registrationStatus === 'loading'}
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Nome e Cognome..."
                          value={studentForm.fullName}
                          onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                          className="tron-input w-full"
                          required
                          disabled={registrationStatus === 'loading'}
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Email (opzionale)..."
                          value={studentForm.email}
                          onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                          className="tron-input w-full"
                          disabled={registrationStatus === 'loading'}
                        />
                      </div>
                      <div>
                        <select
                          value={studentForm.selectedClass}
                          onChange={(e) => setStudentForm({...studentForm, selectedClass: e.target.value})}
                          className="tron-input w-full"
                          required
                          disabled={registrationStatus === 'loading'}
                        >
                          <option value="">Seleziona la tua classe...</option>
                          {availableClasses.map((cls) => (
                            <option key={cls.id} value={cls.name}>
                              {cls.name} - {cls.school}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex space-x-3 pt-4">
                        <button
                          type="submit"
                          disabled={registrationStatus === 'loading' || !studentForm.nickname || !studentForm.fullName || !studentForm.selectedClass}
                          className="tron-register-btn flex-1"
                        >
                          {registrationStatus === 'loading' ? '⏳ REGISTRANDO...' : '📝 REGISTRATI'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowStudentRegistration(false)
                            setShowStudentOptions(true)
                            setRegistrationStatus('')
                          }}
                          className="tron-back-btn flex-1"
                          disabled={registrationStatus === 'loading'}
                        >
                          ← INDIETRO
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center p-6 text-cyan-400 opacity-60">
          <p className="text-sm">
            ChemArena © 2025 - Piattaforma di Quiz Chimici Interattivi
          </p>
        </footer>
      </div>
      
      <style jsx>{`
        /* === CYBERPUNK LAB BACKGROUND === */
        .cyberpunk-lab-container {
          position: relative;
          overflow: hidden;
        }
        
        .lab-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            url('/lab-background.jpg') center center/cover no-repeat,
            linear-gradient(135deg, #002244 0%, #004488 25%, #0066BB 50%, #003377 75%, #001144 100%),
            radial-gradient(circle at 30% 20%, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(255, 0, 136, 0.12) 0%, transparent 50%);
          filter: brightness(0.4) contrast(1.2) saturate(1.5);
          z-index: -3;
        }
        
        .lab-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.1) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(255, 0, 136, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 40% 80%, rgba(0, 255, 136, 0.06) 0%, transparent 30%),
            linear-gradient(135deg, rgba(0, 30, 60, 0.7) 0%, rgba(0, 60, 120, 0.5) 100%);
          z-index: -2;
          animation: overlayPulse 8s ease-in-out infinite;
        }
        
        @keyframes overlayPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        /* === PARTICELLE ANIMATE === */
        .particles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: -1;
        }
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #00ffff;
          border-radius: 50%;
          box-shadow: 0 0 10px #00ffff;
        }
        
        .particle-1 {
          top: 20%;
          left: 10%;
          animation: floatParticle 6s ease-in-out infinite;
        }
        
        .particle-2 {
          top: 60%;
          right: 15%;
          animation: floatParticle 8s ease-in-out infinite reverse;
        }
        
        .particle-3 {
          bottom: 30%;
          left: 25%;
          animation: floatParticle 7s ease-in-out infinite;
          background: #ff0088;
          box-shadow: 0 0 10px #ff0088;
        }
        
        .particle-4 {
          top: 40%;
          right: 30%;
          animation: floatParticle 5s ease-in-out infinite;
          background: #00ff88;
          box-shadow: 0 0 10px #00ff88;
        }
        
        .particle-5 {
          bottom: 60%;
          right: 45%;
          animation: floatParticle 9s ease-in-out infinite reverse;
        }
        
        @keyframes floatParticle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-20px) translateX(10px); 
            opacity: 1;
          }
          50% { 
            transform: translateY(-40px) translateX(-5px); 
            opacity: 0.7;
          }
          75% { 
            transform: translateY(-20px) translateX(-15px); 
            opacity: 1;
          }
        }

        /* === CIRCUITI ANIMATI === */
        .circuit-lines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .circuit-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          opacity: 0.6;
        }
        
        .circuit-top {
          top: 20%;
          left: 0;
          width: 100%;
          height: 2px;
          animation: circuitPulse 4s ease-in-out infinite;
        }
        
        .circuit-bottom {
          bottom: 20%;
          left: 0;
          width: 100%;
          height: 2px;
          animation: circuitPulse 4s ease-in-out infinite 2s;
        }
        
        .circuit-left {
          left: 5%;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(180deg, transparent, #00ff88, transparent);
          animation: circuitPulse 5s ease-in-out infinite 1s;
        }
        
        .circuit-right {
          right: 5%;
          top: 0;
          width: 2px;
          height: 100%;
          background: linear-gradient(180deg, transparent, #ff0088, transparent);
          animation: circuitPulse 5s ease-in-out infinite 3s;
        }
        
        @keyframes circuitPulse {
          0%, 100% { 
            opacity: 0.2; 
            filter: brightness(0.5);
          }
          50% { 
            opacity: 1; 
            filter: brightness(2) drop-shadow(0 0 10px currentColor);
          }
        }

        /* === LOGO CHEMARENA GRANDE === */
        .chemarena-logo-container {
          position: relative;
          padding: 2rem 0;
          text-align: center;
        }
        
        .chemarena-title {
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 900;
          letter-spacing: 0.3em;
          margin: 0;
          position: relative;
          z-index: 10;
        }
        
        .chem-part {
          color: #00ffff;
          -webkit-text-stroke: 2px #00ff88;
          text-shadow:
            0 0 20px #00ffff,
            0 0 40px #00ffff,
            0 0 60px #00ffff;
          animation: chemGlow 3s ease-in-out infinite;
        }

        .arena-part {
          color: #ff0088;
          -webkit-text-stroke: 2px #00ff88;
          text-shadow:
            0 0 20px #ff0088,
            0 0 40px #ff0088,
            0 0 60px #ff0088;
          animation: arenaGlow 3s ease-in-out infinite 1.5s;
        }
        
        @keyframes chemGlow {
          0%, 100% { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff; }
          50% { text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff, 0 0 120px #00ffff; }
        }

        @keyframes arenaGlow {
          0%, 100% { text-shadow: 0 0 20px #ff0088, 0 0 40px #ff0088, 0 0 60px #ff0088; }
          50% { text-shadow: 0 0 30px #ff0088, 0 0 60px #ff0088, 0 0 90px #ff0088, 0 0 120px #ff0088; }
        }
        
        .logo-circuit-frame {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          pointer-events: none;
        }
        
        .circuit-corner {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 2px solid #00ff88;
          opacity: 0.8;
        }
        
        .circuit-tl {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
          animation: cornerPulse 4s ease-in-out infinite;
        }
        
        .circuit-tr {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
          animation: cornerPulse 4s ease-in-out infinite 1s;
        }
        
        .circuit-bl {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
          animation: cornerPulse 4s ease-in-out infinite 2s;
        }
        
        .circuit-br {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
          animation: cornerPulse 4s ease-in-out infinite 3s;
        }
        
        @keyframes cornerPulse {
          0%, 100% { 
            opacity: 0.4; 
            border-color: #00ff88;
          }
          50% { 
            opacity: 1; 
            border-color: #00ffff;
            filter: drop-shadow(0 0 10px currentColor);
          }
        }
        
        .lab-subtitle {
          font-family: 'Courier New', monospace;
          font-size: clamp(0.8rem, 2vw, 1.2rem);
          color: #00ff88;
          margin-top: 1rem;
          letter-spacing: 0.2em;
          opacity: 0.8;
          animation: subtitleFlicker 2s ease-in-out infinite;
        }
        
        @keyframes subtitleFlicker {
          0%, 90%, 100% { opacity: 0.8; }
          5%, 85% { opacity: 0.3; }
        }

        /* === MODELLI ATOMICI CENTRALI === */
        .atomic-center {
          position: relative;
          width: 100%;
          height: 350px;
          margin: 2rem 0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 120px;
          pointer-events: none;
        }

        .atom {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .atom-hydrogen {
          transform: scale(1.56);
          animation: atomFloat 8s ease-in-out infinite;
        }

        .dna-left {
          transform: scale(1.3);
          animation: atomFloat 12s ease-in-out infinite 2s;
        }

        .quantum-crystal {
          transform: scale(1.2);
          animation: atomFloat 8s ease-in-out infinite 4s;
        }

        @keyframes atomFloat {
          0%, 100% {
            transform: translateY(0px) scale(var(--scale, 1));
          }
          50% {
            transform: translateY(-15px) scale(var(--scale, 1));
          }
        }

        .nucleus {
          position: relative;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          font-size: 20px;
          z-index: 10;
        }

        .nucleus-hydrogen {
          background: radial-gradient(circle, #ff6b6b, #ee5a24);
          color: white;
          box-shadow:
            0 0 20px #ff6b6b,
            inset 0 0 10px rgba(255, 255, 255, 0.3);
          animation: nucleusGlow 3s ease-in-out infinite;
        }

        /* === DNA HELIX ANIMATA === */
        .dna-helix {
          position: relative;
          width: 120px;
          height: 200px;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .dna-strand {
          position: absolute;
          width: 100%;
          height: 100%;
          animation: dnaRotate 6s linear infinite;
        }

        .strand-2 {
          animation-delay: -3s;
        }

        @keyframes dnaRotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .base-pair {
          position: absolute;
          width: 100px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          animation: basePairPulse 3s ease-in-out infinite;
        }

        .base-pair span {
          font-family: 'Orbitron', monospace;
          font-size: 10px;
          font-weight: bold;
          color: white;
          text-shadow: 0 0 5px currentColor;
        }

        .bp-1, .bp-5 {
          top: 10%;
          background: linear-gradient(90deg, #ff6b6b, #ee5a24);
          animation-delay: 0s;
        }
        .bp-2, .bp-6 {
          top: 30%;
          background: linear-gradient(90deg, #4ecdc4, #00d2d3);
          animation-delay: 0.5s;
        }
        .bp-3, .bp-7 {
          top: 50%;
          background: linear-gradient(90deg, #45b7d1, #3867d6);
          animation-delay: 1s;
        }
        .bp-4, .bp-8 {
          top: 70%;
          background: linear-gradient(90deg, #fd79a8, #e84393);
          animation-delay: 1.5s;
        }

        @keyframes basePairPulse {
          0%, 100% {
            opacity: 0.8;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
          }
          50% {
            opacity: 1;
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
        }

        /* === CRISTALLO QUANTICO === */
        .quantum-crystal {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .crystal-core {
          position: relative;
          width: 80px;
          height: 80px;
          background: linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff);
          border-radius: 50%;
          animation: quantumSpin 4s linear infinite;
          box-shadow:
            0 0 30px rgba(0, 255, 255, 0.5),
            inset 0 0 20px rgba(255, 255, 255, 0.3);
        }

        @keyframes quantumSpin {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .energy-level {
          position: absolute;
          border: 2px solid;
          border-radius: 50%;
          animation: energyPulse linear infinite;
        }

        .level-1 {
          width: 100px;
          height: 100px;
          top: -10px;
          left: -10px;
          border-color: #00ffff;
          animation-duration: 3s;
        }

        .level-2 {
          width: 120px;
          height: 120px;
          top: -20px;
          left: -20px;
          border-color: #ff00ff;
          animation-duration: 4s;
          animation-delay: -1s;
        }

        .level-3 {
          width: 140px;
          height: 140px;
          top: -30px;
          left: -30px;
          border-color: #ffff00;
          animation-duration: 5s;
          animation-delay: -2s;
        }

        @keyframes energyPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .quantum-particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: quantumOrbit linear infinite;
        }

        .particle-a {
          background: #00ffff;
          box-shadow: 0 0 10px #00ffff;
          animation-duration: 2s;
          animation-timing-function: ease-in-out;
        }

        .particle-b {
          background: #ff00ff;
          box-shadow: 0 0 10px #ff00ff;
          animation-duration: 3s;
          animation-delay: -0.7s;
          animation-timing-function: ease-in-out;
        }

        .particle-c {
          background: #ffff00;
          box-shadow: 0 0 10px #ffff00;
          animation-duration: 2.5s;
          animation-delay: -1.2s;
          animation-timing-function: ease-in-out;
        }

        @keyframes quantumOrbit {
          0% {
            transform: rotate(0deg) translateX(50px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translateX(50px) rotate(-360deg);
          }
        }

        .crystal-glow {
          position: absolute;
          width: 160px;
          height: 160px;
          top: -10px;
          left: -10px;
          background: radial-gradient(circle, transparent 60%, rgba(0, 255, 255, 0.1) 70%, transparent 80%);
          border-radius: 50%;
          animation: crystalGlow 6s ease-in-out infinite;
        }

        @keyframes crystalGlow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes nucleusGlow {
          0%, 100% {
            box-shadow:
              0 0 20px currentColor,
              inset 0 0 10px rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow:
              0 0 35px currentColor,
              0 0 50px currentColor,
              inset 0 0 15px rgba(255, 255, 255, 0.5);
          }
        }

        .electron-orbit {
          position: absolute;
          border: 2px solid rgba(0, 255, 255, 0.4);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbitRotate linear infinite;
        }

        /* Orbita idrogeno - circolare */
        .atom-hydrogen .orbit-1 {
          border-radius: 50%;
          width: 104px;
          height: 104px;
          animation-duration: 4s;
        }

        @keyframes orbitRotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        .electron {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #00ffff;
          border-radius: 50%;
          box-shadow: 0 0 16px #00ffff;
          animation: electronPulse 2s ease-in-out infinite;
        }

        /* Elettrone idrogeno */
        .atom-hydrogen .orbit-1 .electron {
          top: -4px;
          right: 52px;
          background: #ff6b6b;
          box-shadow: 0 0 16px #ff6b6b;
        }


        @keyframes electronPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        /* === EFFETTO PULVISCOLO CADENTE === */
        .particle-dust {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .dust-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #00ffff;
          border-radius: 50%;
          opacity: 0;
          animation: dustFall linear infinite;
        }

        .dust-1 {
          left: 10%;
          animation-duration: 8s;
          animation-delay: 0s;
          background: #00ffff;
          box-shadow: 0 0 4px #00ffff;
        }

        .dust-2 {
          left: 25%;
          animation-duration: 12s;
          animation-delay: 2s;
          background: #ff0088;
          box-shadow: 0 0 4px #ff0088;
        }

        .dust-3 {
          left: 40%;
          animation-duration: 10s;
          animation-delay: 1s;
          background: #00ff88;
          box-shadow: 0 0 4px #00ff88;
        }

        .dust-4 {
          left: 55%;
          animation-duration: 15s;
          animation-delay: 3s;
          background: #ffff00;
          box-shadow: 0 0 4px #ffff00;
        }

        .dust-5 {
          left: 70%;
          animation-duration: 9s;
          animation-delay: 0.5s;
          background: #ff6b6b;
          box-shadow: 0 0 4px #ff6b6b;
        }

        .dust-6 {
          left: 85%;
          animation-duration: 13s;
          animation-delay: 4s;
          background: #4ecdc4;
          box-shadow: 0 0 4px #4ecdc4;
        }

        .dust-7 {
          left: 15%;
          animation-duration: 11s;
          animation-delay: 2.5s;
          background: #45b7d1;
          box-shadow: 0 0 4px #45b7d1;
        }

        .dust-8 {
          left: 65%;
          animation-duration: 14s;
          animation-delay: 1.5s;
          background: #fd79a8;
          box-shadow: 0 0 4px #fd79a8;
        }

        .dust-9 {
          left: 35%;
          animation-duration: 7s;
          animation-delay: 3.5s;
          background: #a29bfe;
          box-shadow: 0 0 4px #a29bfe;
        }

        .dust-10 {
          left: 80%;
          animation-duration: 16s;
          animation-delay: 0.8s;
          background: #fd63a3;
          box-shadow: 0 0 4px #fd63a3;
        }

        @keyframes dustFall {
          0% {
            top: -10px;
            opacity: 0;
            transform: translateX(0px);
          }
          10% {
            opacity: 1;
          }
          20% {
            opacity: 0.8;
            transform: translateX(5px);
          }
          40% {
            opacity: 0.6;
            transform: translateX(-3px);
          }
          60% {
            opacity: 1;
            transform: translateX(2px);
          }
          80% {
            opacity: 0.4;
            transform: translateX(-1px);
          }
          100% {
            top: calc(100vh + 10px);
            opacity: 0;
            transform: translateX(0px);
          }
        }


        /* === TITOLI SELEZIONE MODALITÀ === */
        .selection-area {
          position: relative;
          background: rgba(0, 20, 40, 0.7);
          border: 1px solid #00ffff;
          border-radius: 15px;
          padding: 2rem;
          backdrop-filter: blur(15px);
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.1),
            inset 0 0 30px rgba(0, 255, 255, 0.05);
        }
        
        .mode-selection-title {
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: bold;
          margin: 0;
          text-align: center;
        }
        
        .title-bracket {
          color: #00ff88;
          text-shadow: 0 0 10px #00ff88;
          animation: bracketPulse 2s ease-in-out infinite;
        }
        
        .title-text {
          color: #00ffff;
          text-shadow: 0 0 15px #00ffff;
          margin: 0 1rem;
          animation: titleGlow 3s ease-in-out infinite;
        }
        
        @keyframes bracketPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        
        @keyframes titleGlow {
          0%, 100% { 
            color: #00ffff;
            text-shadow: 0 0 15px #00ffff;
          }
          50% { 
            color: #ffffff;
            text-shadow: 0 0 25px #00ffff, 0 0 35px #00ffff;
          }
        }
        
        .mode-subtitle {
          font-family: 'Courier New', monospace;
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: #00ff88;
          text-align: center;
          margin-top: 0.5rem;
          letter-spacing: 0.1em;
          opacity: 0.8;
          animation: subtypeFlicker 3s ease-in-out infinite;
        }
        
        @keyframes subtypeFlicker {
          0%, 95%, 100% { opacity: 0.8; }
          2%, 93% { opacity: 0.3; }
        }

        .admin-button {
          position: fixed;
          bottom: 30px;
          left: 30px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid #00ffff;
          padding: 12px 20px;
          border-radius: 25px;
          color: #00ffff;
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          z-index: 50;
        }

        .admin-button:hover {
          background: rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .admin-icon {
          font-size: 16px;
        }

        /* === COMPONENTI TRON === */
        .tron-panel {
          background: rgba(0, 255, 255, 0.05);
          border: 1px solid #00ffff;
          backdrop-filter: blur(15px);
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px));
        }

        .tron-input {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #00ffff;
          color: #00ffff;
          padding: 12px 16px;
          font-family: 'Courier New', monospace;
          font-size: 16px;
          text-align: center;
          letter-spacing: 2px;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
          transition: all 0.3s ease;
        }

        .tron-input:focus {
          outline: none;
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
          border-color: #39ff14;
        }

        .tron-input::placeholder { color: rgba(0, 255, 255, 0.5); }

        .tron-join-btn {
          background: rgba(0, 255, 136, 0.2);
          border: 1px solid #00ff88;
          color: #00ff88;
          padding: 12px 24px;
          font-family: 'Orbitron', monospace;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
        }

        .tron-join-btn:hover:not(:disabled) {
          background: rgba(0, 255, 136, 0.3);
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
          transform: translateX(2px);
        }

        .tron-join-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tron-register-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          border: 2px solid #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
        }

        .tron-register-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #059669, #047857);
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);
          transform: translateY(-2px);
        }

        .tron-register-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tron-back-btn {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          border: 2px solid #6b7280;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(107, 114, 128, 0.3);
          margin-right: 3cm;
        }

        .tron-back-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #4b5563, #374151);
          box-shadow: 0 0 30px rgba(107, 114, 128, 0.6);
          transform: translateY(-2px);
        }

        .tron-back-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .quick-join-panel {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* === RESPONSIVE DESIGN === */
        @media (max-width: 768px) {
          .admin-button {
            bottom: 20px;
            left: 20px;
            padding: 10px 16px;
          }

          .admin-icon {
            font-size: 14px;
          }

          .admin-text {
            font-size: 10px;
          }

          .chemarena-title {
            font-size: clamp(2rem, 10vw, 4rem);
            letter-spacing: 0.2em;
          }

          .atomic-center {
            height: 250px;
            gap: 60px;
            flex-direction: row;
            justify-content: space-around;
          }

          .atom-hydrogen, .dna-left, .quantum-crystal {
            transform: scale(1.04);
          }

          .nucleus {
            width: 39px;
            height: 39px;
            font-size: 16px;
          }

          .atom-hydrogen .orbit-1 { width: 78px; height: 78px; }

          .electron {
            width: 5px;
            height: 5px;
          }

          .atom-hydrogen .orbit-1 .electron { right: 39px; }

          .circuit-corner { width: 40px; height: 40px; }

          .selection-area {
            padding: 1.5rem;
            margin: 1rem;
          }

          .particles-container {
            display: none; /* Nascondi particelle su mobile per performance */
          }

          .particle-dust .dust-particle {
            display: none; /* Nascondi pulviscolo su tablet per performance */
          }
        }
        
        @media (max-width: 480px) {
          .chemarena-title {
            font-size: clamp(1.5rem, 12vw, 3rem);
            letter-spacing: 0.1em;
          }

          .lab-subtitle {
            font-size: 0.8rem;
          }

          .mode-selection-title {
            font-size: clamp(1rem, 6vw, 1.8rem);
          }

          .mode-subtitle {
            font-size: 0.8rem;
          }

          .atomic-center {
            height: 200px;
            gap: 40px;
            flex-direction: column;
            align-items: center;
          }

          .atom-hydrogen {
            transform: scale(1.17);
            order: 1;
          }

          .dna-left {
            transform: scale(0.8);
            order: 2;
          }

          .quantum-crystal {
            transform: scale(0.9);
            order: 3;
            display: none; /* Nascondi il cristallo su mobile molto piccolo */
          }

          .nucleus {
            width: 32px;
            height: 32px;
            font-size: 13px;
          }

          .atom-hydrogen .orbit-1 { width: 65px; height: 65px; }

          .electron {
            width: 4px;
            height: 4px;
          }

          .atom-hydrogen .orbit-1 .electron { right: 32px; }


          .particle-dust {
            display: none; /* Nascondi completamente il pulviscolo su mobile piccolo */
          }
        }
        
        /* === ANIMAZIONI PERFORMANCE === */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* === DARK MODE SUPPORT === */
        @media (prefers-color-scheme: dark) {
          .lab-background {
            filter: brightness(0.3) contrast(1.4) saturate(1.8);
          }
          
          .lab-overlay {
            background: 
              radial-gradient(circle at 20% 30%, rgba(0, 255, 255, 0.15) 0%, transparent 40%),
              radial-gradient(circle at 80% 70%, rgba(255, 0, 136, 0.12) 0%, transparent 40%),
              radial-gradient(circle at 40% 80%, rgba(0, 255, 136, 0.08) 0%, transparent 30%),
              linear-gradient(135deg, rgba(0, 10, 30, 0.9) 0%, rgba(0, 20, 60, 0.8) 100%);
          }
        }
        
        /* === HIGH CONTRAST === */
        @media (prefers-contrast: high) {
          .chem-part, .arena-part {
            text-shadow: 
              0 0 5px currentColor,
              0 0 10px currentColor,
              0 0 15px currentColor,
              2px 2px 0px rgba(0,0,0,0.8);
          }
          
          .circuit-line, .circuit-corner {
            opacity: 1;
            filter: brightness(2);
          }
        }
      `}</style>
    </div>
  )
}
