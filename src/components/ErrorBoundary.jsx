import React from 'react'
import { gameLogger } from '@/utils/logger'

/**
 * ChemArena - Error Boundary Component
 *
 * Cattura errori JavaScript nei componenti React child e mostra
 * una UI di fallback invece di crashare l'intera applicazione.
 *
 * Features:
 * - Logging strutturato degli errori
 * - UI di recovery user-friendly
 * - Refresh automatico e manuale
 * - Context-aware error reporting
 * - Graceful degradation
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    }

    this.maxRetries = props.maxRetries || 3
    this.autoRetryDelay = props.autoRetryDelay || 5000
    this.context = props.context || 'Component'
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo state per mostrare la UI di fallback
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    }
  }

  componentDidCatch(error, errorInfo) {
    // Log dell'errore con dettagli completi
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: this.context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      errorId: this.state.errorId
    }

    // Log strutturato per debugging
    gameLogger.error('Component crash detected', errorDetails)

    // Aggiorna state con dettagli errore
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Auto-retry se configurato
    if (this.state.retryCount < this.maxRetries && this.props.autoRetry) {
      setTimeout(() => {
        this.handleRetry()
      }, this.autoRetryDelay)
    }

    // Report a servizio esterno se configurato
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorDetails)
    }
  }

  handleRetry = () => {
    gameLogger.info('Attempting component recovery', {
      context: this.context,
      retryCount: this.state.retryCount + 1,
      errorId: this.state.errorId
    })

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1
    })
  }

  handleRefresh = () => {
    gameLogger.user('Manual page refresh requested', {
      context: this.context,
      errorId: this.state.errorId
    })

    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI se fornita
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleRefresh)
      }

      // UI di fallback predefinita
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md mx-auto text-center">
            {/* Icon di errore */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.876c1.403 0 2.386-1.377 1.943-2.728L14.934 6.288C14.553 5.522 13.801 5 13 5s-1.553.522-1.934 1.288L5.119 17.272C4.676 18.623 5.659 20 7.062 20z" />
              </svg>
            </div>

            {/* Messaggio di errore */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Qualcosa è andato storto
            </h3>

            <p className="text-gray-600 mb-6">
              {this.context === 'Dashboard'
                ? 'Si è verificato un errore nella dashboard. Non preoccuparti, stiamo lavorando per risolverlo.'
                : this.context === 'Game'
                ? 'Si è verificato un errore durante il gioco. Prova a ricaricare la pagina.'
                : 'Si è verificato un errore inaspettato. Prova a ricaricare la pagina.'}
            </p>

            {/* Azioni di recovery */}
            <div className="space-y-3">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🔄 Riprova ({this.maxRetries - this.state.retryCount} tentativi rimasti)
                </button>
              )}

              <button
                onClick={this.handleRefresh}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔃 Ricarica Pagina
              </button>

              {this.context === 'Dashboard' && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  🏠 Torna alla Home
                </button>
              )}
            </div>

            {/* Debug info (solo in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  🔧 Debug Info (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  <div className="mb-2">
                    <strong>Context:</strong> {this.context}
                  </div>
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Error ID per supporto */}
            <p className="mt-4 text-xs text-gray-400">
              Error ID: {this.state.errorId}
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// HOC per wrappare componenti facilmente
export const withErrorBoundary = (Component, options = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Export specifici per diversi contesti
export const DashboardErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary context="Dashboard" maxRetries={2} autoRetry={false} {...props}>
    {children}
  </ErrorBoundary>
)

export const GameErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary context="Game" maxRetries={3} autoRetry={true} autoRetryDelay={3000} {...props}>
    {children}
  </ErrorBoundary>
)

export const QuizErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary context="Quiz" maxRetries={2} autoRetry={false} {...props}>
    {children}
  </ErrorBoundary>
)

export default ErrorBoundary