import { createContext, useContext, useReducer, useCallback } from 'react'

// Action types
const DASHBOARD_ACTIONS = {
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_EDITING_QUIZ: 'SET_EDITING_QUIZ',
  CLEAR_EDITING_QUIZ: 'CLEAR_EDITING_QUIZ',
  SET_AUTHENTICATION: 'SET_AUTHENTICATION',
  SET_LOADING: 'SET_LOADING'
}

// Initial state
const initialState = {
  activeTab: 'archive',
  editingQuiz: null,
  isAuthenticated: false,
  isLoading: false,
  user: null
}

// Reducer function
function dashboardReducer(state, action) {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_ACTIVE_TAB:
      return { ...state, activeTab: action.payload }

    case DASHBOARD_ACTIONS.SET_EDITING_QUIZ:
      return {
        ...state,
        editingQuiz: action.payload,
        activeTab: 'create' // Auto-switch to create tab
      }

    case DASHBOARD_ACTIONS.CLEAR_EDITING_QUIZ:
      return { ...state, editingQuiz: null }

    case DASHBOARD_ACTIONS.SET_AUTHENTICATION:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user
      }

    case DASHBOARD_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }

    default:
      return state
  }
}

// Context creation
const DashboardContext = createContext()

// Custom hook for using dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

// Provider component
export function DashboardProvider({ children }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState)

  // Memoized actions
  const setActiveTab = useCallback((tab) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_ACTIVE_TAB, payload: tab })
  }, [])

  const setEditingQuiz = useCallback((quiz) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_EDITING_QUIZ, payload: quiz })
  }, [])

  const clearEditingQuiz = useCallback(() => {
    dispatch({ type: DASHBOARD_ACTIONS.CLEAR_EDITING_QUIZ })
  }, [])

  const setAuthentication = useCallback((isAuthenticated, user = null) => {
    dispatch({
      type: DASHBOARD_ACTIONS.SET_AUTHENTICATION,
      payload: { isAuthenticated, user }
    })
  }, [])

  const setLoading = useCallback((isLoading) => {
    dispatch({ type: DASHBOARD_ACTIONS.SET_LOADING, payload: isLoading })
  }, [])

  // Context value (memoized to prevent unnecessary re-renders)
  const value = {
    // State
    ...state,

    // Actions
    setActiveTab,
    setEditingQuiz,
    clearEditingQuiz,
    setAuthentication,
    setLoading
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export default DashboardContext