import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Trash2,
  Edit3,
  Calendar,
  BookOpen,
  ChevronDown,
  X
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getStudyLogs, deleteStudyLog, updateStudyLog } from '../services/studyService'
import { getLessonOptions, getTopics } from '../data/yksData'
import { formatDate, calculateNet, toDateInputValue } from '../utils/formatters'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

export default function HistoryPage() {
  const { user, userProfile } = useAuth()
  const { addToast } = useToast()
  const field = userProfile?.field || 'sayisal'

  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filterExamType, setFilterExamType] = useState('')
  const [filterLesson, setFilterLesson] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')

  // Edit modal
  const [editLog, setEditLog] = useState(null)
  const [editData, setEditData] = useState({})

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    if (user) loadLogs()
  }, [user])

  async function loadLogs() {
    setLoading(true)
    try {
      const filters = {}
      if (filterStartDate) filters.startDate = filterStartDate
      if (filterEndDate) filters.endDate = filterEndDate
      if (filterLesson) filters.lesson = filterLesson
      if (filterExamType) filters.examType = filterExamType
      const data = await getStudyLogs(user.uid, filters)
      setLogs(data)
    } catch (err) {
      addToast('Kayıtlar yüklenemedi', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteStudyLog(user.uid, deleteId)
      setLogs(prev => prev.filter(l => l.id !== deleteId))
      addToast('Kayıt silindi', 'success')
    } catch {
      addToast('Silme başarısız', 'error')
    }
    setDeleteId(null)
  }

  async function handleUpdate() {
    if (!editLog) return
    try {
      await updateStudyLog(user.uid, editLog.id, {
        questionCount: parseInt(editData.questionCount),
        correctCount: parseInt(editData.correctCount),
        wrongCount: parseInt(editData.wrongCount),
        emptyCount: parseInt(editData.emptyCount) || 0,
        notes: editData.notes || ''
      })
      setLogs(prev => prev.map(l =>
        l.id === editLog.id ? { ...l, ...editData,
          questionCount: parseInt(editData.questionCount),
          correctCount: parseInt(editData.correctCount),
          wrongCount: parseInt(editData.wrongCount),
          emptyCount: parseInt(editData.emptyCount) || 0
        } : l
      ))
      addToast('Kayıt güncellendi', 'success')
    } catch {
      addToast('Güncelleme başarısız', 'error')
    }
    setEditLog(null)
  }

  function openEdit(log) {
    setEditLog(log)
    setEditData({
      questionCount: String(log.questionCount),
      correctCount: String(log.correctCount),
      wrongCount: String(log.wrongCount),
      emptyCount: String(log.emptyCount || 0),
      notes: log.notes || ''
    })
  }

  const lessonOptions = [
    ...getLessonOptions('TYT', field),
    ...getLessonOptions('AYT', field)
  ].map(l => ({ value: l.label, label: l.label }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Geçmiş Kayıtlar</h1>
        <Button
          variant="secondary"
          size="sm"
          icon={Filter}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtrele
        </Button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Select
                  label="Sınav Türü"
                  placeholder="Tümü"
                  options={[{ value: 'TYT', label: 'TYT' }, { value: 'AYT', label: 'AYT' }]}
                  value={filterExamType}
                  onChange={e => setFilterExamType(e.target.value)}
                />
                <Select
                  label="Ders"
                  placeholder="Tümü"
                  options={lessonOptions}
                  value={filterLesson}
                  onChange={e => setFilterLesson(e.target.value)}
                />
                <Input
                  label="Başlangıç"
                  type="date"
                  value={filterStartDate}
                  onChange={e => setFilterStartDate(e.target.value)}
                />
                <Input
                  label="Bitiş"
                  type="date"
                  value={filterEndDate}
                  onChange={e => setFilterEndDate(e.target.value)}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={loadLogs} icon={Search}>
                  Ara
                </Button>
                <Button size="sm" variant="ghost" onClick={() => {
                  setFilterExamType('')
                  setFilterLesson('')
                  setFilterStartDate('')
                  setFilterEndDate('')
                }}>
                  Temizle
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {loading ? (
        <LoadingSpinner text="Kayıtlar yükleniyor..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Kayıt bulunamadı"
          description="Seçilen filtrelere uygun çalışma kaydı yok."
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-lg shrink-0">
                      {log.examType === 'TYT' ? '📘' : '📗'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {log.examType} - {log.lesson}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{log.topic}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(log.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {log.questionCount} soru
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="text-green-500">{log.correctCount}D</span>
                        {' · '}
                        <span className="text-red-500">{log.wrongCount}Y</span>
                        {' · '}
                        <span className="text-gray-400">{log.emptyCount || 0}B</span>
                      </p>
                      <p className="text-xs font-medium text-primary-600 dark:text-primary-400">
                        Net: {calculateNet(log.correctCount, log.wrongCount)}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(log)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-primary-500" />
                      </button>
                      <button
                        onClick={() => setDeleteId(log.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
                {log.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-13 italic">
                    "{log.notes}"
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal isOpen={!!editLog} onClose={() => setEditLog(null)} title="Kaydı Düzenle">
        {editLog && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {editLog.examType} - {editLog.lesson} · {editLog.topic}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Toplam Soru"
                type="number"
                value={editData.questionCount}
                onChange={e => setEditData(p => ({ ...p, questionCount: e.target.value }))}
              />
              <Input
                label="Doğru"
                type="number"
                value={editData.correctCount}
                onChange={e => setEditData(p => ({ ...p, correctCount: e.target.value }))}
              />
              <Input
                label="Yanlış"
                type="number"
                value={editData.wrongCount}
                onChange={e => setEditData(p => ({ ...p, wrongCount: e.target.value }))}
              />
              <Input
                label="Boş"
                type="number"
                value={editData.emptyCount}
                onChange={e => setEditData(p => ({ ...p, emptyCount: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Not</label>
              <textarea
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                rows={2}
                value={editData.notes}
                onChange={e => setEditData(p => ({ ...p, notes: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdate} className="flex-1">Güncelle</Button>
              <Button variant="secondary" onClick={() => setEditLog(null)}>İptal</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Kaydı Sil" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Bu çalışma kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} className="flex-1">Sil</Button>
          <Button variant="secondary" onClick={() => setDeleteId(null)}>İptal</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
