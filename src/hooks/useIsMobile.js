import { useState, useEffect } from 'react'

/**
 * 📱 Hook per rilevare dispositivi mobile
 * Combina user agent + screen size per rilevamento accurato
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkMobile = () => {
      // Controllo user agent per dispositivi mobile
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : ''
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

      // Controllo dimensioni schermo (mobile se larghezza < 768px)
      const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
      const mobileScreen = screenWidth < 768

      // Controllo touch support
      const touchSupport = typeof window !== 'undefined' && 'ontouchstart' in window

      // È mobile se almeno 2 condizioni sono vere
      const conditions = [mobileUserAgent, mobileScreen, touchSupport]
      const mobileConditions = conditions.filter(Boolean).length

      setIsMobile(mobileConditions >= 2 || (mobileUserAgent && mobileScreen))
      setIsLoading(false)
    }

    // Controllo iniziale
    checkMobile()

    // Listener per resize (cambiamento orientamento/dimensioni)
    const handleResize = () => {
      checkMobile()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleResize)
      }
    }
  }, [])

  return { isMobile, isLoading }
}

/**
 * 📱 Hook semplificato per rilevamento rapido mobile
 */
export function useIsMobileSimple() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      checkMobile()
      window.addEventListener('resize', checkMobile)

      return () => window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return isMobile
}