import TronButton from "@/components/TronButton"
import QuickJoinPanel from "@/components/home/QuickJoinPanel"
import StudentOptionsPanel from "@/components/home/StudentOptionsPanel"
import StudentRegistrationForm from "@/components/home/StudentRegistrationForm"
import styles from "@/styles/homepage.module.css"

export default function HomeContent({
  showQuickJoin,
  showStudentOptions,
  showStudentRegistration,
  gamePin,
  playerName,
  isQRAccess,
  studentForm,
  availableClasses,
  registrationStatus,
  onGamePinChange,
  onPlayerNameChange,
  onQuickJoin,
  onStudentOptionsToggle,
  onOpenRegistration,
  onFormChange,
  onRegistrationSubmit,
  onRegistrationBack
}) {
  return (
    <div className={`mt-16 mb-8 ${styles.selectionArea}`}>
      <div className="text-center mb-8">
        <h2 className={styles.modeSelectionTitle}>
          <span className={styles.titleBracket}>[</span>
          <span className={styles.titleText}>ACCESSO LABORATORIO</span>
          <span className={styles.titleBracket}>]</span>
        </h2>
        <p className={styles.modeSubtitle}>
          {">> Seleziona protocollo di accesso <<"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center">
        <TronButton
          title="INSEGNANTE"
          subtitle="Crea e gestisci quiz"
          icon="👨‍🏫"
          href="/teacher-dashboard"
          variant="primary"
        />

        <TronButton
          title="STUDENTE"
          subtitle="Partecipa o registrati"
          icon="🎓"
          onClick={onStudentOptionsToggle}
          variant="secondary"
        />

        <TronButton
          title="QUIZ LIBERO"
          subtitle="Modalità di pratica"
          icon="🧪"
          href="/dashboard"
          variant="accent"
        />
      </div>

      {showQuickJoin && (
        <QuickJoinPanel
          gamePin={gamePin}
          playerName={playerName}
          isQRAccess={isQRAccess}
          onGamePinChange={onGamePinChange}
          onPlayerNameChange={onPlayerNameChange}
          onJoin={onQuickJoin}
        />
      )}

      {showStudentOptions && (
        <StudentOptionsPanel
          onQuickJoin={onOpenRegistration.showQuickJoin}
          onRegister={onOpenRegistration.showRegistration}
        />
      )}

      {showStudentRegistration && (
        <StudentRegistrationForm
          studentForm={studentForm}
          availableClasses={availableClasses}
          registrationStatus={registrationStatus}
          onFormChange={onFormChange}
          onSubmit={onRegistrationSubmit}
          onBack={onRegistrationBack}
        />
      )}
    </div>
  )
}
