import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GripVertical
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { addPlanItem, getPlanItems, togglePlanItem, deletePlanItem } from '../services/plannerService'
import { getLessonOptions, getTopics } from '../data/yksData'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import LoadingSpinner from '../components/common/LoadingSpinner'
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const SHORT_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function PlannerPage() {
  const { user, userProfile } = useAuth()
  const { addToast } = useToast()
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [formExamType, setFormExamType] = useState('TYT')
  const [formLesson, setFormLesson] = useState('')
  const [formTopic, setFormTopic] = useState('')
  const [formTarget, setFormTarget] = useState('20')
  const [saving, setSaving] = useState(false)

  const field = userProfile?.field || 'sayisal'
  const lessons = useMemo(() => getLessonOptions(formExamType, field), [field, formExamType])
  const topics = useMemo(() => formLesson ? getTopics(formExamType, formLesson, field) : [], [formExamType, formLesson, field])

  useEffect(() => {
    if (user) loadPlan()
  }, [user, weekStart])

  async function loadPlan() {
    setLoading(true)
    try {
      const data = await getPlanItems(user.uid, weekStart.toISOString())
      setItems(data)
    } catch (err) {
      console.error('Plan yükleme hatası:', err)
    } finally {
      setLoading(false)
    }
  }

  function changeWeek(delta) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + delta * 7)
    setWeekStart(d)
  }

  function isThisWeek() {
    const monday = getMonday(new Date())
    return weekStart.getTime() === monday.getTime()
  }

  function openAddModal(dayIndex) {
    setSelectedDay(dayIndex)
    setFormExamType('TYT')
    setFormLesson('')
    setFormTopic('')
    setFormTarget('20')
    setShowModal(true)
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!formLesson) {
      addToast('Lütfen ders seçin', 'error')
      return
    }
    setSaving(true)
    try {
      await addPlanItem(user.uid, {
        dayIndex: selectedDay,
        examType: formExamType,
        lesson: formLesson,
        topic: formTopic || 'Genel',
        targetQuestions: parseInt(formTarget) || 20,
        weekStart: weekStart.toISOString().split('T')[0]
      })
      addToast('Plan eklendi', 'success')
      setShowModal(false)
      await loadPlan()
    } catch (err) {
      console.error('Plan ekleme hatası:', err)
      addToast('Plan eklenemedi', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(item) {
    try {
      await togglePlanItem(user.uid, item.id, !item.completed)
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, completed: !i.completed } : i))
    } catch {
      addToast('Güncellenemedi', 'error')
    }
  }

  async function handleDelete(itemId) {
    try {
      await deletePlanItem(user.uid, itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
      addToast('Silindi', 'info')
    } catch {
      addToast('Silinemedi', 'error')
    }
  }

  function getItemsForDay(dayIndex) {
    return items.filter(i => i.dayIndex === dayIndex)
  }

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const totalItems = items.length
  const completedItems = items.filter(i => i.completed).length
  const completionPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  const today = new Date()
  const todayDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1

  if (loading) return <LoadingSpinner text="Plan yükleniyor..." />

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary-500" />
            Haftalık Plan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Çalışma programını planla ve takip et
          </p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => changeWeek(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="text-center">
            <p className="font-semibold text-gray-900 dark:text-white">
              {weekStart.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            {isThisWeek() && (
              <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">Bu Hafta</span>
            )}
          </div>
          <button onClick={() => changeWeek(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Week Progress */}
        {totalItems > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400">Haftalık İlerleme</span>
              <span className="font-medium text-gray-900 dark:text-white">{completedItems}/{totalItems} ({completionPercent}%)</span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.8 }}
                className={`h-full rounded-full ${
                  completionPercent === 100 ? 'bg-green-500' : 'bg-primary-500'
                }`}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {DAYS.map((day, dayIndex) => {
          const dayItems = getItemsForDay(dayIndex)
          const isToday = isThisWeek() && dayIndex === todayDayIndex
          const dayCompleted = dayItems.length > 0 && dayItems.every(i => i.completed)

          return (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
            >
              <Card className={`p-4 ${isToday ? 'ring-2 ring-primary-500 dark:ring-primary-400' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-semibold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                      {day}
                    </h3>
                    {isToday && (
                      <span className="text-[10px] bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full font-medium">
                        Bugün
                      </span>
                    )}
                    {dayCompleted && dayItems.length > 0 && (
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                        ✓
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddModal(dayIndex)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2 min-h-[60px]">
                  <AnimatePresence>
                    {dayItems.map(item => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`flex items-start gap-2 p-2.5 rounded-lg transition-colors ${
                          item.completed
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <button onClick={() => handleToggle(item)} className="mt-0.5 flex-shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            item.completed
                              ? 'line-through text-gray-400 dark:text-gray-500'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.examType} - {item.lesson}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.topic} · {item.targetQuestions} soru
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {dayItems.length === 0 && (
                    <div className="flex items-center justify-center h-[60px]">
                      <p className="text-xs text-gray-400 dark:text-gray-500">Plan yok</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Add Plan Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`${DAYS[selectedDay]} - Plan Ekle`}>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex gap-2">
            {['TYT', 'AYT'].map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setFormExamType(type); setFormLesson(''); setFormTopic('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formExamType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <Select
            label="Ders"
            value={formLesson}
            onChange={e => { setFormLesson(e.target.value); setFormTopic('') }}
            options={[
              { value: '', label: 'Ders seçin' },
              ...lessons.map(l => ({ value: l.key, label: l.label }))
            ]}
          />

          {topics.length > 0 && (
            <Select
              label="Konu"
              value={formTopic}
              onChange={e => setFormTopic(e.target.value)}
              options={[
                { value: '', label: 'Konu seçin (opsiyonel)' },
                ...topics.map(t => ({ value: t, label: t }))
              ]}
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hedef Soru Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={formTarget}
              onChange={e => setFormTarget(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              İptal
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              Ekle
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  )
}
