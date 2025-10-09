import { useState } from "react"
import useStudentRegistration from "@/hooks/useStudentRegistration"
import useHomeHandlers from "@/hooks/useHomeHandlers"

export default function useHomeState() {
  const [showQuickJoin, setShowQuickJoin] = useState(false)
  const [showStudentOptions, setShowStudentOptions] = useState(false)
  const [showStudentRegistration, setShowStudentRegistration] = useState(false)
  const [gamePin, setGamePin] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [isQRAccess] = useState(false)
  const {
    studentForm,
    setStudentForm,
    availableClasses,
    registrationStatus,
    setRegistrationStatus,
    loadAvailableClasses,
    handleStudentRegistration
  } = useStudentRegistration()
  const handlers = useHomeHandlers({
    gamePin,
    playerName,
    setShowStudentRegistration,
    setShowStudentOptions,
    setShowQuickJoin,
    setPlayerName,
    setRegistrationStatus,
    loadAvailableClasses,
    handleStudentRegistration
  })

  const contentProps = {
    showQuickJoin,
    showStudentOptions,
    showStudentRegistration,
    gamePin,
    playerName,
    isQRAccess,
    studentForm,
    availableClasses,
    registrationStatus,
    onGamePinChange: setGamePin,
    onPlayerNameChange: setPlayerName,
    onQuickJoin: handlers.handleQuickJoin,
    onStudentOptionsToggle: handlers.handleStudentOptionsToggle(showStudentOptions),
    onOpenRegistration: {
      showQuickJoin: handlers.handleOpenQuickJoin,
      showRegistration: handlers.openRegistration
    },
    onFormChange: setStudentForm,
    onRegistrationSubmit: handlers.handleRegistrationSubmit,
    onRegistrationBack: handlers.handleRegistrationBack
  }

  return contentProps
}
