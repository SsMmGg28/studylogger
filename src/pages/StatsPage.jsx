import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid
} from 'recharts'
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  Target,
  Clock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getStudyLogs } from '../services/studyService'
import { getTimerSessions } from '../services/timerService'
import { formatDateShort, formatDurationText, calculateNet } from '../utils/formatters'
import { exportToExcel, exportToCSV } from '../utils/exportUtils'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6']

const PERIODS = [
  { key: 'week', label: 'Bu Hafta', days: 7 },
  { key: 'month', label: 'Bu Ay', days: 30 },
  { key: '3months', label: '3 Ay', days: 90 },
  { key: 'all', label: 'Tümü', days: 365 }
]

export default function StatsPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [logs, setLogs] = useState([])
  const [timerData, setTimerData] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    if (user) loadData()
  }, [user, period])

  async function loadData() {
    setLoading(true)
    try {
      const selected = PERIODS.find(p => p.key === period)
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - selected.days)
      start.setHours(0, 0, 0, 0)

      const [studyLogs, sessions] = await Promise.all([
        getStudyLogs(user.uid, {
          startDate: start.toISOString(),
          endDate: end.toISOString()
        }),
        getTimerSessions(user.uid, 100)
      ])
      setLogs(studyLogs)
      setTimerData(sessions)
    } catch {
      addToast('İstatistik verisi yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  // === Computed Stats ===
  const stats = useMemo(() => {
    const totalQuestions = logs.reduce((s, l) => s + (l.questionCount || 0), 0)
    const totalCorrect = logs.reduce((s, l) => s + (l.correctCount || 0), 0)
    const totalWrong = logs.reduce((s, l) => s + (l.wrongCount || 0), 0)
    const totalDuration = logs.reduce((s, l) => s + (l.duration || 0), 0)
    const timerDuration = timerData.reduce((s, t) => s + (t.duration || 0), 0)
    const uniqueDays = new Set(logs.map(l => {
      const d = l.date?.toDate ? l.date.toDate() : new Date(l.date)
      return d.toISOString().split('T')[0]
    })).size

    return { totalQuestions, totalCorrect, totalWrong, totalDuration, timerDuration, uniqueDays }
  }, [logs, timerData])

  // === Bar Chart: Daily Questions ===
  const barData = useMemo(() => {
    const selected = PERIODS.find(p => p.key === period)
    const days = Math.min(selected.days, 30) // Max 30 bars
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)

      const dayLogs = logs.filter(l => {
        const ld = l.date?.toDate ? l.date.toDate() : new Date(l.date)
        return ld >= d && ld < next
      })

      result.push({
        date: formatDateShort(d),
        soru: dayLogs.reduce((s, l) => s + (l.questionCount || 0), 0),
        dogru: dayLogs.reduce((s, l) => s + (l.correctCount || 0), 0),
        yanlis: dayLogs.reduce((s, l) => s + (l.wrongCount || 0), 0)
      })
    }
    return result
  }, [logs, period])

  // === Pie Chart: Lesson Distribution ===
  const pieData = useMemo(() => {
    const map = {}
    logs.forEach(l => {
      const key = l.lesson || 'Diğer'
      map[key] = (map[key] || 0) + (l.questionCount || 0)
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [logs])

  // === Line Chart: Daily Trend ===
  const lineData = useMemo(() => {
    const selected = PERIODS.find(p => p.key === period)
    const days = Math.min(selected.days, 30)
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)

      const dayLogs = logs.filter(l => {
        const ld = l.date?.toDate ? l.date.toDate() : new Date(l.date)
        return ld >= d && ld < next
      })

      const correct = dayLogs.reduce((s, l) => s + (l.correctCount || 0), 0)
      const wrong = dayLogs.reduce((s, l) => s + (l.wrongCount || 0), 0)

      result.push({
        date: formatDateShort(d),
        net: calculateNet(correct, wrong),
        dogruOrani: correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
      })
    }
    return result
  }, [logs, period])

  // === Topic Table ===
  const topicData = useMemo(() => {
    const map = {}
    logs.forEach(l => {
      const key = `${l.examType}-${l.lesson}-${l.topic}`
      if (!map[key]) {
        map[key] = {
          examType: l.examType,
          lesson: l.lesson,
          topic: l.topic,
          questions: 0,
          correct: 0,
          wrong: 0,
          empty: 0,
          count: 0
        }
      }
      map[key].questions += l.questionCount || 0
      map[key].correct += l.correctCount || 0
      map[key].wrong += l.wrongCount || 0
      map[key].empty += l.emptyCount || 0
      map[key].count++
    })
    return Object.values(map).sort((a, b) => b.questions - a.questions)
  }, [logs])

  if (loading) return <LoadingSpinner text="İstatistikler yükleniyor..." />

  const tooltipStyle = {
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontSize: 13
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">İstatistikler</h1>
        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  period === p.key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Export */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              icon={FileSpreadsheet}
              onClick={() => { exportToExcel(logs); addToast('Excel dosyası indirildi', 'success') }}
              title="Excel olarak indir"
            >
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={() => { exportToCSV(logs); addToast('CSV dosyası indirildi', 'success') }}
              title="CSV olarak indir"
            >
              <span className="hidden sm:inline">CSV</span>
            </Button>
          </div>
        </div>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Henüz istatistik yok"
          description="Çalışma kayıtları eklediğinizde burada istatistikler görünecek."
        />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-primary-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Toplam Soru</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Toplam Net</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {calculateNet(stats.totalCorrect, stats.totalWrong)}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Çalışılan Gün</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.uniqueDays}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-500" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Çalışma Süresi</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatDurationText(stats.totalDuration + stats.timerDuration)}
              </p>
            </Card>
          </div>

          {/* Bar Chart */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Günlük Soru Sayısı</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="dogru" fill="#22c55e" name="Doğru" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="yanlis" fill="#ef4444" name="Yanlış" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieIcon className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Ders Dağılımı</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: '#9ca3af' }}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Line Chart */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Net Trendi</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="net" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="Net" />
                    <Line type="monotone" dataKey="dogruOrani" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" name="Doğru Oranı (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Topic Detail Table */}
          <Card className="p-5 overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Konu Bazlı Detay</h3>
            </div>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Ders / Konu</th>
                    <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Soru</th>
                    <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Doğru</th>
                    <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Yanlış</th>
                    <th className="text-center py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Net</th>
                    <th className="text-center py-2 pl-2 text-gray-500 dark:text-gray-400 font-medium">Başarı</th>
                  </tr>
                </thead>
                <tbody>
                  {topicData.slice(0, 20).map((row, i) => {
                    const successRate = row.questions > 0 ? Math.round((row.correct / row.questions) * 100) : 0
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-2.5 pr-4">
                          <span className="text-xs text-primary-500 font-medium">{row.examType}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{row.lesson}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{row.topic}</p>
                        </td>
                        <td className="text-center py-2.5 px-2 font-medium">{row.questions}</td>
                        <td className="text-center py-2.5 px-2 text-green-600">{row.correct}</td>
                        <td className="text-center py-2.5 px-2 text-red-500">{row.wrong}</td>
                        <td className="text-center py-2.5 px-2 font-semibold text-primary-600 dark:text-primary-400">
                          {calculateNet(row.correct, row.wrong)}
                        </td>
                        <td className="text-center py-2.5 pl-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            successRate >= 70
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                              : successRate >= 40
                              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                              : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          }`}>
                            %{successRate}
                          </span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </motion.div>
  )
}
