export default function StudentRegistrationForm({
  studentForm,
  availableClasses,
  registrationStatus,
  onFormChange,
  onSubmit,
  onBack
}) {
  return (
    <div className="mt-8 max-w-lg mx-auto quick-join-panel">
      <div className="tron-panel p-6">
        <h3 className="text-cyan-400 text-xl font-bold mb-6 text-center">
          📝 REGISTRAZIONE STUDENTE
        </h3>

        {registrationStatus === 'success' && (
          <div className="bg-green-900/20 border border-green-400/30 rounded-lg p-4 mb-6">
            <p className="text-green-300 text-center">
              ✅ Registrazione completata! Ti stiamo reindirizzando...
            </p>
          </div>
        )}

        {registrationStatus === 'error' && (
          <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-center">
              ❌ Errore nella registrazione. Riprova o contatta il tuo insegnante.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Nickname (per giocare)..."
              value={studentForm.nickname}
              onChange={(e) => onFormChange({...studentForm, nickname: e.target.value})}
              className="tron-input w-full"
              required
              disabled={registrationStatus === 'loading'}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Nome e Cognome..."
              value={studentForm.fullName}
              onChange={(e) => onFormChange({...studentForm, fullName: e.target.value})}
              className="tron-input w-full"
              required
              disabled={registrationStatus === 'loading'}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (opzionale)..."
              value={studentForm.email}
              onChange={(e) => onFormChange({...studentForm, email: e.target.value})}
              className="tron-input w-full"
              disabled={registrationStatus === 'loading'}
            />
          </div>
          <div>
            <select
              value={studentForm.selectedClass}
              onChange={(e) => onFormChange({...studentForm, selectedClass: e.target.value})}
              className="tron-input w-full"
              required
              disabled={registrationStatus === 'loading'}
            >
              <option value="">Seleziona la tua classe...</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.name}>
                  {cls.name} - {cls.school}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={registrationStatus === 'loading' || !studentForm.nickname || !studentForm.fullName || !studentForm.selectedClass}
              className="tron-register-btn flex-1"
            >
              {registrationStatus === 'loading' ? '⏳ REGISTRANDO...' : '📝 REGISTRATI'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="tron-back-btn flex-1"
              disabled={registrationStatus === 'loading'}
            >
              ← INDIETRO
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
