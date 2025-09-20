import { useState, useRef } from "react"
import LuminousTriangleLoader from "@/components/LuminousTriangleLoader"

export default function AIQuizGeneratorStatic() {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [generatedQuiz, setGeneratedQuiz] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [config, setConfig] = useState({
    subject: '',
    numQuestions: 10,
    difficulty: 'medium',
    numAnswers: 4
  })
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files)
    const validFiles = selectedFiles.filter(file => {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ]
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024
    })

    if (validFiles.length !== selectedFiles.length) {
      setStatusMessage('⚠️ Alcuni file non sono supportati. Usa PDF, DOC, DOCX o TXT (max 50MB)')
    }

    setFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateAndGenerate = async () => {
    if (!config.subject.trim()) {
      setStatusMessage('❌ Inserisci la materia del quiz')
      return
    }

    if (files.length === 0) {
      setStatusMessage('❌ Carica almeno un documento')
      return
    }

    if (!apiKey.trim() || !apiKey.startsWith('sk-')) {
      setStatusMessage('❌ Inserisci una API Key OpenAI valida (inizia con "sk-")')
      return
    }

    setIsProcessing(true)
    setStatusMessage('🚀 Inizio generazione quiz...')

    try {
      // Step 1: Process documents
      setStatusMessage('📄 Elaborazione documenti...')
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
        throw new Error(errorData.error || 'Errore durante elaborazione documenti')
      }

      const processedData = await uploadResponse.json()
      setStatusMessage('🤖 Generazione domande AI...')

      // Step 2: Generate quiz
      const generateResponse = await fetch('/api/ai-quiz/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: processedData.extractedContent,
          config: config,
          apiKey: apiKey
        })
      })

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json()
        throw new Error(errorData.error || 'Errore durante generazione quiz')
      }

      const generatedData = await generateResponse.json()

      if (generatedData.success && generatedData.quiz) {
        setStatusMessage('💾 Salvataggio quiz...')

        // Step 3: Save to archive
        const saveResponse = await fetch('/api/quiz-archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: generatedData.quiz.title,
            subject: generatedData.quiz.subject,
            questions: generatedData.quiz.questions,
            password: generatedData.quiz.password,
            created: new Date().toISOString().split('T')[0],
            author: 'AI Generator'
          })
        })

        if (saveResponse.ok) {
          setStatusMessage('🎉 Quiz creato con successo!')
          setGeneratedQuiz(generatedData.quiz)

          // Reset form
          setFiles([])
          setApiKey('')
          setConfig({ subject: '', numQuestions: 10, difficulty: 'medium', numAnswers: 4 })

          setTimeout(() => {
            setStatusMessage('')
          }, 3000)
        } else {
          throw new Error('Errore durante il salvataggio')
        }
      } else {
        throw new Error('Quiz non generato correttamente')
      }
    } catch (error) {
      setStatusMessage(`❌ Errore: ${error.message}`)
      setTimeout(() => {
        setStatusMessage('')
      }, 5000)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetForm = () => {
    setGeneratedQuiz(null)
    setStatusMessage('')
    setFiles([])
    setApiKey('')
    setConfig({ subject: '', numQuestions: 10, difficulty: 'medium', numAnswers: 4 })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">🤖 Generatore Quiz AI</h2>
        <div className="text-blue-100">
          Trasforma automaticamente i tuoi documenti in quiz interattivi
        </div>
      </div>

      {/* Success Screen - Always rendered, controlled by visibility */}
      <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 border border-green-200 ${generatedQuiz ? 'block' : 'hidden'}`}>
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h3 className="text-2xl font-bold text-green-700">Quiz Creato con Successo!</h3>

          {generatedQuiz && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-bold text-lg text-gray-800">{generatedQuiz.title}</h4>
              <div className="flex justify-center items-center space-x-6 mt-2 text-sm text-gray-600">
                <span>📚 {generatedQuiz.subject}</span>
                <span>❓ {generatedQuiz.questions?.length || 0} domande</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => window.location.href = '/dashboard?tab=archive'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              📁 Vai all'Archivio Quiz
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              ➕ Crea Altro Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Form - Always rendered, controlled by visibility */}
      <div className={generatedQuiz ? 'hidden' : 'block'}>
        {/* API Key Input */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🔑 Configurazione AI</h3>
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showApiKeyInput ? 'Nascondi' : 'Configura API Key'}
            </button>
          </div>

          <div className={showApiKeyInput ? 'block' : 'hidden'}>
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
            <div className="text-xs text-gray-500 mt-1">
              Ottieni la tua API Key da platform.openai.com
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📁 Carica Documenti</h3>

          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-4xl mb-2">📤</div>
            <div className="text-lg font-medium text-gray-700 mb-2">
              Clicca per selezionare file
            </div>
            <div className="text-sm text-gray-500">
              ✅ Supportati: PDF, DOC, DOCX, TXT (max 50MB)
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">File caricati ({files.length}):</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded mb-2">
                  <span className="text-sm">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Configurazione Quiz</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="text-xs text-gray-500 mt-1">
                {config.numQuestions <= 15 ? '⚡ Veloce (1-15 domande)' :
                 config.numQuestions <= 30 ? '⏱️ Medio (16-30 domande)' :
                 '🚀 Avanzato (31-50 domande)'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opzioni per Domanda
              </label>
              <select
                value={config.numAnswers}
                onChange={(e) => setConfig({...config, numAnswers: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 opzioni</option>
                <option value={3}>3 opzioni</option>
                <option value={4}>4 opzioni</option>
                <option value={5}>5 opzioni</option>
                <option value={6}>6 opzioni</option>
                <option value={7}>7 opzioni</option>
                <option value={8}>8 opzioni</option>
              </select>
              <div className="text-xs text-gray-500 mt-1">
                🎯 Da 2 a 8 opzioni di risposta
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficoltà
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setConfig({...config, difficulty: 'easy'})}
                className={`px-4 py-2 rounded-lg border ${
                  config.difficulty === 'easy'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                🟢 Principiante
              </button>
              <button
                type="button"
                onClick={() => setConfig({...config, difficulty: 'medium'})}
                className={`px-4 py-2 rounded-lg border ${
                  config.difficulty === 'medium'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                🟡 Intermedio
              </button>
              <button
                type="button"
                onClick={() => setConfig({...config, difficulty: 'hard'})}
                className={`px-4 py-2 rounded-lg border ${
                  config.difficulty === 'hard'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                🔴 Avanzato
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={validateAndGenerate}
            disabled={isProcessing || files.length === 0 || !apiKey.trim()}
            className={`px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
              isProcessing || files.length === 0 || !apiKey.trim()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? '⏳ Generazione in corso...' : '🚀 Genera Quiz con AI'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse text-blue-500">⚡</div>
            <div className="text-blue-700 font-medium">{statusMessage}</div>
          </div>
        </div>
      )}

      {/* Loading Animation */}
      {isProcessing && (
        <LuminousTriangleLoader
          message="🤖 AI sta analizzando i documenti e generando domande intelligenti..."
        />
      )}
    </div>
  )
}