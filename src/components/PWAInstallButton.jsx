import { useState, useEffect } from 'react'

/**
 * ChemArena - PWA Install Button
 *
 * Componente per l'installazione PWA con:
 * - Auto-detection del supporto installazione
 * - UI ottimizzata per mobile e desktop
 * - Gestione eventi beforeinstallprompt
 * - Feedback utente per installazione completata
 */

export default function PWAInstallButton({ className = "", onInstall }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check se già installato
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Listener per beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] beforeinstallprompt event fired')

      // Previeni il prompt automatico del browser
      e.preventDefault()

      // Salva l'evento per usarlo dopo
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    // Listener per appinstalled event
    const handleAppInstalled = () => {
      console.log('[PWA] App installed successfully')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)

      if (onInstall) {
        onInstall()
      }
    }

    // Aggiungi event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [onInstall])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[PWA] No deferred prompt available')
      return
    }

    setIsInstalling(true)

    try {
      // Mostra il prompt di installazione
      deferredPrompt.prompt()

      // Aspetta la risposta dell'utente
      const { outcome } = await deferredPrompt.userChoice

      console.log(`[PWA] User choice: ${outcome}`)

      if (outcome === 'accepted') {
        console.log('[PWA] User accepted installation')
      } else {
        console.log('[PWA] User dismissed installation')
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null)
      setIsInstallable(false)

    } catch (error) {
      console.error('[PWA] Installation failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  // Non mostrare se già installato
  if (isInstalled) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm ${className}`}>
        <span>✅</span>
        <span>App installata</span>
      </div>
    )
  }

  // Non mostrare se non installabile
  if (!isInstallable) {
    return null
  }

  return (
    <button
      onClick={handleInstallClick}
      disabled={isInstalling}
      className={`
        flex items-center space-x-2 px-4 py-2
        bg-gradient-to-r from-blue-500 to-purple-600
        hover:from-blue-600 hover:to-purple-700
        text-white font-medium rounded-lg
        transition-all duration-200
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      title="Installa ChemArena come app sul tuo dispositivo"
    >
      {isInstalling ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Installando...</span>
        </>
      ) : (
        <>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Installa App</span>
        </>
      )}
    </button>
  )
}

// Hook personalizzato per PWA status
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Check installation status
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches)

    // Check online status
    setIsOffline(!navigator.onLine)

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    const handleBeforeInstallPrompt = () => setIsInstallable(true)
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isInstalled,
    isInstallable,
    isOffline,
    isPWA: isInstalled
  }
}