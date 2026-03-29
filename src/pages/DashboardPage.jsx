import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusCircle,
  Clock,
  Target,
  TrendingUp,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Flame,
  Zap,
  CalendarDays,
  Trophy,
  Star,
  Quote
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../contexts/AuthContext'
import { getStudyLogs } from '../services/studyService'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import StudyHeatmap from '../components/common/StudyHeatmap'
import { getDailyQuote } from '../data/quotes'
import { formatDateShort, formatDurationText, calculateNet } from '../utils/formatters'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function DashboardPage() {
  const { user, userProfile } = useAuth()
  const navigate = useNavigate()
  const [todayLogs, setTodayLogs] = useState([])
  const [weekData, setWeekData] = useState([])
  const [streak, setStreak] = useState(0)
  const [totalAllTime, setTotalAllTime] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    try {
      // Son 30 gün verisi (streak + chart için)
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 29)
      start.setHours(0, 0, 0, 0)

      const logs = await getStudyLogs(user.uid, {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })

      // Bugünkü kayıtlar
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayItems = logs.filter(l => {
        const d = l.date?.toDate ? l.date.toDate() : new Date(l.date)
        return d >= today
      })
      setTodayLogs(todayItems)

      // Toplam soru (30 gün)
      setTotalAllTime(logs.reduce((s, l) => s + (l.questionCount || 0), 0))

      // Streak hesapla
      let currentStreak = 0
      for (let i = 0; i <= 29; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const next = new Date(d)
        next.setDate(next.getDate() + 1)

        const hasLogs = logs.some(l => {
          const ld = l.date?.toDate ? l.date.toDate() : new Date(l.date)
          return ld >= d && ld < next
        })

        if (hasLogs) {
          currentStreak++
        } else if (i > 0) {
          break
        } else {
          // Bugün henüz kayıt yoksa, dünden başla
          continue
        }
      }
      setStreak(currentStreak)

      // Haftalık veri (grafik için)
      const days = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const next = new Date(d)
        next.setDate(next.getDate() + 1)

        const dayLogs = logs.filter(l => {
          const ld = l.date?.toDate ? l.date.toDate() : new Date(l.date)
          return ld >= d && ld < next
        })

        days.push({
          date: formatDateShort(d),
          soru: dayLogs.reduce((sum, l) => sum + (l.questionCount || 0), 0),
          dogru: dayLogs.reduce((sum, l) => sum + (l.correctCount || 0), 0)
        })
      }
      setWeekData(days)
    } catch (err) {
      console.error('Dashboard veri yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Veriler yükleniyor..." />

  const todayTotal = todayLogs.reduce((s, l) => s + (l.questionCount || 0), 0)
  const todayCorrect = todayLogs.reduce((s, l) => s + (l.correctCount || 0), 0)
  const todayWrong = todayLogs.reduce((s, l) => s + (l.wrongCount || 0), 0)
  const todayDuration = todayLogs.reduce((s, l) => s + (l.duration || 0), 0)
  const dailyGoal = userProfile?.dailyGoal || 100
  const goalPercent = Math.min((todayTotal / dailyGoal) * 100, 100)
  const goalReached = todayTotal >= dailyGoal
  const dailyQuote = getDailyQuote()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Greeting */}
      <motion.div variants={item}>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Merhaba, {user?.displayName?.split(' ')[0] || 'Öğrenci'} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Daily Motivational Quote */}
      <motion.div variants={item}>
        <Card className="p-4 bg-gradient-to-r from-primary-50 to-violet-50 dark:from-primary-950/30 dark:to-violet-950/30 border-primary-200/50 dark:border-primary-800/30">
          <div className="flex gap-3">
            <Quote className="w-5 h-5 text-primary-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
                "{dailyQuote.text}"
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 mt-1 font-medium">
                — {dailyQuote.author}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        <Button onClick={() => navigate('/add')} icon={PlusCircle} size="md">
          Kayıt Ekle
        </Button>
        <Button onClick={() => navigate('/timer')} variant="secondary" icon={Clock} size="md">
          Kronometre
        </Button>
        <Button onClick={() => navigate('/planner')} variant="secondary" icon={CalendarDays} size="md">
          Haftalık Plan
        </Button>
        <Button onClick={() => navigate('/stats')} variant="secondary" icon={BarChart3} size="md">
          İstatistikler
        </Button>
      </motion.div>

      {/* Streak & Motivation Row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Streak Card */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak}</p>
          <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-medium">Gün Serisi 🔥</p>
        </Card>

        {/* Total Questions (30 days) */}
        <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-violet-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-violet-600 dark:text-violet-400">{totalAllTime}</p>
          <p className="text-xs text-violet-600/70 dark:text-violet-400/70 font-medium">Son 30 Gün Toplam</p>
        </Card>

        {/* Motivation */}
        <Card className="p-4 col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800/50">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {streak >= 7 ? '🏆 Harika gidiyorsun! Serini koru!' :
             streak >= 3 ? '⭐ Güzel ilerleme! Devam et!' :
             streak >= 1 ? '💪 İyi başlangıç! Yarın da çalış!' :
             '📚 Haydi başla! İlk adımı at!'}
          </p>
          <p className="text-xs text-emerald-600/60 dark:text-emerald-400/60 mt-1">
            {streak >= 7 ? `${streak} gündür aralıksız çalışıyorsun` :
             streak >= 1 ? `${streak} günlük seri - devam et!` :
             'Bugün çalışma ekle ve serini başlat'}
          </p>
        </Card>
      </motion.div>

      {/* Daily Goal Progress */}
      <motion.div variants={item}>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Günlük Hedef</h3>
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {todayTotal} / {dailyGoal} soru
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                goalReached
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-primary-500 to-primary-400'
              }`}
            />
          </div>
          {goalReached && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 mt-3 text-green-600 dark:text-green-400"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Tebrikler! Günlük hedefe ulaştınız! 🎉</span>
            </motion.div>
          )}
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4" hover>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayTotal}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Toplam Soru</p>
        </Card>

        <Card className="p-4" hover>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCorrect}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Doğru</p>
        </Card>

        <Card className="p-4" hover>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {calculateNet(todayCorrect, todayWrong)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
        </Card>

        <Card className="p-4" hover>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {todayDuration > 0 ? formatDurationText(todayDuration) : '-'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Çalışma Süresi</p>
        </Card>
      </motion.div>

      {/* Weekly Chart */}
      <motion.div variants={item}>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Son 7 Gün</h3>
          </div>
          {weekData.some(d => d.soru > 0) ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: 13
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="soru"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', r: 4 }}
                    name="Toplam Soru"
                  />
                  <Line
                    type="monotone"
                    dataKey="dogru"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 3 }}
                    strokeDasharray="5 5"
                    name="Doğru"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">Henüz veri yok</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Study Heatmap */}
      <motion.div variants={item}>
        <Card className="p-5">
          <StudyHeatmap userId={user?.uid} />
        </Card>
      </motion.div>

      {/* Today's Logs */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Bugünkü Çalışmalar</h3>
          {todayLogs.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              Tümünü Gör
            </button>
          )}
        </div>
        {todayLogs.length > 0 ? (
          <div className="space-y-2">
            {todayLogs.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-lg">
                      {log.examType === 'TYT' ? '📘' : '📗'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {log.examType} - {log.lesson}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{log.topic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {log.questionCount} soru
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="text-green-500">{log.correctCount}D</span>
                      {' / '}
                      <span className="text-red-500">{log.wrongCount}Y</span>
                      {log.emptyCount > 0 && <span> / {log.emptyCount}B</span>}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Henüz kayıt yok"
            description="Bugün henüz çalışma kaydı eklemediniz."
            action={
              <Button onClick={() => navigate('/add')} icon={PlusCircle} size="sm">
                İlk Kaydını Ekle
              </Button>
            }
          />
        )}
      </motion.div>
    </motion.div>
  )
}
