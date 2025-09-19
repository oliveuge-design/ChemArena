import { useState, useEffect } from "react"

export default function ThemeCustomizer() {
  const [quizzes, setQuizzes] = useState([])
  const [layoutPreferences, setLayoutPreferences] = useState({})
  const [avatarSettings, setAvatarSettings] = useState({})
  const [previewQuiz, setPreviewQuiz] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [savedStatus, setSavedStatus] = useState("")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Layout disponibili per i quiz
  const layouts = [
    {
      id: 'classic',
      name: 'Classico',
      description: 'Layout tradizionale con domande centrate',
      preview: 'bg-gradient-to-br from-blue-900 to-blue-700',
      colors: { primary: '#2563eb', secondary: '#1d4ed8' }
    },
    {
      id: 'modern',
      name: 'Moderno',
      description: 'Design pulito con elementi minimal',
      preview: 'bg-gradient-to-br from-gray-800 to-gray-600',
      colors: { primary: '#374151', secondary: '#1f2937' }
    },
    {
      id: 'vibrant',
      name: 'Vivace',
      description: 'Colori brillanti e animazioni dinamiche',
      preview: 'bg-gradient-to-br from-purple-600 to-pink-600',
      colors: { primary: '#9333ea', secondary: '#db2777' }
    },
    {
      id: 'dark',
      name: 'Scuro',
      description: 'Tema scuro per ridurre affaticamento',
      preview: 'bg-gradient-to-br from-gray-900 to-black',
      colors: { primary: '#111827', secondary: '#000000' }
    },
    {
      id: 'nature',
      name: 'Natura',
      description: 'Toni verdi ispirati alla natura',
      preview: 'bg-gradient-to-br from-green-700 to-green-500',
      colors: { primary: '#15803d', secondary: '#22c55e' }
    }
  ]

  // Carica quiz e preferenze salvate
  useEffect(() => {
    loadQuizzes()
    loadLayoutPreferences()
    loadAvatarSettings()
  }, [])

  const loadQuizzes = async () => {
    try {
      const response = await fetch('/api/quiz-archive')
      const data = await response.json()
      setQuizzes(data.quizzes || [])
    } catch (error) {
      console.error('Errore caricamento quiz:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadLayoutPreferences = () => {
    try {
      const saved = localStorage.getItem('quiz-layout-preferences')
      if (saved) {
        setLayoutPreferences(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Errore caricamento preferenze layout:', error)
    }
  }

  const loadAvatarSettings = () => {
    try {
      const saved = localStorage.getItem('student-avatar-settings')
      if (saved) {
        setAvatarSettings(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Errore caricamento avatar:', error)
    }
  }

  const saveLayoutPreferences = (prefs) => {
    try {
      localStorage.setItem('quiz-layout-preferences', JSON.stringify(prefs))
      setLayoutPreferences(prefs)
      setSavedStatus("✅ Layout salvati!")
      setTimeout(() => setSavedStatus(""), 3000)
    } catch (error) {
      console.error('Errore salvataggio layout:', error)
      setSavedStatus("❌ Errore salvataggio")
      setTimeout(() => setSavedStatus(""), 3000)
    }
  }

  const saveAvatarSettings = (settings) => {
    try {
      localStorage.setItem('student-avatar-settings', JSON.stringify(settings))
      setAvatarSettings(settings)
      setSavedStatus("✅ Avatar salvati!")
      setTimeout(() => setSavedStatus(""), 3000)
    } catch (error) {
      console.error('Errore salvataggio avatar:', error)
      setSavedStatus("❌ Errore salvataggio")
      setTimeout(() => setSavedStatus(""), 3000)
    }
  }

  const updateQuizLayout = (quizId, layoutId) => {
    const newPrefs = {
      ...layoutPreferences,
      [quizId]: layoutId
    }
    saveLayoutPreferences(newPrefs)
  }

  const resetAllLayoutsToDefault = () => {
    if (confirm('Vuoi resettare tutti i quiz al layout di default (classico)?')) {
      saveLayoutPreferences({})
    }
  }

  const applyLayoutToAll = (layoutId) => {
    if (confirm(`Vuoi applicare il layout "${layouts.find(l => l.id === layoutId)?.name}" a tutti i quiz?`)) {
      const newPrefs = {}
      quizzes.forEach(quiz => {
        newPrefs[quiz.id] = layoutId
      })
      saveLayoutPreferences(newPrefs)
    }
  }

  const uploadAvatarImage = async (file) => {
    if (!file) return null

    setUploadingAvatar(true)

    try {
      // Converte l'immagine in base64 per salvataggio locale
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setUploadingAvatar(false)
          resolve(e.target.result) // Base64 string
        }
        reader.onerror = (error) => {
          setUploadingAvatar(false)
          reject(error)
        }
        reader.readAsDataURL(file)
      })
    } catch (error) {
      console.error('Errore upload avatar:', error)
      setSavedStatus("❌ Errore upload avatar")
      setTimeout(() => setSavedStatus(""), 3000)
      setUploadingAvatar(false)
      return null
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setSavedStatus("❌ Seleziona solo immagini")
      setTimeout(() => setSavedStatus(""), 3000)
      return
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setSavedStatus("❌ Immagine troppo grande (max 2MB)")
      setTimeout(() => setSavedStatus(""), 3000)
      return
    }

    const imageBase64 = await uploadAvatarImage(file)
    if (imageBase64) {
      const newSettings = {
        ...avatarSettings,
        customAvatars: [...(avatarSettings.customAvatars || []), {
          id: Date.now().toString(),
          url: imageBase64, // Base64 string per visualizzazione
          name: file.name.split('.')[0],
          uploadDate: new Date().toLocaleDateString(),
          size: file.size,
          type: file.type
        }]
      }
      saveAvatarSettings(newSettings)
    }
  }

  const removeCustomAvatar = (avatarId) => {
    if (confirm('Vuoi rimuovere questo avatar?')) {
      const newSettings = {
        ...avatarSettings,
        customAvatars: (avatarSettings.customAvatars || []).filter(a => a.id !== avatarId)
      }
      saveAvatarSettings(newSettings)
    }
  }

  const getLayoutStats = () => {
    const stats = {}
    layouts.forEach(layout => {
      stats[layout.id] = 0
    })

    Object.values(layoutPreferences).forEach(layoutId => {
      if (stats[layoutId] !== undefined) {
        stats[layoutId]++
      }
    })

    const total = quizzes.length
    const customized = Object.keys(layoutPreferences).length
    const defaulted = total - customized

    return { stats, total, customized, defaulted }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Caricamento quiz...</p>
        </div>
      </div>
    )
  }

  const { stats, total, customized, defaulted } = getLayoutStats()

  return (
    <div className="space-y-6">
      {/* SEZIONE AVATAR STUDENTI */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              👤 Personalizzazione Avatar Studenti
            </h1>
            <p className="text-gray-600">
              Carica immagini personalizzate che gli studenti possono usare come avatar
            </p>
          </div>

          {savedStatus && (
            <div className="px-4 py-2 bg-green-100 border border-green-300 rounded-lg text-green-800 font-medium">
              {savedStatus}
            </div>
          )}
        </div>

        {/* Upload Avatar */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            id="avatar-upload"
            disabled={uploadingAvatar}
          />
          <label
            htmlFor="avatar-upload"
            className={`cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors ${
              uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploadingAvatar ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Caricamento...
              </>
            ) : (
              <>
                📷 Carica Avatar
              </>
            )}
          </label>
          <p className="text-gray-500 text-sm mt-2">
            Formati supportati: JPG, PNG, GIF (max 2MB)
          </p>
        </div>

        {/* Lista Avatar Personalizzati */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {(avatarSettings.customAvatars || []).map((avatar) => (
            <div key={avatar.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => removeCustomAvatar(avatar.id)}
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm"
                  title="Rimuovi avatar"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs font-medium text-gray-700 truncate">{avatar.name}</p>
                <p className="text-xs text-gray-500">{avatar.uploadDate}</p>
              </div>
            </div>
          ))}

          {(!avatarSettings.customAvatars || avatarSettings.customAvatars.length === 0) && (
            <div className="col-span-full text-center py-8 text-gray-500">
              Nessun avatar personalizzato caricato
            </div>
          )}
        </div>
      </div>

      {/* SEZIONE LAYOUT QUIZ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              🎨 Layout Quiz
            </h1>
            <p className="text-gray-600">
              Assegna layout diversi ai tuoi quiz per personalizzare l'esperienza di gioco
            </p>
          </div>
        </div>

        {/* Statistiche utilizzo layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{total}</div>
            <div className="text-sm text-blue-700">Quiz Totali</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{customized}</div>
            <div className="text-sm text-green-700">Personalizzati</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{defaulted}</div>
            <div className="text-sm text-gray-700">Layout Classico</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {total > 0 ? Math.round((customized / total) * 100) : 0}%
            </div>
            <div className="text-sm text-purple-700">Personalizzazione</div>
          </div>
        </div>

        {/* Azioni rapide */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetAllLayoutsToDefault}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Reset Tutti
          </button>

          {layouts.map(layout => (
            <button
              key={layout.id}
              onClick={() => applyLayoutToAll(layout.id)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
              title={`Applica ${layout.name} a tutti i quiz`}
            >
              🎨 Tutti → {layout.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista quiz con selezione layout */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Quiz e Layout Associati
          </h2>
          <p className="text-sm text-gray-600">
            Seleziona il layout desiderato per ogni quiz per personalizzare l'esperienza di gioco
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="p-6">
              {/* Info quiz */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">
                      {quiz.title}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {quiz.subject}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-x-4">
                    <span>📝 {quiz.questions?.length || 0} domande</span>
                    <span>👤 {quiz.author}</span>
                    <span>📅 {quiz.created}</span>
                  </div>
                </div>

                {/* Layout corrente */}
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Layout attuale:</div>
                  <div className="font-medium text-gray-900">
                    {layoutPreferences[quiz.id]
                      ? layouts.find(l => l.id === layoutPreferences[quiz.id])?.name
                      : "🎨 Classico (Default)"}
                  </div>
                </div>
              </div>

              {/* Selezione layout */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {layouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                      layoutPreferences[quiz.id] === layout.id
                        ? 'ring-3 ring-blue-500 scale-105'
                        : 'hover:scale-102 hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => updateQuizLayout(quiz.id, layout.id)}
                    title={`${layout.name} - ${layout.description}`}
                  >
                    {/* Preview thumbnail */}
                    <div className={`aspect-video ${layout.preview} relative overflow-hidden`}>
                      {/* Layout preview elements */}
                      <div className="absolute inset-2 border border-white/20 rounded flex flex-col justify-center items-center">
                        <div className="w-8 h-1 bg-white/60 rounded mb-1"></div>
                        <div className="w-6 h-1 bg-white/40 rounded mb-2"></div>
                        <div className="grid grid-cols-2 gap-1 w-full px-1">
                          <div className="h-1 bg-white/30 rounded"></div>
                          <div className="h-1 bg-white/30 rounded"></div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {layoutPreferences[quiz.id] === layout.id && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Layout name */}
                    <div className="p-2 bg-gray-900/90 text-center">
                      <div className="text-white text-xs font-medium truncate">
                        {layout.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiche utilizzo per layout */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Utilizzo Layout
        </h2>
        <div className="space-y-3">
          {layouts.map(layout => {
            const count = stats[layout.id] || 0
            const percentage = total > 0 ? (count / total) * 100 : 0

            return (
              <div key={layout.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: layout.colors.primary }}
                  ></div>
                  <span className="font-medium text-gray-700">{layout.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {count}/{total}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}