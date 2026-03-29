import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Save, Plus, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { addStudyLog } from '../services/studyService'
import { getLessonOptions, getTopics } from '../data/yksData'
import { toDateInputValue } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'

export default function AddStudyPage() {
  const { user, userProfile } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialDuration = parseInt(searchParams.get('duration') || '0', 10)

  const [examType, setExamType] = useState('TYT')
  const [lesson, setLesson] = useState('')
  const [topic, setTopic] = useState('')
  const [questionCount, setQuestionCount] = useState('')
  const [correctCount, setCorrectCount] = useState('')
  const [wrongCount, setWrongCount] = useState('')
  const [emptyCount, setEmptyCount] = useState('')
  const [date, setDate] = useState(toDateInputValue())
  const [duration, setDuration] = useState(initialDuration > 0 ? Math.round(initialDuration / 60) : '')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const field = userProfile?.field || 'sayisal'
  const lessonOptions = getLessonOptions(examType, field).map(l => ({ value: l.key, label: `${l.icon} ${l.label}` }))
  const topicOptions = lesson
    ? getTopics(examType, lesson, field).map(t => ({ value: t, label: t }))
    : []

  function handleLessonChange(e) {
    setLesson(e.target.value)
    setTopic('')
  }

  function validate() {
    const q = parseInt(questionCount) || 0
    const c = parseInt(correctCount) || 0
    const w = parseInt(wrongCount) || 0
    const e = parseInt(emptyCount) || 0

    if (!lesson) return 'Lütfen bir ders seçin'
    if (!topic) return 'Lütfen bir konu seçin'
    if (q <= 0) return 'Soru sayısı 0\'dan büyük olmalı'
    if (c + w + e !== q) return `Doğru(${c}) + Yanlış(${w}) + Boş(${e}) = ${c+w+e}, Toplam soru: ${q} ile eşleşmiyor`
    if (c < 0 || w < 0 || e < 0) return 'Negatif değer girilemez'
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const error = validate()
    if (error) {
      addToast(error, 'error')
      return
    }

    setLoading(true)
    try {
      await addStudyLog(user.uid, {
        examType,
        lesson,
        topic,
        questionCount: parseInt(questionCount),
        correctCount: parseInt(correctCount),
        wrongCount: parseInt(wrongCount),
        emptyCount: parseInt(emptyCount) || 0,
        date,
        duration: duration ? parseInt(duration) * 60 : (initialDuration || 0),
        notes: notes.trim()
      })
      addToast('Çalışma kaydı eklendi! ✅', 'success')
      // Reset form
      setLesson('')
      setTopic('')
      setQuestionCount('')
      setCorrectCount('')
      setWrongCount('')
      setEmptyCount('')
      setDuration('')
      setNotes('')
    } catch (err) {
      addToast('Kayıt eklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Auto calculate empty
  function handleQuestionBlur() {
    const q = parseInt(questionCount) || 0
    const c = parseInt(correctCount) || 0
    const w = parseInt(wrongCount) || 0
    if (q > 0 && c >= 0 && w >= 0 && q >= c + w) {
      setEmptyCount(String(q - c - w))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Çalışma Kaydı Ekle
      </h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Exam Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sınav Türü
            </label>
            <div className="flex gap-2">
              {['TYT', 'AYT'].map(type => (
                <motion.button
                  key={type}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setExamType(type); setLesson(''); setTopic('') }}
                  className={`
                    flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border-2
                    ${examType === type
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }
                  `}
                >
                  {type}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Date */}
          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          {/* Lesson */}
          <Select
            label="Ders"
            placeholder="Ders seçin..."
            options={lessonOptions}
            value={lesson}
            onChange={handleLessonChange}
          />

          {/* Topic */}
          <Select
            label="Konu"
            placeholder={lesson ? 'Konu seçin...' : 'Önce ders seçin'}
            options={topicOptions}
            value={topic}
            onChange={e => setTopic(e.target.value)}
            disabled={!lesson}
          />

          {/* Question counts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              label="Toplam Soru"
              type="number"
              min="0"
              placeholder="0"
              value={questionCount}
              onChange={e => setQuestionCount(e.target.value)}
              onBlur={handleQuestionBlur}
            />
            <Input
              label="Doğru"
              type="number"
              min="0"
              placeholder="0"
              value={correctCount}
              onChange={e => setCorrectCount(e.target.value)}
              onBlur={handleQuestionBlur}
            />
            <Input
              label="Yanlış"
              type="number"
              min="0"
              placeholder="0"
              value={wrongCount}
              onChange={e => setWrongCount(e.target.value)}
              onBlur={handleQuestionBlur}
            />
            <Input
              label="Boş"
              type="number"
              min="0"
              placeholder="0"
              value={emptyCount}
              onChange={e => setEmptyCount(e.target.value)}
            />
          </div>

          {/* Validation hint */}
          {questionCount && correctCount && wrongCount && (
            <div className={`text-xs px-3 py-2 rounded-lg ${
              parseInt(questionCount) === (parseInt(correctCount) || 0) + (parseInt(wrongCount) || 0) + (parseInt(emptyCount) || 0)
                ? 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
            }`}>
              {parseInt(correctCount) || 0}D + {parseInt(wrongCount) || 0}Y + {parseInt(emptyCount) || 0}B = {(parseInt(correctCount) || 0) + (parseInt(wrongCount) || 0) + (parseInt(emptyCount) || 0)}
              {' '}/{' '}{questionCount} soru
            </div>
          )}

          {/* Duration */}
          <Input
            label="Çalışma Süresi (dakika)"
            type="number"
            min="0"
            placeholder="Opsiyonel"
            icon={Clock}
            value={duration}
            onChange={e => setDuration(e.target.value)}
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Not (opsiyonel)
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200"
              rows={3}
              placeholder="Çalışma hakkında not ekleyin..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} icon={Save} className="flex-1">
              Kaydet
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/')}>
              İptal
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
