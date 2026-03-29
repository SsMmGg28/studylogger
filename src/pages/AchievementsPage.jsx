import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Trophy,
  Flame,
  Target,
  BookOpen,
  Zap,
  Star,
  Crown,
  Medal,
  Clock,
  Calendar,
  TrendingUp,
  Award,
  Lock
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getStudyLogs } from '../services/studyService'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'

const BADGES = [
  // Soru bazlı
  { id: 'q10', icon: BookOpen, label: 'İlk Adım', desc: '10 soru çöz', color: 'from-blue-400 to-blue-600', check: s => s.totalQuestions >= 10 },
  { id: 'q100', icon: BookOpen, label: 'Azimli', desc: '100 soru çöz', color: 'from-blue-500 to-blue-700', check: s => s.totalQuestions >= 100 },
  { id: 'q500', icon: Zap, label: 'Hızlı Çözücü', desc: '500 soru çöz', color: 'from-indigo-500 to-indigo-700', check: s => s.totalQuestions >= 500 },
  { id: 'q1000', icon: Star, label: 'Bin Soru', desc: '1.000 soru çöz', color: 'from-violet-500 to-violet-700', check: s => s.totalQuestions >= 1000 },
  { id: 'q5000', icon: Crown, label: 'Soru Kralı', desc: '5.000 soru çöz', color: 'from-amber-500 to-amber-700', check: s => s.totalQuestions >= 5000 },
  { id: 'q10000', icon: Trophy, label: 'Efsane', desc: '10.000 soru çöz', color: 'from-yellow-400 to-yellow-600', check: s => s.totalQuestions >= 10000 },

  // Streak bazlı
  { id: 's3', icon: Flame, label: '3 Gün Serisi', desc: '3 gün üst üste çalış', color: 'from-orange-400 to-orange-600', check: s => s.streak >= 3 },
  { id: 's7', icon: Flame, label: 'Haftalık Seri', desc: '7 gün üst üste çalış', color: 'from-orange-500 to-red-600', check: s => s.streak >= 7 },
  { id: 's14', icon: Flame, label: '2 Haftalık Seri', desc: '14 gün üst üste çalış', color: 'from-red-500 to-red-700', check: s => s.streak >= 14 },
  { id: 's30', icon: Flame, label: 'Aylık Seri', desc: '30 gün üst üste çalış', color: 'from-red-600 to-pink-700', check: s => s.streak >= 30 },

  // Hedef bazlı
  { id: 'g1', icon: Target, label: 'Hedefçi', desc: 'Günlük hedefe 1 kez ulaş', color: 'from-green-400 to-green-600', check: s => s.goalDays >= 1 },
  { id: 'g7', icon: Target, label: 'Hafta Kaplanı', desc: '7 gün hedefe ulaş', color: 'from-green-500 to-emerald-700', check: s => s.goalDays >= 7 },
  { id: 'g30', icon: Medal, label: 'Disiplinli', desc: '30 gün hedefe ulaş', color: 'from-emerald-500 to-teal-700', check: s => s.goalDays >= 30 },

  // Ders çeşitliliği
  { id: 'l3', icon: TrendingUp, label: 'Çok Yönlü', desc: '3 farklı dersten soru çöz', color: 'from-cyan-400 to-cyan-600', check: s => s.uniqueLessons >= 3 },
  { id: 'l6', icon: TrendingUp, label: 'Polimata', desc: '6 farklı dersten soru çöz', color: 'from-teal-500 to-cyan-700', check: s => s.uniqueLessons >= 6 },
  { id: 'l10', icon: Award, label: 'Her Dersten', desc: '10 farklı dersten soru çöz', color: 'from-purple-500 to-purple-700', check: s => s.uniqueLessons >= 10 },

  // Gün bazlı
  { id: 'd50', icon: Calendar, label: '50 Gün', desc: '50 farklı gün çalış', color: 'from-pink-400 to-pink-600', check: s => s.activeDays >= 50 },
  { id: 'd100', icon: Calendar, label: '100 Gün', desc: '100 farklı gün çalış', color: 'from-rose-500 to-rose-700', check: s => s.activeDays >= 100 },

  // Tek seferde
  { id: 'day100', icon: Clock, label: 'Maraton', desc: 'Bir günde 100+ soru çöz', color: 'from-fuchsia-400 to-fuchsia-600', check: s => s.bestDay >= 100 },
  { id: 'day200', icon: Crown, label: 'Süper Maraton', desc: 'Bir günde 200+ soru çöz', color: 'from-fuchsia-500 to-purple-700', check: s => s.bestDay >= 200 },
]

export default function AchievementsPage() {
  const { user, userProfile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) loadStats()
  }, [user])

  async function loadStats() {
    try {
      const start = new Date('2020-01-01')
      const end = new Date()
      const logs = await getStudyLogs(user.uid, {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })

      const totalQuestions = logs.reduce((s, l) => s + (l.questionCount || 0), 0)

      // Unique lessons
      const lessonSet = new Set(logs.map(l => l.lesson).filter(Boolean))
      const uniqueLessons = lessonSet.size

      // Daily aggregation
      const dayMap = {}
      logs.forEach(l => {
        const d = l.date?.toDate ? l.date.toDate() : new Date(l.date)
        const key = d.toISOString().split('T')[0]
        dayMap[key] = (dayMap[key] || 0) + (l.questionCount || 0)
      })

      const activeDays = Object.keys(dayMap).length
      const bestDay = Math.max(0, ...Object.values(dayMap))
      const dailyGoal = userProfile?.dailyGoal || 100
      const goalDays = Object.values(dayMap).filter(q => q >= dailyGoal).length

      // Streak calculation
      let streak = 0
      for (let i = 0; i <= 365; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().split('T')[0]
        if (dayMap[key]) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      setStats({ totalQuestions, uniqueLessons, activeDays, bestDay, goalDays, streak })
    } catch (err) {
      console.error('Achievements data error:', err)
      setStats({ totalQuestions: 0, uniqueLessons: 0, activeDays: 0, bestDay: 0, goalDays: 0, streak: 0 })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner text="Başarılar yükleniyor..." />

  const earned = BADGES.filter(b => b.check(stats))
  const locked = BADGES.filter(b => !b.check(stats))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" />
          Başarı Rozetleri
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Çalıştıkça yeni rozetler kazan!
        </p>
      </div>

      {/* Summary */}
      <Card className="p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50 dark:border-yellow-800/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {earned.length}<span className="text-lg text-yellow-500/60">/{BADGES.length}</span>
            </p>
            <p className="text-sm text-yellow-700/70 dark:text-yellow-400/70 font-medium">Rozet Kazanıldı</p>
          </div>
          <div className="flex -space-x-2">
            {earned.slice(-5).map(b => (
              <div key={b.id} className={`w-10 h-10 rounded-full bg-gradient-to-br ${b.color} flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-md`}>
                <b.icon className="w-5 h-5 text-white" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalQuestions.toLocaleString('tr-TR')}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Toplam Soru</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.streak}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Gün Serisi</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeDays}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Aktif Gün</p>
        </Card>
      </div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" /> Kazanılan Rozetler
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earned.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="p-4 text-center hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg mb-3`}>
                    <badge.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">{badge.label}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{badge.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" /> Kilitli Rozetler
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {locked.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="p-4 text-center opacity-50">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">{badge.label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{badge.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Export for dashboard mini-widget
export { BADGES }
