import Toaster from "@/components/Toaster"
import NavigationControls from "@/components/NavigationControls"
import { PlayerContextProvider } from "@/context/player"
import { SocketContextProvider } from "@/context/socket"
import "@/styles/globals.css"
import clsx from "clsx"
import { Montserrat, Plaster } from "next/font/google"
import Head from "next/head"
import { useEffect } from "react"

const montserrat = Montserrat({ subsets: ["latin"] })

export default function App({ Component, pageProps }) {
  // Service Worker registration per PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope)

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nuovo SW disponibile, notifica all'utente (future feature)
                  console.log('[PWA] New content available, reload to update')
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error)
        })
    }
  }, [])

  return (
    <>
      <Head>
        {/* PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#667eea" />
        <meta name="background-color" content="#1f2937" />

        {/* Mobile App Configuration */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ChemArena" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />

        {/* Meta Description for PWA */}
        <meta name="description" content="ChemArena - Quiz di Chimica Interattivo. Piattaforma educativa per l'apprendimento della chimica con modalità multiplayer real-time." />
        <meta name="keywords" content="chimica, quiz, educazione, scienza, multiplayer, gioco, apprendimento" />
        <meta name="author" content="ChemArena Team" />

        {/* Social Media Meta Tags */}
        <meta property="og:title" content="ChemArena - Quiz di Chimica Interattivo" />
        <meta property="og:description" content="Piattaforma educativa per l'apprendimento della chimica con quiz interattivi multiplayer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

        <title>ChemArena 🧪</title>
      </Head>
      <SocketContextProvider>
        <PlayerContextProvider>
          <main
            className={clsx(
              "text-base-[8px] flex flex-col",
              montserrat.className,
            )}
          >
            <Component {...pageProps} />
            <NavigationControls />
          </main>
        </PlayerContextProvider>
      </SocketContextProvider>
      <Toaster />
    </>
  )
}
