import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"

let socket = null

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !socket) {
      // 🔧 FIX RENDER: Forza polling su produzione per compatibilità Render
      const isRenderProduction = typeof window !== 'undefined' &&
                                 window.location.hostname.includes('onrender.com')

      socket = io(window.location.origin, {
        path: '/api/socket',
        // 🔧 FIX RENDER: Usa SOLO polling su Render (WebSocket non funziona con Next.js API routes)
        transports: isRenderProduction
          ? ["polling"]                 // Render: SOLO polling (WebSocket fallisce)
          : ["polling", "websocket"],   // Dev/Altri: Polling + WebSocket
        // 🔧 PRODUCTION FIX: Reconnection robusta
        reconnection: true,
        reconnectionAttempts: 10,      // Max 10 tentativi
        reconnectionDelay: 1000,       // 1s tra tentativi
        reconnectionDelayMax: 5000,    // Max 5s ritardo
        timeout: 20000,                // 🔧 RENDER: Ridotto a 20s (più veloce fallback)
        autoConnect: true,
        forceNew: false,               // Riusa connessione esistente
        upgrade: false,                // 🔧 RENDER: Disabilita upgrade a WebSocket
      })

      console.log(`🔌 Socket.IO config:`, {
        hostname: window.location.hostname,
        isRender: isRenderProduction,
        transports: isRenderProduction ? ["polling"] : ["polling", "websocket"]
      })

      socket.on('connect', () => {
        console.log('🚀 Connected:', socket.id)
        console.log('🔌 Transport:', socket.io.engine.transport.name)
        // Notifica reconnessione avvenuta
        if (socket.recovered) {
          console.log('✅ Reconnected successfully after disconnect')
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected:', reason)
        // Auto-reconnect per disconnessioni network
        if (reason === 'io server disconnect') {
          console.log('🔄 Server disconnected, reconnecting...')
          socket.connect()
        }
      })

      socket.on('connect_error', (error) => {
        console.error('⚠️ Connection error:', {
          message: error.message,
          description: error.description,
          type: error.type
        })
      })

      socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      })

      socket.on('reconnect_failed', () => {
        console.error('🚨 Reconnection failed - manual refresh needed')
        if (typeof window !== 'undefined') {
          alert('❌ Impossibile connettersi al server.\n\nRicarica la pagina (F5) e riprova.')
        }
      })

      socket.on('reconnect_error', (error) => {
        console.error('🔄 Reconnect error:', error.message)
      })

      socket.io.engine.on("upgrade", (transport) => {
        console.log('⬆️ Transport upgraded to:', transport.name)
      })

      setSocketInstance(socket)
    }
  }, [])

  return (
    <SocketContext.Provider value={socketInstance}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const socket = useContext(SocketContext)

  return {
    socket,
    isConnected: socket?.connected || false,
    emit: (event, ...args) => socket?.emit(event, ...args),
    on: (event, callback) => socket?.on(event, callback),
    off: (event, callback) => socket?.off(event, callback)
  }
}
