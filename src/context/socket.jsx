import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"

let socket = null

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !socket) {
      socket = io(window.location.origin, {
        path: '/api/socket',
        // 🔧 FIX: Polling first in dev per evitare race condition con Next.js
        transports: process.env.NODE_ENV === 'production'
          ? ["websocket", "polling"]  // Prod: WebSocket prioritario
          : ["polling", "websocket"],  // Dev: Polling first (più stabile con hot reload)
        // 🔧 PRODUCTION FIX: Reconnection robusta per reti mobili instabili
        reconnection: true,
        reconnectionAttempts: 10,      // Max 10 tentativi
        reconnectionDelay: 1000,       // 1s tra tentativi
        reconnectionDelayMax: 5000,    // Max 5s ritardo
        timeout: 45000,                // 45s timeout (sync con server connectTimeout)
        autoConnect: true,
        forceNew: false,               // Riusa connessione esistente
      })

      socket.on('connect', () => {
        console.log('🚀 Connected:', socket.id)
        // Notifica reconnessione avvenuta
        if (socket.recovered) {
          console.log('✅ Reconnected successfully after disconnect')
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected:', reason)
        // Auto-reconnect per disconnessioni network
        if (reason === 'io server disconnect') {
          socket.connect()
        }
      })

      socket.on('connect_error', (error) => {
        console.warn('⚠️ Connection error:', error.message)
      })

      socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`)
      })

      socket.on('reconnect_failed', () => {
        console.error('🚨 Reconnection failed - manual refresh needed')
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
