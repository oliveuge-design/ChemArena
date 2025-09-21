/**
 * ChemArena - Advanced Chart Components
 *
 * Sistema di chart real-time per analytics avanzati con:
 * - Chart.js integration con theme cyberpunk
 * - Real-time data updates
 * - Performance metrics visualizations
 * - Learning analytics charts
 * - Heat maps per engagement studenti
 */

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
  RadialLinearScale
} from 'chart.js'
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2'

// Registra i componenti Chart.js necessari
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Theme cyberpunk per tutti i charts
const cyberpunkTheme = {
  colors: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    success: '#00ff88',
    warning: '#ff8800',
    error: '#ff4444',
    background: 'rgba(0, 0, 0, 0.8)',
    gridLines: 'rgba(0, 255, 255, 0.1)',
    text: '#ffffff'
  },
  gradients: {
    primary: ['#00ffff', '#0088ff'],
    secondary: ['#ff00ff', '#ff0088'],
    performance: ['#00ff88', '#88ff00'],
    difficulty: ['#ffff00', '#ff8800']
  }
}

// Configurazione base per tutti i chart
const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: cyberpunkTheme.colors.text,
        usePointStyle: true,
        font: {
          family: 'monospace',
          size: 12
        }
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: cyberpunkTheme.colors.primary,
      bodyColor: cyberpunkTheme.colors.text,
      borderColor: cyberpunkTheme.colors.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      font: {
        family: 'monospace'
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: cyberpunkTheme.colors.gridLines,
        lineWidth: 1
      },
      ticks: {
        color: cyberpunkTheme.colors.text,
        font: {
          family: 'monospace',
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: cyberpunkTheme.colors.gridLines,
        lineWidth: 1
      },
      ticks: {
        color: cyberpunkTheme.colors.text,
        font: {
          family: 'monospace',
          size: 11
        }
      }
    }
  }
}

/**
 * Chart performance real-time per sessioni di gioco
 */
export function RealTimePerformanceChart({ data, title = "Performance Real-Time" }) {
  const chartOptions = {
    ...baseChartOptions,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        fill: true
      },
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 2
      }
    }
  }

  const chartData = {
    labels: data?.labels || ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
    datasets: [
      {
        label: 'Accuracy %',
        data: data?.accuracy || [85, 92, 78, 88, 95],
        borderColor: cyberpunkTheme.colors.primary,
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        pointBackgroundColor: cyberpunkTheme.colors.primary,
        pointBorderColor: '#ffffff',
        fill: true
      },
      {
        label: 'Speed Score',
        data: data?.speed || [720, 850, 640, 780, 920],
        borderColor: cyberpunkTheme.colors.secondary,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        pointBackgroundColor: cyberpunkTheme.colors.secondary,
        pointBorderColor: '#ffffff',
        fill: true
      }
    ]
  }

  return (
    <ChartContainer title={title} icon="📈">
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
    </ChartContainer>
  )
}

/**
 * Chart distribuzione modalità quiz
 */
export function QuizModeDistributionChart({ data, title = "Distribuzione Modalità Quiz" }) {
  const chartData = {
    labels: ['Standard', 'Inseguimento', 'Comparsa', 'A Tempo', 'Senza Tempo', 'Sopravvivenza'],
    datasets: [
      {
        data: data?.distribution || [35, 20, 15, 12, 10, 8],
        backgroundColor: [
          'rgba(0, 255, 255, 0.8)',
          'rgba(255, 100, 100, 0.8)',
          'rgba(255, 255, 0, 0.8)',
          'rgba(0, 255, 136, 0.8)',
          'rgba(255, 0, 255, 0.8)',
          'rgba(255, 136, 0, 0.8)'
        ],
        borderColor: [
          '#00ffff',
          '#ff6464',
          '#ffff00',
          '#00ff88',
          '#ff00ff',
          '#ff8800'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    ]
  }

  const chartOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      legend: {
        ...baseChartOptions.plugins.legend,
        position: 'right'
      }
    }
  }

  return (
    <ChartContainer title={title} icon="🎮">
      <div className="h-80">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
    </ChartContainer>
  )
}

/**
 * Chart engagement studenti con heat map
 */
export function StudentEngagementHeatMap({ data, title = "Engagement Studenti" }) {
  const chartData = {
    labels: data?.timeSlots || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    datasets: [
      {
        label: 'Partecipazione Media',
        data: data?.engagement || [78, 85, 92, 88, 75, 82, 90],
        backgroundColor: (context) => {
          const value = context.parsed.y
          if (value >= 90) return 'rgba(0, 255, 136, 0.8)'
          if (value >= 80) return 'rgba(255, 255, 0, 0.8)'
          if (value >= 70) return 'rgba(255, 136, 0, 0.8)'
          return 'rgba(255, 100, 100, 0.8)'
        },
        borderColor: cyberpunkTheme.colors.primary,
        borderWidth: 1
      }
    ]
  }

  return (
    <ChartContainer title={title} icon="🔥">
      <div className="h-80">
        <Bar data={chartData} options={baseChartOptions} />
      </div>
    </ChartContainer>
  )
}

/**
 * Radar chart per learning analytics
 */
export function LearningAnalyticsRadar({ data, title = "Learning Analytics" }) {
  const chartData = {
    labels: ['Comprensione', 'Velocità', 'Precisione', 'Costanza', 'Miglioramento', 'Engagement'],
    datasets: [
      {
        label: 'Performance Media',
        data: data?.metrics || [85, 78, 92, 88, 75, 90],
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        borderColor: cyberpunkTheme.colors.primary,
        borderWidth: 2,
        pointBackgroundColor: cyberpunkTheme.colors.primary,
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: cyberpunkTheme.colors.primary
      },
      {
        label: 'Target Obiettivo',
        data: [90, 85, 95, 90, 85, 95],
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        borderColor: cyberpunkTheme.colors.secondary,
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: cyberpunkTheme.colors.secondary,
        pointBorderColor: '#ffffff'
      }
    ]
  }

  const radarOptions = {
    ...baseChartOptions,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: cyberpunkTheme.colors.gridLines
        },
        angleLines: {
          color: cyberpunkTheme.colors.gridLines
        },
        pointLabels: {
          color: cyberpunkTheme.colors.text,
          font: {
            family: 'monospace',
            size: 12
          }
        },
        ticks: {
          color: cyberpunkTheme.colors.text,
          font: {
            family: 'monospace',
            size: 10
          }
        }
      }
    }
  }

  return (
    <ChartContainer title={title} icon="📊">
      <div className="h-80">
        <Radar data={chartData} options={radarOptions} />
      </div>
    </ChartContainer>
  )
}

/**
 * Chart progressione difficoltà
 */
export function DifficultyProgressionChart({ data, title = "Progressione Difficoltà" }) {
  const chartData = {
    labels: data?.sessions || ['Sett 1', 'Sett 2', 'Sett 3', 'Sett 4', 'Sett 5'],
    datasets: [
      {
        label: 'Livello Difficoltà',
        data: data?.difficulty || [3.2, 3.8, 4.1, 4.5, 4.8],
        borderColor: cyberpunkTheme.colors.warning,
        backgroundColor: 'rgba(255, 136, 0, 0.1)',
        pointBackgroundColor: cyberpunkTheme.colors.warning,
        pointBorderColor: '#ffffff',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      },
      {
        label: 'Performance Media',
        data: data?.performance || [75, 78, 82, 85, 88],
        borderColor: cyberpunkTheme.colors.success,
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        pointBackgroundColor: cyberpunkTheme.colors.success,
        pointBorderColor: '#ffffff',
        fill: true,
        tension: 0.4,
        borderWidth: 3
      }
    ]
  }

  return (
    <ChartContainer title={title} icon="📈">
      <div className="h-80">
        <Line data={chartData} options={baseChartOptions} />
      </div>
    </ChartContainer>
  )
}

/**
 * Container wrapper per tutti i chart con styling cyberpunk
 */
function ChartContainer({ title, icon, children }) {
  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/60 rounded-2xl border-2 border-gray-700/50 p-6 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 font-mono">
        {icon} {title}
      </h3>
      {children}
    </div>
  )
}

export default {
  RealTimePerformanceChart,
  QuizModeDistributionChart,
  StudentEngagementHeatMap,
  LearningAnalyticsRadar,
  DifficultyProgressionChart
}