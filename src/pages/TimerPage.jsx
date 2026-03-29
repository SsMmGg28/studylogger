import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, RotateCcw, BookOpen, Clock, PlusCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useTimer } from '../hooks/useTimer'
import { saveTimerSession, getTimerSessions } from '../services/timerService'
import { getLessonOptions, getTopics } from '../data/yksData'
import { formatDuration, formatDurationText, formatDate } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import EmptyState from '../components/common/EmptyState'

export default function TimerPage() {
  const { user, userProfile } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const { elapsed, isRunning, start, pause, stop, reset } = useTimer()
  const field = userProfile?.field || 'sayisal'

  const [examType, setExamType] = useState('TYT')
  const [lesson, setLesson] = useState('')
  const [topic, setTopic] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const lessonOptions = getLessonOptions(examType, field).map(l => ({ value: l.key, label: `${l.icon} ${l.label}` }))
  const topicOptions = lesson
    ? getTopics(examType, lesson, field).map(t => ({ value: t, label: t }))
    : []

  useEffect(() => {
    if (user) loadHistory()
  }, [user])

  async function loadHistory() {
    try {
      const sessions = await getTimerSessions(user.uid, 10)
      setHistory(sessions)
    } catch {}
  }

  async function handleStop() {
    if (elapsed < 5) {
      reset()
      return
    }
    const result = stop()
    if (!lesson) {
      addToast('Ders seçilmediği için süre kaydedilmedi', 'warning')
      return
    }
    try {
      await saveTimerSession(user.uid, {
        lesson,
        topic,
        duration: result.duration,
        startedAt: result.startedAt
      })
      addToast(`${formatDurationText(result.duration)} çalışma kaydedildi!`, 'success')
      loadHistory()
    } catch {
      addToast('Süre kaydedilemedi', 'error')
    }
  }

  function handleAddStudyFromTimer() {
    if (elapsed > 0) {
      const result = stop()
      navigate(`/add?duration=${result.duration}`)
    } else {
      navigate('/add')
    }
  }

  const hours = Math.floor(elapsed / 3600)
  const minutes = Math.floor((elapsed % 3600) / 60)
  const seconds = elapsed % 60

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Kronometre</h1>

      {/* Lesson selector */}
      <Card className="p-5 mb-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            {['TYT', 'AYT'].map(type => (
              <button
                key={type}
                onClick={() => { setExamType(type); setLesson(''); setTopic('') }}
                disabled={isRunning}
                className={`
                  flex-1 py-2 rounded-lg text-sm font-medium transition-all
                  ${examType === type
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {type}
              </button>
            ))}
          </div>
          <Select
            placeholder="Ders seçin..."
            options={lessonOptions}
            value={lesson}
            onChange={e => { setLesson(e.target.value); setTopic('') }}
            disabled={isRunning}
          />
          {lesson && (
            <Select
              placeholder="Konu seçin (opsiyonel)"
              options={topicOptions}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              disabled={isRunning}
            />
          )}
        </div>
      </Card>

      {/* Timer Display */}
      <Card className="p-8 mb-6">
        <div className="text-center">
          <motion.div
            key={elapsed}
            className="font-mono text-6xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-wider mb-8"
          >
            {hours > 0 && (
              <span>{String(hours).padStart(2, '0')}:</span>
            )}
            <span>{String(minutes).padStart(2, '0')}</span>
            <span className="text-primary-500">:</span>
            <span>{String(seconds).padStart(2, '0')}</span>
          </motion.div>

          {/* Pulsing indicator */}
          {isRunning && (
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-6"
            />
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            {!isRunning ? (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={start}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-xl transition-shadow"
              >
                <Play className="w-7 h-7 text-white ml-1" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={pause}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 hover:shadow-xl transition-shadow"
              >
                <Pause className="w-7 h-7 text-white" />
              </motion.button>
            )}

            {elapsed > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStop}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30"
                >
                  <Square className="w-6 h-6 text-white" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={reset}
                  className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </motion.button>
              </>
            )}
          </div>

          {/* Quick add study */}
          {elapsed > 0 && !isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Button
                variant="outline"
                size="sm"
                icon={PlusCircle}
                onClick={handleAddStudyFromTimer}
              >
                Çalışma kaydı olarak ekle
              </Button>
            </motion.div>
          )}
        </div>
      </Card>

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-3"
        >
          <Clock className="w-4 h-4" />
          Son Oturumlar
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {history.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">Henüz oturum yok</p>
              ) : (
                history.map((s, i) => (
                  <Card key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {s.lesson} {s.topic && `· ${s.topic}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {s.startedAt && formatDate(s.startedAt)}
                      </p>
                    </div>
                    <span className="text-sm font-mono font-semibold text-primary-600 dark:text-primary-400">
                      {formatDurationText(s.duration)}
                    </span>
                  </Card>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
