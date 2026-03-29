import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'
import { getStudyLogs } from '../../services/studyService'

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const DAYS_TR = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz']

function getIntensityClass(count, max) {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
  const ratio = count / Math.max(max, 1)
  if (ratio <= 0.25) return 'bg-emerald-200 dark:bg-emerald-900'
  if (ratio <= 0.5) return 'bg-emerald-400 dark:bg-emerald-700'
  if (ratio <= 0.75) return 'bg-emerald-500 dark:bg-emerald-500'
  return 'bg-emerald-600 dark:bg-emerald-400'
}

export default function StudyHeatmap({ userId }) {
  const [dayData, setDayData] = useState({})
  const [loading, setLoading] = useState(true)

  const weeks = useMemo(() => {
    const result = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Go back 15 weeks (about 3.5 months)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - (15 * 7) + (7 - today.getDay()))

    // Adjust to Monday
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + mondayOffset)

    let current = new Date(startDate)
    let week = []

    while (current <= today) {
      week.push(new Date(current))
      if (week.length === 7) {
        result.push(week)
        week = []
      }
      current.setDate(current.getDate() + 1)
    }
    if (week.length > 0) {
      result.push(week)
    }

    return result
  }, [])

  useEffect(() => {
    if (!userId) return
    loadHeatmapData()
  }, [userId])

  async function loadHeatmapData() {
    try {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 120)
      start.setHours(0, 0, 0, 0)

      const logs = await getStudyLogs(userId, {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      })

      const map = {}
      logs.forEach(log => {
        const d = log.date?.toDate ? log.date.toDate() : new Date(log.date)
        const key = d.toISOString().split('T')[0]
        map[key] = (map[key] || 0) + (log.questionCount || 0)
      })
      setDayData(map)
    } catch (err) {
      console.error('Heatmap veri hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  const maxCount = Math.max(...Object.values(dayData), 1)

  // Get month labels
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    weeks.forEach((week, i) => {
      const firstDay = week[0]
      if (firstDay && firstDay.getMonth() !== lastMonth) {
        lastMonth = firstDay.getMonth()
        labels.push({ index: i, label: MONTHS_TR[lastMonth] })
      }
    })
    return labels
  }, [weeks])

  if (loading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="w-5 h-5 text-emerald-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Çalışma Yoğunluğu</h3>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        {/* Month labels */}
        <div className="flex ml-8 mb-1">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-[10px] text-gray-400 dark:text-gray-500"
              style={{ position: 'relative', left: `${m.index * 14}px` }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1 shrink-0">
            {DAYS_TR.map((day, i) => (
              <div key={i} className="h-[12px] w-6 text-[9px] text-gray-400 dark:text-gray-500 flex items-center">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => {
                const key = day.toISOString().split('T')[0]
                const count = dayData[key] || 0
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const isFuture = day > today

                return (
                  <motion.div
                    key={di}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (wi * 7 + di) * 0.003 }}
                    title={`${day.toLocaleDateString('tr-TR')}: ${count} soru`}
                    className={`w-[12px] h-[12px] rounded-sm cursor-default transition-colors ${
                      isFuture
                        ? 'bg-transparent'
                        : getIntensityClass(count, maxCount)
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 mr-1">Az</span>
        <div className="w-[10px] h-[10px] rounded-sm bg-gray-100 dark:bg-gray-800" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-200 dark:bg-emerald-900" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-400 dark:bg-emerald-700" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-500 dark:bg-emerald-500" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-600 dark:bg-emerald-400" />
        <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">Çok</span>
      </div>
    </div>
  )
}
