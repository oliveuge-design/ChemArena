import { usePlayerContext } from "@/context/player"
import Form from "@/components/Form"
import Button from "@/components/Button"
import Input from "@/components/Input"
import { useEffect, useState } from "react"
import { useSocketContext } from "@/context/socket"
import { useRouter } from "next/router"

export default function Username() {
  const { socket, emit, on, off } = useSocketContext()
  const { player, dispatch } = usePlayerContext()
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [studentInfo, setStudentInfo] = useState(null)
  const [isCheckingStudent, setIsCheckingStudent] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(true)

  const validateUsername = (name) => {
    if (!name || name.trim().length < 3) {
      return "Il nome deve avere almeno 3 caratteri"
    }
    if (name.trim().length > 20) {
      return "Il nome non può superare 20 caratteri"
    }
    return null
  }

  // Verifica se nickname è registrato come studente
  const checkStudentNickname = async (nickname) => {
    if (!nickname || nickname.length < 3) return

    setIsCheckingStudent(true)
    try {
      const response = await fetch(`/api/students?action=check-nickname&nickname=${encodeURIComponent(nickname)}`)
      const data = await response.json()

      if (data.exists) {
        setStudentInfo(data.student)
        setShowPasswordField(data.student.requiresPassword)
        setIsAnonymous(false)
        setError("")
      } else {
        setStudentInfo(null)
        setShowPasswordField(false)
        setIsAnonymous(true)
        setError("")
      }
    } catch (error) {
      console.error('❌ Errore verifica studente:', error)
      setStudentInfo(null)
      setIsAnonymous(true)
    } finally {
      setIsCheckingStudent(false)
    }
  }

  // Debounce per la verifica nickname
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (username.trim().length >= 3) {
        checkStudentNickname(username.trim())
      } else {
        setStudentInfo(null)
        setIsAnonymous(true)
        setShowPasswordField(false)
      }
    }, 800)

    return () => clearTimeout(timeoutId)
  }, [username])

  const handleJoin = async () => {
    const validationError = validateUsername(username)

    if (validationError) {
      setError(validationError)
      return
    }

    // Se è uno studente registrato, autentica prima
    if (!isAnonymous && studentInfo) {
      try {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'authenticate',
            nickname: username.trim(),
            className: studentInfo.className,
            password: password
          })
        })

        const authResult = await response.json()

        if (!response.ok) {
          setError(authResult.error || 'Errore autenticazione')
          return
        }

        // Studente autenticato correttamente
        const playerData = {
          username: username.trim(),
          room: player.room,
          displayName: `${studentInfo.fullName} (${studentInfo.className})`,
          studentId: studentInfo.id,
          isRegistered: true,
          className: studentInfo.className
        }

        emit("player:join", playerData)
      } catch (error) {
        console.error('❌ Errore autenticazione:', error)
        setError('Errore di connessione. Riprova.')
      }
    } else {
      // Accesso anonimo
      setError("")

      const playerData = {
        username: username.trim(),
        room: player.room,
        displayName: username.trim(),
        isRegistered: false
      }

      emit("player:join", playerData)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleJoin()
    }
  }

  useEffect(() => {
    on("game:successJoin", () => {
      dispatch({
        type: "LOGIN",
        payload: username.trim(),
      })

      router.replace("/game")
    })

    return () => {
      off("game:successJoin")
    }
  }, [username, on, off, dispatch, router])

  const isValid = !validateUsername(username) && username.trim().length >= 3 && (!showPasswordField || password.length > 0)

  return (
    <Form>
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              if (error) setError("")
            }}
            onKeyDown={handleKeyDown}
            placeholder="Il tuo nickname (min. 3 caratteri)"
            className={error ? "border-red-500" : ""}
            type="text"
            maxLength="20"
            autoFocus={true}
          />
          {isCheckingStudent && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Info Studente Registrato */}
        {studentInfo && !isAnonymous && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">👤</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Studente Registrato: {studentInfo.fullName}
                </p>
                <p className="text-xs text-blue-600">
                  Classe: {studentInfo.className}
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                📊 Statistiche Attive
              </span>
            </div>
          </div>
        )}

        {/* Campo Password se richiesto */}
        {showPasswordField && (
          <Input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError("")
            }}
            onKeyDown={handleKeyDown}
            placeholder="Password richiesta per questo account"
            type="password"
            className={error ? "border-red-500" : "border-blue-300"}
          />
        )}

        {/* Modalità Anonima */}
        {isAnonymous && username.length >= 3 && !isCheckingStudent && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">👻</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">
                  Modalità Anonima
                </p>
                <p className="text-xs text-gray-500">
                  Le statistiche non verranno salvate
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <p className="text-xs text-center text-gray-500">
          {isAnonymous
            ? "🎮 Inserisci un nickname per entrare nel gioco!"
            : "🎓 Accesso come studente registrato - Le tue statistiche verranno salvate!"
          }
        </p>
      </div>

      <Button
        onClick={handleJoin}
        disabled={!isValid}
        className={`mt-4 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isAnonymous ? '🎮 Entra nel Gioco' : '🎓 Accedi come Studente'}
      </Button>
    </Form>
  )
}
