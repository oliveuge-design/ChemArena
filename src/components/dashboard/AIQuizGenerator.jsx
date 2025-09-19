import { useState, useRef } from "react"
import Button from "@/components/Button"
import LuminousTriangleLoader from "@/components/LuminousTriangleLoader"

export default function AIQuizGenerator() {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [debugInfo, setDebugInfo] = useState('')
  const [config, setConfig] = useState({
    subject: '',
    numQuestions: 10,
    difficulty: 'medium',
    language: 'italian',
    questionTypes: ['multiple_choice'],
    includeImages: false
  })
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const fileInputRef = useRef(null)

  const difficultyLevels = {
    easy: {
      name: 'Principiante',
      description: 'Domande dirette dal testo, definizioni base, riconoscimento semplice',
      icon: '🟢'
    },
    medium: {
      name: 'Intermedio',
      description: 'Inferenze e collegamenti, applicazione dei concetti, analisi guidata',
      icon: '🟡'
    },
    hard: {
      name: 'Avanzato',
      description: 'Analisi critica, sintesi complessa, problem solving, valutazione',
      icon: '🔴'
    }
  }

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const validFiles = selectedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
      ]
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024 // 50MB max
    })

    if (validFiles.length !== selectedFiles.length) {
      alert('Alcuni file non sono supportati o sono troppo grandi (max 50MB). Formati supportati: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG')
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (file) => {
    if (file.type.includes('pdf')) return '📄'
    if (file.type.includes('word')) return '📝'
    if (file.type.includes('powerpoint') || file.type.includes('presentation')) return '📊'
    if (file.type.includes('text')) return '📋'
    if (file.type.includes('image')) return '🖼️'
    return '📁'
  }

  const validateConfig = () => {
    if (!config.subject.trim()) {
      alert('Inserisci la materia del quiz')
      return false
    }
    if (config.numQuestions < 1 || config.numQuestions > 50) {
      alert('Il numero di domande deve essere tra 1 e 50')
      return false
    }
    if (files.length === 0) {
      alert('Carica almeno un documento per generare il quiz')
      return false
    }
    if (!apiKey.trim()) {
      alert('Inserisci la tua API Key OpenAI per utilizzare l\'AI')
      return false
    }

    // Validazione formato API Key OpenAI
    if (!apiKey.startsWith('sk-')) {
      alert('L\'API Key OpenAI deve iniziare con "sk-". Verifica di aver copiato correttamente la chiave da https://platform.openai.com/account/api-keys')
      return false
    }

    if (apiKey.includes('\\') || apiKey.includes('/') || apiKey.includes(':')) {
      alert('L\'API Key sembra essere un path di file. Inserisci la vera API Key di OpenAI (inizia con "sk-")')
      return false
    }

    return true
  }

  const generateQuiz = async () => {
    if (!validateConfig()) return

    setIsProcessing(true)
    setDebugInfo('🚀 Inizio generazione quiz...')

    try {
      // Fase 1: Upload e parsing documenti
      setDebugInfo('📄 Elaborazione documenti in corso...')
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })
      formData.append('config', JSON.stringify(config))
      formData.append('apiKey', apiKey)

      const uploadResponse = await fetch('/api/ai-quiz/process-documents', {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error || 'Errore durante l\'elaborazione dei documenti')
      }

      const processedData = await uploadResponse.json()

      if (processedData.errors && processedData.errors.length > 0) {
        setDebugInfo(`⚠️ Alcuni file hanno avuto problemi: ${processedData.errors.join(', ')}`)
      } else {
        setDebugInfo(`✅ ${processedData.successfulFiles}/${processedData.processedFiles} documenti elaborati con successo!`)
      }

      // Fase 2: Generazione quiz con AI
      setDebugInfo('🤖 Generazione domande intelligenti in corso...')
      const generateResponse = await fetch('/api/ai-quiz/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: processedData.extractedContent,
          config: config,
          apiKey: apiKey
        })
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Errore durante la generazione del quiz')
      }

      const generatedData = await generateResponse.json()

      if (generatedData.success && generatedData.quiz) {
        setDebugInfo('💾 Salvataggio quiz nell\'archivio...')

        // Salva automaticamente nell'archivio
        await saveQuizToArchiveAuto(generatedData.quiz)

        setDebugInfo('🎉 Quiz creato e salvato con successo!')

        // Reset form dopo successo
        setFiles([])
        setApiKey('')
        setConfig({
          subject: '',
          numQuestions: 10,
          difficulty: 'medium',
          language: 'italian',
          questionTypes: ['multiple_choice'],
          includeImages: false
        })

        // Attendi un momento per mostrare il successo, poi mostra il quiz
        setTimeout(() => {
          setGeneratedQuiz(generatedData.quiz)
          setDebugInfo('')
        }, 1500)

      } else {
        throw new Error('Quiz non generato correttamente')
      }

    } catch (error) {
      setDebugInfo(`❌ Errore: ${error.message}`)
      setTimeout(() => {
        setDebugInfo('')
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const saveQuizToArchiveAuto = async (quiz) => {
    const response = await fetch('/api/quiz-archive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        title: quiz.title,
        subject: quiz.subject,
        questions: quiz.questions,
        password: quiz.password,
        created: new Date().toISOString().split('T')[0],
        author: 'AI Generator',
        source: 'AI Generated from Documents'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Errore durante il salvataggio automatico')
    }

    return response.json()
  }


  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🤖 Generatore Quiz AI</h2>
        <p className="text-blue-100">
          Trasforma automaticamente i tuoi documenti in quiz interattivi usando l'intelligenza artificiale
        </p>
      </div>

      {/* API Key Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">🔑 Configurazione AI</h3>
          <button
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showApiKeyInput ? 'Nascondi' : 'Configura API Key'}
          </button>
        </div>

        {showApiKeyInput && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Inserisci la tua OpenAI API Key (inizia con "sk-"). Ottienila da{' '}
                <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  platform.openai.com
                </a>
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✅ La tua API Key non viene salvata e viene utilizzata solo per questa sessione
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📁 Carica Documenti</h3>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const droppedFiles = Array.from(e.dataTransfer.files)
            handleFileUpload({ target: { files: droppedFiles } })
          }}
        >
          <div className="space-y-2">
            <div className="text-4xl">📤</div>
            <p className="text-lg font-medium text-gray-700">
              Trascina i file qui o clicca per selezionarli
            </p>
            <p className="text-sm text-gray-500">
              ✅ Completamente supportati: PDF, DOC, DOCX, TXT
            </p>
            <p className="text-xs text-gray-400">
              ⚠️ In sviluppo: PPT, PPTX, JPG, PNG (max 50MB per file)
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Files List */}
        {files.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">File caricati ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file)}</span>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">⚙️ Configurazione Quiz</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Materia
            </label>
            <input
              type="text"
              value={config.subject}
              onChange={(e) => setConfig({...config, subject: e.target.value})}
              placeholder="es. Chimica Organica"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numero di Domande
            </label>
            <input
              type="number"
              value={config.numQuestions}
              onChange={(e) => setConfig({...config, numQuestions: parseInt(e.target.value) || 10})}
              min="1"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Livello di Difficoltà
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(difficultyLevels).map(([key, level]) => (
                <button
                  key={key}
                  onClick={() => setConfig({...config, difficulty: key})}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    config.difficulty === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xl">{level.icon}</span>
                    <span className="font-medium">{level.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{level.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <Button
          onClick={generateQuiz}
          disabled={isProcessing || files.length === 0 || !apiKey.trim()}
          className="px-8 py-3 text-lg"
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">🔄</span>
              Generazione in corso...
            </>
          ) : (
            <>
              🚀 Genera Quiz con AI
            </>
          )}
        </Button>
      </div>

      {/* Status Info */}
      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse text-blue-500">⚡</div>
            <p className="text-blue-700 font-medium">{debugInfo}</p>
          </div>
        </div>
      )}

      {/* Quiz Generated Success */}
      {generatedQuiz && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-2xl font-bold text-green-700">Quiz Creato con Successo!</h3>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-lg text-gray-800">{generatedQuiz.title}</h4>
              <div className="flex justify-center items-center space-x-6 mt-2 text-sm text-gray-600">
                <span>📚 {generatedQuiz.subject}</span>
                <span>❓ {generatedQuiz.questions?.length || 0} domande</span>
                <span>🔐 {generatedQuiz.password}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/dashboard?tab=archive'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                📁 Vai all'Archivio Quiz
              </Button>
              <Button
                onClick={() => {
                  setGeneratedQuiz(null)
                  setDebugInfo('')
                }}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ➕ Crea Altro Quiz
              </Button>
            </div>

            <p className="text-sm text-gray-500">
              Il tuo quiz è stato salvato automaticamente e può essere utilizzato per creare una partita!
            </p>
          </div>
        </div>
      )}

      {/* Processing Status with Luminous Triangle */}
      {isProcessing && (
        <LuminousTriangleLoader
          message="🤖 AI sta analizzando i documenti e generando domande intelligenti..."
        />
      )}
    </div>
  )
}