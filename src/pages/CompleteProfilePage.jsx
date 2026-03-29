import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import { FIELDS } from '../data/yksData'

export default function CompleteProfilePage() {
  const [field, setField] = useState('')
  const [loading, setLoading] = useState(false)
  const { completeGoogleProfile, user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!field) {
      addToast('Lütfen bir alan seçin', 'error')
      return
    }
    setLoading(true)
    try {
      await completeGoogleProfile(field)
      addToast('Profil tamamlandı! Hoş geldiniz 🎉', 'success')
      navigate('/')
    } catch (err) {
      console.error('Profil kaydetme hatası:', err)
      addToast('Profil kaydedilemedi: ' + (err.message || 'Bilinmeyen hata'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Hoş geldin, {user?.displayName || 'Kullanıcı'}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Son bir adım: alanını seç
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hangi alanda hazırlanıyorsun?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Bu seçim, sana gösterilecek AYT derslerini belirler. Daha sonra ayarlardan değiştirebilirsin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {Object.values(FIELDS).map(f => (
                <motion.button
                  key={f.value}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setField(f.value)}
                  className={`
                    w-full px-4 py-4 rounded-xl text-left border-2 transition-all duration-200
                    ${field === f.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 shadow-md'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <span className={`text-base font-medium ${
                    field === f.value
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {f.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <Button type="submit" loading={loading} className="w-full" disabled={!field}>
              Devam Et
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
