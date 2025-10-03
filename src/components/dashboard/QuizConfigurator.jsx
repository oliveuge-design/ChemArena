import { memo } from "react"
import Button from "@/components/Button"

const THEME_PREVIEWS = {
  laboratory: {
    name: "Laboratorio Cyberpunk",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    accentColor: "#00ff88"
  },
  gaming1: {
    name: "Gaming Tech Arancione",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1b00 50%, #ff6b00 100%)",
    accentColor: "#ff8c00"
  },
  gaming2: {
    name: "Gaming Tech Avanzato",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a0f00 50%, #ff5500 100%)",
    accentColor: "#ff6b00"
  },
  gaming3: {
    name: "Gaming Tech Premium",
    gradient: "linear-gradient(135deg, #000000 0%, #1f1100 50%, #ff7700 100%)",
    accentColor: "#ff4500"
  },
  original: {
    name: "Laboratorio Completo",
    gradient: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    accentColor: "#00bfff"
  }
}

const QuizConfigurator = memo(function QuizConfigurator({
  selectedQuiz,
  gameSettings,
  onModeChange,
  onSettingsChange,
  onLaunch,
  isLaunching,
  safeLength,
  safeMath,
  getModeConfig
}) {
  if (!selectedQuiz) return null

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">Configurazione Quiz</h3>
        <div className="text-gray-600">{String(selectedQuiz?.title || 'Quiz')}</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-8">
        {/* Info Quiz */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg text-gray-900 mb-4">📊 Informazioni Quiz</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{safeLength(selectedQuiz.questions)}</div>
              <div className="text-sm text-gray-600">Domande</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {safeMath(() => {
                  if (!Array.isArray(selectedQuiz.questions)) return 0
                  const total = selectedQuiz.questions.reduce((sum, q) => {
                    if (!q || typeof q !== 'object') return sum
                    return sum + (q.time || 15) + (q.cooldown || 5)
                  }, 0)
                  return total / 60
                })} min
              </div>
              <div className="text-sm text-gray-600">Durata</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{safeMath(() => (Array.isArray(selectedQuiz.questions) ? selectedQuiz.questions.length : 0) * 1000)}</div>
              <div className="text-sm text-gray-600">Punti Max</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{selectedQuiz.password || 'Nessuna'}</div>
              <div className="text-sm text-gray-600">Password</div>
            </div>
          </div>
        </div>

        {/* Modalità Quiz */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg text-gray-900 mb-4">🎮 Modalità di Gioco</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {['standard', 'chase', 'appearing', 'timed', 'untimed', 'survival'].map((mode) => {
              const config = getModeConfig(mode)
              return (
                <button
                  key={mode}
                  onClick={() => onModeChange(mode)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    gameSettings.gameMode === mode
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">{config.icon}</div>
                  <div className="font-semibold">{config.name}</div>
                  <div className="text-sm text-gray-600">{config.desc}</div>
                </button>
              )
            })}
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="font-semibold text-blue-900">
              {getModeConfig(gameSettings.gameMode).icon} Modalità attiva: {getModeConfig(gameSettings.gameMode).name}
            </div>
            <div className="text-sm text-blue-700 mt-1">{getModeConfig(gameSettings.gameMode).desc}</div>
          </div>
        </div>

        {/* Tema Visivo */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg text-gray-900 mb-4">🎨 Tema Visivo</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(THEME_PREVIEWS).map(([themeKey, theme]) => (
              <button
                key={themeKey}
                onClick={() => onSettingsChange({ ...gameSettings, backgroundTheme: themeKey })}
                className={`relative group overflow-hidden rounded-xl transition-all duration-300 ${
                  gameSettings.backgroundTheme === themeKey
                    ? 'ring-4 ring-blue-500 scale-105'
                    : 'hover:scale-102 hover:shadow-lg'
                }`}
              >
                {/* Anteprima miniatura */}
                <div
                  className="h-24 w-full relative"
                  style={{ background: theme.gradient }}
                >
                  {/* Pattern decorativo */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-2 left-2 w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="absolute top-4 right-3 w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="absolute bottom-3 left-4 w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                  </div>

                  {/* Checkmark se selezionato */}
                  {gameSettings.backgroundTheme === themeKey && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Nome tema */}
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-900 text-center truncate">
                    {theme.name}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-900 font-medium">
              🎨 Tema selezionato: {THEME_PREVIEWS[gameSettings.backgroundTheme || 'gaming1']?.name || 'Gaming Tech Arancione'}
            </div>
          </div>
        </div>

        {/* Opzioni Avanzate */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h4 className="font-bold text-lg text-gray-900 mb-4">⚡ Opzioni Avanzate</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'shuffleQuestions', label: 'Mescola domande', icon: '🔀' },
              { key: 'shuffleAnswers', label: 'Mescola risposte', icon: '🎲' },
              { key: 'bonusForSpeed', label: 'Bonus velocità', icon: '⚡' },
              { key: 'autoAdvance', label: 'Avanzamento auto', icon: '⏭️' },
              { key: 'allowLateJoin', label: 'Accesso tardivo', icon: '🚪' },
              { key: 'showLeaderboardBetweenQuestions', label: 'Classifica intermedia', icon: '🏆' }
            ].map((option) => (
              <label key={option.key} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gameSettings[option.key]}
                  onChange={(e) => onSettingsChange(prev => ({ ...prev, [option.key]: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-xl">{option.icon}</span>
                <span className="text-sm font-medium text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Big Launch Button */}
      <div className="text-center pt-6 border-t">
        <Button
          onClick={onLaunch}
          disabled={isLaunching}
          className="px-16 py-6 text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 shadow-xl rounded-2xl"
        >
          {isLaunching ? "🔄 Avvio in corso..." : "🚀 LANCIA QUIZ"}
        </Button>
        <div className="text-sm text-gray-500 mt-3">
          Ti porterà alla pagina manager per generare il PIN studenti
        </div>
      </div>
    </div>
  )
})

export default QuizConfigurator