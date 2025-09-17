import { useState, useEffect } from 'react';
import clsx from 'clsx';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Errore caricamento analytics:', error);
      // Dati mock per demo
      setAnalytics(generateMockAnalytics());
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingDisplay />;
  }

  return (
    <div className="space-y-8">
      {/* Header cyberpunk */}
      <div className="relative">
        <div className="bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-pink-900/40 rounded-2xl p-6 border border-cyan-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                🔬 ANALYTICS STATION
              </h2>
              <p className="text-cyan-300/80 mt-2 font-mono">
                Sistema avanzato di monitoraggio prestazioni ChemArena
              </p>
            </div>

            {/* Indicatori vitali */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-pulse">
                  <span className="text-white font-bold">●</span>
                </div>
                <span className="text-xs text-green-400 mt-1 block">ONLINE</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-mono text-xs">{analytics?.totalGames || 0}</span>
                </div>
                <span className="text-xs text-blue-400 mt-1 block">GAMES</span>
              </div>
            </div>
          </div>

          {/* Linee luminose decorative */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/60 to-transparent"></div>
        </div>
      </div>

      {/* Menu navigazione */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: '📊 Overview', icon: '🔬' },
          { id: 'performance', label: '⚡ Performance', icon: '⚡' },
          { id: 'engagement', label: '🎯 Engagement', icon: '🎯' },
          { id: 'quiz-stats', label: '📝 Quiz Stats', icon: '📝' },
          { id: 'realtime', label: '🔴 Real-time', icon: '🔴' }
        ].map((metric) => (
          <button
            key={metric.id}
            onClick={() => setActiveMetric(metric.id)}
            className={clsx(
              'px-6 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap',
              'border-2 backdrop-blur-sm',
              activeMetric === metric.id
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                : 'border-purple-500/30 bg-purple-900/20 text-purple-300 hover:border-purple-400 hover:bg-purple-500/20'
            )}
          >
            <span className="mr-2">{metric.icon}</span>
            {metric.label}
          </button>
        ))}
      </div>

      {/* Contenuto dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {activeMetric === 'overview' && <OverviewMetrics analytics={analytics} />}
        {activeMetric === 'performance' && <PerformanceMetrics analytics={analytics} />}
        {activeMetric === 'engagement' && <EngagementMetrics analytics={analytics} />}
        {activeMetric === 'quiz-stats' && <QuizStatsMetrics analytics={analytics} />}
        {activeMetric === 'realtime' && <RealtimeMetrics analytics={analytics} />}
      </div>
    </div>
  );
}

// Componente Overview
function OverviewMetrics({ analytics }) {
  const metrics = [
    { label: 'Partite Totali', value: analytics?.totalGames || 0, change: '+12%', color: 'cyan' },
    { label: 'Studenti Attivi', value: analytics?.activeUsers || 0, change: '+8%', color: 'purple' },
    { label: 'Quiz Completati', value: analytics?.completedQuizzes || 0, change: '+15%', color: 'green' },
    { label: 'Tempo Medio', value: `${analytics?.avgGameTime || 0}min`, change: '-3%', color: 'yellow' },
    { label: 'Accuratezza Media', value: `${analytics?.avgAccuracy || 0}%`, change: '+5%', color: 'pink' },
    { label: 'Engagement Score', value: analytics?.engagementScore || 0, change: '+9%', color: 'indigo' }
  ];

  return (
    <>
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} />
      ))}
    </>
  );
}

// Componente Performance
function PerformanceMetrics({ analytics }) {
  return (
    <>
      <div className="xl:col-span-2">
        <CyberpunkChart
          title="⚡ Performance nel Tempo"
          data={analytics?.performanceData || []}
          type="line"
        />
      </div>
      <div>
        <TopPerformers analytics={analytics} />
      </div>
    </>
  );
}

// Altri componenti verranno implementati
function EngagementMetrics({ analytics }) {
  return <div className="xl:col-span-3 text-center text-purple-400">🎯 Engagement Metrics - In sviluppo</div>;
}

function QuizStatsMetrics({ analytics }) {
  return <div className="xl:col-span-3 text-center text-cyan-400">📝 Quiz Statistics - In sviluppo</div>;
}

function RealtimeMetrics({ analytics }) {
  return <div className="xl:col-span-3 text-center text-green-400">🔴 Real-time Monitoring - In sviluppo</div>;
}

// Componente Metric Card
function MetricCard({ metric }) {
  const colorMap = {
    cyan: 'from-cyan-500 to-blue-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600',
    yellow: 'from-yellow-500 to-orange-600',
    pink: 'from-pink-500 to-rose-600',
    indigo: 'from-indigo-500 to-purple-600'
  };

  return (
    <div className="relative group">
      <div className={clsx(
        'bg-gradient-to-br p-6 rounded-2xl border-2 transition-all duration-300',
        'from-black/60 to-gray-900/60 border-gray-700/50',
        'hover:border-cyan-400/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
        'backdrop-blur-sm'
      )}>
        {/* Header con valore */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm font-mono">{metric.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{metric.value}</p>
          </div>

          {/* Indicatore cambio */}
          <div className={clsx(
            'px-2 py-1 rounded-lg text-xs font-bold',
            metric.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {metric.change}
          </div>
        </div>

        {/* Barra di progresso */}
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={clsx('h-full bg-gradient-to-r transition-all duration-1000', colorMap[metric.color])}
            style={{ width: `${Math.min(100, (metric.value / 100) * 100)}%` }}
          />
        </div>

        {/* Particelle decorative */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping opacity-60"></div>
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white rounded-full animate-ping opacity-40"
             style={{animationDelay: '0.5s'}}></div>

        {/* Bordo luminoso al hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/10 to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </div>
  );
}

// Componente Chart cyberpunk
function CyberpunkChart({ title, data, type }) {
  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/60 rounded-2xl border-2 border-gray-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
        {title}
      </h3>

      {/* Placeholder per grafico */}
      <div className="h-64 flex items-center justify-center bg-gradient-to-br from-cyan-900/20 to-purple-900/20 rounded-xl">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-cyan-400 font-mono">Grafico in caricamento...</p>
        </div>
      </div>
    </div>
  );
}

// Componente Top Performers
function TopPerformers({ analytics }) {
  const performers = analytics?.topPerformers || [
    { name: 'Dr. Cyra Nova', score: 2850, accuracy: 94 },
    { name: 'Prof. Zex Prime', score: 2720, accuracy: 91 },
    { name: 'Luna Hex', score: 2680, accuracy: 89 }
  ];

  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/60 rounded-2xl border-2 border-gray-700/50 p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-4">
        🏆 Top Performers
      </h3>

      <div className="space-y-3">
        {performers.map((player, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30">
            <div className="text-2xl">
              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white">{player.name}</p>
              <p className="text-sm text-yellow-400">{player.score} pts • {player.accuracy}% accuracy</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading con animazione cyberpunk
function LoadingDisplay() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        {/* Sistema di scansione */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-cyan-400/30 rounded-full"></div>
          <div className="absolute inset-2 border-2 border-purple-400/20 rounded-full animate-spin">
            <div className="absolute top-0 left-1/2 w-1 h-6 bg-cyan-400 -translate-x-1/2 -translate-y-1"></div>
          </div>
          <div className="absolute inset-4 border border-pink-400/10 rounded-full animate-ping"></div>

          {/* Core centrale */}
          <div className="absolute inset-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full animate-pulse"></div>
        </div>

        <p className="text-cyan-400 font-mono text-lg animate-pulse">
          INIZIALIZZANDO ANALYTICS SYSTEM...
        </p>

        <div className="mt-4 flex justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    </div>
  );
}

// Genera dati mock per demo
function generateMockAnalytics() {
  return {
    totalGames: 147,
    activeUsers: 89,
    completedQuizzes: 134,
    avgGameTime: 8.5,
    avgAccuracy: 76,
    engagementScore: 8.7,
    performanceData: [],
    topPerformers: [
      { name: 'Dr. Cyra Nova', score: 2850, accuracy: 94 },
      { name: 'Prof. Zex Prime', score: 2720, accuracy: 91 },
      { name: 'Luna Hex', score: 2680, accuracy: 89 }
    ]
  };
}