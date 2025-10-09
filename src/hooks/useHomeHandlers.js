import { useRouter } from "next/router"

export default function useHomeHandlers({
  gamePin,
  playerName,
  setShowStudentRegistration,
  setShowStudentOptions,
  setShowQuickJoin,
  setPlayerName,
  setRegistrationStatus,
  loadAvailableClasses,
  handleStudentRegistration
}) {
  const router = useRouter()

  const handleQuickJoin = () => {
    if (gamePin.trim() && playerName.trim()) {
      router.push(`/game?pin=${gamePin.trim()}&name=${encodeURIComponent(playerName.trim())}`)
    }
  }

  const openRegistration = () => {
    setShowStudentRegistration(true)
    setShowStudentOptions(false)
    loadAvailableClasses()
  }

  const handleRegistrationSubmit = (e) => {
    handleStudentRegistration(e, {
      onSuccess: (nickname) => {
        setShowStudentRegistration(false)
        setShowStudentOptions(false)
        setShowQuickJoin(true)
        setPlayerName(nickname)
      }
    })
  }

  const handleRegistrationBack = () => {
    setShowStudentRegistration(false)
    setShowStudentOptions(true)
    setRegistrationStatus("")
  }

  const handleStudentOptionsToggle = (current) => () => {
    setShowStudentOptions(!current)
  }

  const handleOpenQuickJoin = () => {
    setShowStudentOptions(false)
    setShowQuickJoin(true)
  }

  return {
    handleQuickJoin,
    openRegistration,
    handleRegistrationSubmit,
    handleRegistrationBack,
    handleStudentOptionsToggle,
    handleOpenQuickJoin
  }
}
