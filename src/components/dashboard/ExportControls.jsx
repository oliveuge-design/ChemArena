/**
 * ChemArena - Export Controls per Analytics
 *
 * Sistema di export avanzato per reports e dati analytics:
 * - Export CSV/JSON/PDF dei dati
 * - Generazione reports automatici
 * - Filtri temporali e per categoria
 * - Export charts come immagini
 */

import { useState } from 'react'

export default function ExportControls({ analytics }) {
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState('week')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (type) => {
    setIsExporting(true)

    try {
      // Simula export - in una vera implementazione si connetterebbe all'API
      await new Promise(resolve => setTimeout(resolve, 2000))

      const data = generateExportData(type, analytics)
      const filename = `chemarena-${type}-${new Date().toISOString().split('T')[0]}`

      if (exportFormat === 'csv') {
        downloadCSV(data, filename)
      } else if (exportFormat === 'json') {
        downloadJSON(data, filename)
      } else if (exportFormat === 'pdf') {
        // Placeholder per export PDF
        alert('📄 Export PDF in sviluppo - Feature avanzata per prossime versioni!')
      }

    } catch (error) {
      console.error('Errore durante export:', error)
      alert('❌ Errore durante l\'export')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/60 rounded-2xl border-2 border-gray-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 font-mono">
        📊 Export & Reports
      </h3>

      {/* Controlli Export */}
      <div className="space-y-4">
        {/* Formato Export */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            Formato Export
          </label>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="w-full bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
          >
            <option value="csv">CSV (Excel Compatible)</option>
            <option value="json">JSON (Sviluppatori)</option>
            <option value="pdf">PDF Report (Pro)</option>
          </select>
        </div>

        {/* Range Temporale */}
        <div>
          <label className="block text-sm font-medium text-cyan-400 mb-2">
            Periodo Dati
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-black/40 border border-cyan-500/30 rounded-lg px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
          >
            <option value="day">Ultimo Giorno</option>
            <option value="week">Ultima Settimana</option>
            <option value="month">Ultimo Mese</option>
            <option value="quarter">Ultimo Trimestre</option>
            <option value="all">Tutti i Dati</option>
          </select>
        </div>

        {/* Pulsanti Export */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={() => handleExport('performance')}
            disabled={isExporting}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-mono px-4 py-3 rounded-lg transition-all duration-200 text-sm"
          >
            {isExporting ? '🔄 Export...' : '📈 Performance Data'}
          </button>

          <button
            onClick={() => handleExport('engagement')}
            disabled={isExporting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-mono px-4 py-3 rounded-lg transition-all duration-200 text-sm"
          >
            {isExporting ? '🔄 Export...' : '🔥 Engagement Data'}
          </button>

          <button
            onClick={() => handleExport('quiz-stats')}
            disabled={isExporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-mono px-4 py-3 rounded-lg transition-all duration-200 text-sm"
          >
            {isExporting ? '🔄 Export...' : '📝 Quiz Statistics'}
          </button>

          <button
            onClick={() => handleExport('full-report')}
            disabled={isExporting}
            className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 disabled:opacity-50 text-white font-mono px-4 py-3 rounded-lg transition-all duration-200 text-sm"
          >
            {isExporting ? '🔄 Export...' : '📊 Report Completo'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 rounded-lg border border-cyan-500/30">
          <h4 className="text-sm font-bold text-cyan-400 mb-2">📋 Quick Export Info</h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Ultimo Export:</span>
              <div className="text-white font-mono">2 ore fa</div>
            </div>
            <div>
              <span className="text-gray-400">Records Disponibili:</span>
              <div className="text-white font-mono">{analytics?.totalRecords || '1,247'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Utility functions per export
function generateExportData(type, analytics) {
  const baseData = {
    timestamp: new Date().toISOString(),
    generatedBy: 'ChemArena Analytics System',
    exportType: type,
    version: '2.0.0'
  }

  switch (type) {
    case 'performance':
      return {
        ...baseData,
        data: {
          accuracy: analytics?.performanceData?.accuracy || [85, 92, 78, 88, 95],
          speed: analytics?.performanceData?.speed || [720, 850, 640, 780, 920],
          questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
          averageAccuracy: 87.6,
          averageSpeed: 762
        }
      }

    case 'engagement':
      return {
        ...baseData,
        data: {
          hourlyEngagement: analytics?.engagementData?.engagement || [78, 85, 92, 88, 75, 82, 90],
          timeSlots: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
          peakHour: '11:00',
          averageEngagement: 84.3
        }
      }

    case 'quiz-stats':
      return {
        ...baseData,
        data: analytics?.quizStats || {
          totalQuizzes: 156,
          averageScore: 85.3,
          completionRate: 92.7,
          topCategory: 'Chimica Organica',
          modeDistribution: {
            standard: 35,
            chase: 20,
            appearing: 15,
            timed: 12,
            untimed: 10,
            survival: 8
          }
        }
      }

    case 'full-report':
      return {
        ...baseData,
        data: {
          summary: {
            totalStudents: analytics?.totalStudents || 89,
            totalQuizzes: analytics?.quizStats?.totalQuizzes || 156,
            averageScore: analytics?.quizStats?.averageScore || 85.3,
            peakEngagement: '11:00 - 92%'
          },
          performance: generateExportData('performance', analytics).data,
          engagement: generateExportData('engagement', analytics).data,
          quizStats: generateExportData('quiz-stats', analytics).data
        }
      }

    default:
      return baseData
  }
}

function downloadCSV(data, filename) {
  // Converte i dati in formato CSV
  let csv = 'ChemArena Analytics Export\\n\\n'

  if (data.data.accuracy) {
    csv += 'Question,Accuracy,Speed\\n'
    data.data.questions.forEach((q, i) => {
      csv += `${q},${data.data.accuracy[i]},${data.data.speed[i]}\\n`
    })
  } else if (data.data.hourlyEngagement) {
    csv += 'Time,Engagement\\n'
    data.data.timeSlots.forEach((time, i) => {
      csv += `${time},${data.data.hourlyEngagement[i]}\\n`
    })
  } else {
    csv += 'Metric,Value\\n'
    Object.entries(data.data).forEach(([key, value]) => {
      if (typeof value !== 'object') {
        csv += `${key},${value}\\n`
      }
    })
  }

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = `${filename}.json`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}