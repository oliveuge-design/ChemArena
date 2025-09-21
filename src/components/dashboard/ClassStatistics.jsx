import { useState } from 'react'

export default function ClassStatistics({ classData }) {
  const [activeTab, setActiveTab] = useState('overview')

  const renderProgressBar = (label, value, max, color = 'blue') => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-500">{value}/{max}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
          style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }}
        ></div>
      </div>
    </div>
  )

  const renderScoreChart = (students) => {
    const scoreRanges = [
      { range: '90-100%', min: 90, max: 100, color: 'green' },
      { range: '70-89%', min: 70, max: 89, color: 'blue' },
      { range: '50-69%', min: 50, max: 69, color: 'yellow' },
      { range: '0-49%', min: 0, max: 49, color: 'red' }
    ]

    const scoreCounts = scoreRanges.map(range => ({
      ...range,
      count: students.filter(s => {
        const avg = s.averageScore || 0
        return avg >= range.min && avg <= range.max
      }).length
    }))

    const maxCount = Math.max(...scoreCounts.map(sc => sc.count), 1)

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">📊 Distribuzione Punteggi</h4>
        {scoreCounts.map((range, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-16 text-sm text-gray-600">{range.range}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div
                className={`bg-${range.color}-500 h-4 rounded-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500`}
                style={{ width: `${(range.count / maxCount) * 100}%` }}
              >
                {range.count > 0 && range.count}
              </div>
            </div>
            <div className="w-8 text-sm text-gray-500">{range.count}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderActivityChart = (students) => {
    const activityRanges = [
      { range: '10+ partite', min: 10, color: 'purple' },
      { range: '5-9 partite', min: 5, max: 9, color: 'blue' },
      { range: '1-4 partite', min: 1, max: 4, color: 'green' },
      { range: '0 partite', min: 0, max: 0, color: 'gray' }
    ]

    const activityCounts = activityRanges.map(range => ({
      ...range,
      count: students.filter(s => {
        const games = s.totalGames || 0
        if (range.max !== undefined) {
          return games >= range.min && games <= range.max
        } else {
          return games >= range.min
        }
      }).length
    }))

    const maxCount = Math.max(...activityCounts.map(ac => ac.count), 1)

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">🎮 Attività Studenti</h4>
        {activityCounts.map((range, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600">{range.range}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
              <div
                className={`bg-${range.color}-500 h-4 rounded-full flex items-center justify-center text-xs text-white font-bold transition-all duration-500`}
                style={{ width: `${(range.count / maxCount) * 100}%` }}
              >
                {range.count > 0 && range.count}
              </div>
            </div>
            <div className="w-8 text-sm text-gray-500">{range.count}</div>
          </div>
        ))}
      </div>
    )
  }

  const renderTopPerformers = (students) => {
    const sortedStudents = [...students]
      .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      .slice(0, 5)

    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">🏆 Top 5 Studenti</h4>
        {sortedStudents.map((student, index) => (
          <div key={student.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
              index === 0 ? 'bg-yellow-500' :
              index === 1 ? 'bg-gray-400' :
              index === 2 ? 'bg-orange-600' : 'bg-blue-500'
            }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{student.nickname}</div>
              <div className="text-sm text-gray-600">{student.fullName}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800">{student.averageScore || 0}%</div>
              <div className="text-sm text-gray-500">{student.totalGames || 0} partite</div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: '📊 Panoramica', icon: '📊' },
    { id: 'performance', label: '🎯 Performance', icon: '🎯' },
    { id: 'activity', label: '📈 Attività', icon: '📈' },
    { id: 'top', label: '🏆 Top Studenti', icon: '🏆' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          📈 Statistiche: {classData.name}
        </h3>
        <div className="text-sm text-gray-500">
          {classData.studentsCount} studenti • {classData.teachersCount} insegnanti
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">📊 Metriche Generali</h4>
              {renderProgressBar('Studenti Attivi', classData.studentsCount, classData.studentsCount || 1, 'blue')}
              {renderProgressBar('Partite Totali', classData.totalGames, Math.max(classData.totalGames, 50), 'green')}
              {renderProgressBar('Punti Totali', classData.totalPoints, Math.max(classData.totalPoints, 1000), 'purple')}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{classData.averageScore}%</div>
                  <div className="text-sm text-gray-600">Media Classe</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700">🎯 Performance Recenti</h4>
              {classData.recentGames && classData.recentGames.length > 0 ? (
                <div className="space-y-2">
                  {classData.recentGames.slice(0, 5).map((game, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{game.quizTitle}</div>
                          <div className="text-sm text-gray-600">{game.subject}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">{game.averageScore}%</div>
                          <div className="text-sm text-gray-500">{game.totalPlayers} giocatori</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  📝 Nessuna partita recente
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderScoreChart(classData.topStudents || [])}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderActivityChart(classData.topStudents || [])}
          </div>
        )}

        {activeTab === 'top' && (
          <div className="max-w-md mx-auto">
            {renderTopPerformers(classData.topStudents || [])}
          </div>
        )}
      </div>
    </div>
  )
}