import { useState, useRef } from 'react'
import Button from '@/components/Button'

export default function GoogleSheetsImport() {
  const [csvFile, setCsvFile] = useState(null)
  const [csvData, setCsvData] = useState([])
  const [previewData, setPreviewData] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResults, setImportResults] = useState(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Upload, 2: Preview, 3: Results
  const fileInputRef = useRef(null)

  const csvTemplate = `fullName,nickname,email,className,teacherEmails
Mario Rossi,mario_rossi,mario@student.it,5A_CHI,"prof.bianchi@scuola.it,prof.verdi@scuola.it"
Giulia Verdi,giulia_verdi,giulia@student.it,5A_CHI,"prof.bianchi@scuola.it"
Luca Blu,luca_blu,luca@student.it,4B_BIO,"prof.rossi@scuola.it"`

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_studenti_chemarena.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('Il file CSV deve contenere almeno un header e una riga di dati')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const requiredHeaders = ['fullName', 'nickname', 'email', 'className', 'teacherEmails']

    // Verifica header obbligatori
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Header mancanti nel CSV: ${missingHeaders.join(', ')}`)
    }

    const data = []
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (!line.trim()) continue

      // Parse CSV con supporto per campi quotati
      const values = []
      let current = ''
      let inQuotes = false

      for (let j = 0; j < line.length; j++) {
        const char = line[j]

        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim()) // Ultimo valore

      if (values.length !== headers.length) {
        throw new Error(`Riga ${i + 1}: numero di colonne non corrispondente (${values.length} vs ${headers.length})`)
      }

      const rowData = {}
      headers.forEach((header, index) => {
        rowData[header] = values[index].replace(/"/g, '')
      })

      // Validazione campi obbligatori
      if (!rowData.fullName || !rowData.nickname || !rowData.className) {
        throw new Error(`Riga ${i + 1}: fullName, nickname e className sono obbligatori`)
      }

      // Parse teacher emails
      if (rowData.teacherEmails) {
        rowData.teacherEmailsList = rowData.teacherEmails
          .split(',')
          .map(email => email.trim())
          .filter(email => email)
      } else {
        rowData.teacherEmailsList = []
      }

      rowData.rowNumber = i + 1
      data.push(rowData)
    }

    return data
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Seleziona un file CSV valido')
      return
    }

    setCsvFile(file)
    setError('')

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvText = e.target.result
        const parsedData = parseCSV(csvText)
        setCsvData(parsedData)
        setPreviewData(parsedData.slice(0, 5)) // Preview prime 5 righe
        setStep(2)
      } catch (error) {
        console.error('Errore parsing CSV:', error)
        setError(`Errore nel parsing CSV: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  const validateImportData = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/students-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate',
          students: csvData
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nella validazione')
      }

      return result
    } catch (error) {
      console.error('Errore validazione:', error)
      setError(`Errore validazione: ${error.message}`)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImport = async () => {
    setIsProcessing(true)
    setError('')

    try {
      // 1. Valida i dati
      const validation = await validateImportData()
      if (!validation) return

      // 2. Esegui import
      const response = await fetch('/api/students-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'import',
          students: csvData,
          validation: validation
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Errore nell\'import')
      }

      setImportResults(result)
      setStep(3)

    } catch (error) {
      console.error('Errore import:', error)
      setError(`Errore import: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetImport = () => {
    setCsvFile(null)
    setCsvData([])
    setPreviewData([])
    setImportResults(null)
    setError('')
    setStep(1)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  if (step === 3 && importResults) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">📊 Risultati Import</h2>
            <Button onClick={resetImport} className="bg-gray-500 hover:bg-gray-600">
              Nuovo Import
            </Button>
          </div>

          {/* Risultati Riepilogo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{importResults.success?.students || 0}</div>
              <div className="text-sm text-green-800">Studenti Creati</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{importResults.success?.classes || 0}</div>
              <div className="text-sm text-blue-800">Classi Create</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{importResults.success?.relationships || 0}</div>
              <div className="text-sm text-purple-800">Relazioni Create</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{importResults.warnings?.length || 0}</div>
              <div className="text-sm text-orange-800">Avvisi</div>
            </div>
          </div>

          {/* Errori se presenti */}
          {importResults.errors && importResults.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-red-900 mb-2">❌ Errori:</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {importResults.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Avvisi se presenti */}
          {importResults.warnings && importResults.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-yellow-900 mb-2">⚠️ Avvisi:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {importResults.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Successi */}
          {importResults.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-2">✅ Import Completato:</h3>
              <div className="text-sm text-green-700">
                <p>• {importResults.success.students} studenti importati con successo</p>
                <p>• {importResults.success.classes} classi create/aggiornate</p>
                <p>• {importResults.success.relationships} relazioni studente-insegnante create</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">👀 Anteprima Dati CSV</h2>
            <div className="flex space-x-2">
              <Button onClick={() => setStep(1)} className="bg-gray-500 hover:bg-gray-600">
                Indietro
              </Button>
              <Button
                onClick={handleImport}
                disabled={isProcessing}
                className="bg-green-500 hover:bg-green-600"
              >
                {isProcessing ? '🔄 Importando...' : '📥 Conferma Import'}
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              File: <span className="font-medium">{csvFile?.name}</span> |
              Righe totali: <span className="font-medium">{csvData.length}</span> studenti
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-red-700">{error}</div>
            </div>
          )}

          {/* Tabella Preview */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome Completo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nickname</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Classe</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Insegnanti</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">{row.fullName}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.nickname}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.className}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {row.teacherEmailsList.map((email, i) => (
                          <span key={i} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {email}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {csvData.length > 5 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              ... e altri {csvData.length - 5} studenti
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">📊 Import Studenti da Google Sheets</h1>
        <p className="text-gray-600 mb-6">
          Carica un file CSV esportato da Google Sheets per importare intere classi con assegnazioni multiple agli insegnanti.
        </p>

        {/* Template Download */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-500 text-xl">📋</span>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">Template CSV</h3>
              <p className="text-sm text-blue-700 mb-3">
                Scarica il template per formattare correttamente i tuoi dati in Google Sheets
              </p>
              <Button onClick={downloadTemplate} className="bg-blue-500 hover:bg-blue-600 text-sm">
                📥 Scarica Template CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Istruzioni */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">📋 Istruzioni:</h3>
          <ol className="text-sm text-gray-700 space-y-1 list-decimal ml-4">
            <li>Apri Google Sheets e crea un foglio con le colonne del template</li>
            <li>Compila i dati degli studenti (fullName, nickname, email, className)</li>
            <li>Per teacherEmails usa le email separate da virgola: "prof1@scuola.it,prof2@scuola.it"</li>
            <li>Esporta come CSV: File → Scarica → Valori separati da virgola (.csv)</li>
            <li>Carica il file qui sotto per l'import automatico</li>
          </ol>
        </div>

        {/* File Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="text-4xl">📂</div>
            <div>
              <h3 className="font-medium text-gray-900">Carica File CSV</h3>
              <p className="text-sm text-gray-600">Clicca per selezionare il file CSV da Google Sheets</p>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-500 hover:bg-green-600"
            >
              📁 Seleziona File CSV
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-700">{error}</div>
          </div>
        )}
      </div>

      {/* Format Example */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-medium text-gray-900 mb-4">📋 Esempio Formato CSV:</h3>
        <div className="bg-gray-50 rounded p-4">
          <pre className="text-sm text-gray-700 overflow-x-auto">
            {csvTemplate}
          </pre>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong></p>
          <ul className="list-disc ml-4 space-y-1">
            <li>teacherEmails: Usa le virgolette per liste multiple: "email1,email2"</li>
            <li>className: Deve corrispondere a una classe esistente o verrà creata</li>
            <li>nickname: Deve essere univoco, verrà aggiunto suffisso se necessario</li>
            <li>email: Opzionale ma consigliato per comunicazioni future</li>
          </ul>
        </div>
      </div>
    </div>
  )
}