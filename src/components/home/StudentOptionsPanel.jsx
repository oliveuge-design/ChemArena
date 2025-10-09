export default function StudentOptionsPanel({ onQuickJoin, onRegister }) {
  return (
    <div className="mt-8 max-w-md mx-auto quick-join-panel">
      <div className="tron-panel p-6">
        <h3 className="text-cyan-400 text-xl font-bold mb-6 text-center">
          🎓 AREA STUDENTE
        </h3>
        <div className="space-y-4">
          <button
            onClick={onQuickJoin}
            className="tron-join-btn w-full"
          >
            🚀 ENTRA IN UN QUIZ
          </button>
          <button
            onClick={onRegister}
            className="tron-register-btn w-full"
          >
            📝 REGISTRATI NELLA CLASSE
          </button>
        </div>
      </div>
    </div>
  )
}
