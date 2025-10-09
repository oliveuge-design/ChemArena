import { useState } from "react"

export default function useStudentRegistration() {
  const [studentForm, setStudentForm] = useState({
    nickname: "",
    fullName: "",
    email: "",
    selectedClass: ""
  })
  const [availableClasses, setAvailableClasses] = useState([])
  const [registrationStatus, setRegistrationStatus] = useState("")

  const loadAvailableClasses = async () => {
    try {
      const response = await fetch("/api/classes?action=list")
      const data = await response.json()
      setAvailableClasses(data.classes || [])
    } catch (error) {
      console.error("Errore caricamento classi:", error)
      setAvailableClasses([])
    }
  }

  const handleStudentRegistration = async (e, callbacks) => {
    e.preventDefault()
    setRegistrationStatus("loading")

    try {
      const response = await fetch("/api/students-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          students: [{
            fullName: studentForm.fullName,
            nickname: studentForm.nickname,
            email: studentForm.email,
            className: studentForm.selectedClass,
            teacherEmailsList: []
          }]
        })
      })

      const data = await response.json()

      if (data.success && data.success.students > 0) {
        setRegistrationStatus("success")
        setStudentForm({ nickname: "", fullName: "", email: "", selectedClass: "" })

        setTimeout(() => {
          if (callbacks?.onSuccess) {
            callbacks.onSuccess(studentForm.nickname)
          }
        }, 2000)
      } else {
        setRegistrationStatus("error")
        console.error("Errore registrazione:", data.errors)
      }
    } catch (error) {
      console.error("Errore registrazione studente:", error)
      setRegistrationStatus("error")
    }
  }

  return {
    studentForm,
    setStudentForm,
    availableClasses,
    registrationStatus,
    setRegistrationStatus,
    loadAvailableClasses,
    handleStudentRegistration
  }
}
