/**
 * ChemArena - Professional Logging System
 *
 * Features:
 * - Environment-aware logging (dev/prod)
 * - Multiple log levels with colors
 * - Performance timing utilities
 * - Context-aware messaging
 * - Production-safe (no console.log in build)
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
}

// Colors for browser console (development only)
const LOG_COLORS = {
  ERROR: '#FF6B6B',   // Red
  WARN: '#FFE66D',    // Yellow
  INFO: '#4ECDC4',    // Teal
  DEBUG: '#A8E6CF',   // Green
  TRACE: '#C7CEEA'    // Purple
}

// Icons for visual identification
const LOG_ICONS = {
  ERROR: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
  DEBUG: '🔧',
  TRACE: '🔍'
}

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
    this.currentLevel = this.isDevelopment ? LOG_LEVELS.TRACE : LOG_LEVELS.ERROR
    this.context = 'ChemArena'

    // Performance tracking
    this.timers = new Map()
  }

  /**
   * Set logging context (component name, function, etc.)
   */
  withContext(context) {
    const contextLogger = Object.create(this)
    contextLogger.context = context
    return contextLogger
  }

  /**
   * Internal log function with environment awareness
   */
  _log(level, message, ...args) {
    // In production, only log errors
    if (this.isProduction && level > LOG_LEVELS.ERROR) {
      return
    }

    // Check if level is enabled
    if (level > this.currentLevel) {
      return
    }

    const levelName = Object.keys(LOG_LEVELS)[level]
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
    const icon = LOG_ICONS[levelName]
    const color = LOG_COLORS[levelName]

    // Format message with context
    const contextStr = this.context ? `[${this.context}]` : ''
    const formattedMessage = `${icon} ${timestamp} ${contextStr} ${message}`

    // Development: colorized console output
    if (this.isDevelopment && typeof window !== 'undefined') {
      console.log(`%c${formattedMessage}`, `color: ${color}; font-weight: bold`, ...args)
    }
    // Server/production: standard console
    else if (level <= LOG_LEVELS.ERROR) {
      console.error(formattedMessage, ...args)
    }
  }

  /**
   * Error logging - always visible
   */
  error(message, ...args) {
    this._log(LOG_LEVELS.ERROR, message, ...args)
  }

  /**
   * Warning logging - development + critical issues
   */
  warn(message, ...args) {
    this._log(LOG_LEVELS.WARN, message, ...args)
  }

  /**
   * Info logging - development only
   */
  info(message, ...args) {
    this._log(LOG_LEVELS.INFO, message, ...args)
  }

  /**
   * Debug logging - development only
   */
  debug(message, ...args) {
    this._log(LOG_LEVELS.DEBUG, message, ...args)
  }

  /**
   * Trace logging - development only
   */
  trace(message, ...args) {
    this._log(LOG_LEVELS.TRACE, message, ...args)
  }

  /**
   * Performance timing utilities
   */
  time(label) {
    if (this.isDevelopment) {
      this.timers.set(label, performance.now())
      this.debug(`⏱️ Timer started: ${label}`)
    }
  }

  timeEnd(label) {
    if (this.isDevelopment && this.timers.has(label)) {
      const startTime = this.timers.get(label)
      const duration = performance.now() - startTime
      this.timers.delete(label)
      this.info(`⏱️ Timer ${label}: ${duration.toFixed(2)}ms`)
      return duration
    }
    return null
  }

  /**
   * API call logging
   */
  api(method, url, data = null) {
    if (this.isDevelopment) {
      this.debug(`🌐 API ${method.toUpperCase()}: ${url}`, data)
    }
  }

  /**
   * Component lifecycle logging
   */
  component(name, event, data = null) {
    if (this.isDevelopment) {
      this.trace(`⚛️ ${name} ${event}`, data)
    }
  }

  /**
   * Socket events logging
   */
  socket(event, data = null) {
    if (this.isDevelopment) {
      this.debug(`🔌 Socket: ${event}`, data)
    }
  }

  /**
   * User interaction logging
   */
  user(action, details = null) {
    if (this.isDevelopment) {
      this.info(`👤 User: ${action}`, details)
    }
  }

  /**
   * Quiz/Game specific logging
   */
  game(event, details = null) {
    if (this.isDevelopment) {
      this.info(`🎮 Game: ${event}`, details)
    }
  }
}

// Create default logger instance
const logger = new Logger()

// Export convenience methods
export default logger

// Named exports for specific contexts
export const dashboardLogger = logger.withContext('Dashboard')
export const gameLogger = logger.withContext('Game')
export const quizLogger = logger.withContext('Quiz')
export const socketLogger = logger.withContext('Socket')
export const apiLogger = logger.withContext('API')

// Utility function to replace console.log calls
export const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(...args)
  }
}

// Legacy support (gradual migration)
export const devLog = log