import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { FIELDS } from '../data/yksData'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [field, setField] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !email || !password || !field) {
      addToast('Lütfen tüm alanları doldurun', 'error')
      return
    }
    if (password.length < 6) {
      addToast('Şifre en az 6 karakter olmalı', 'error')
      return
    }
    setLoading(true)
    try {
      await register(email, password, name, field)
      addToast('Kayıt başarılı! Hoş geldiniz 🎉', 'success')
      navigate('/')
    } catch (err) {
      console.error('Kayıt hatası:', err)
      const messages = {
        'auth/email-already-in-use': 'Bu e-posta zaten kullanılıyor',
        'auth/invalid-email': 'Geçersiz e-posta adresi',
        'auth/weak-password': 'Şifre çok zayıf (en az 6 karakter)'
      }
      addToast(messages[err.code] || ('Kayıt başarısız: ' + err.message), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-4"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">StudyLogger</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">YKS Çalışma Takip</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Kayıt Ol</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              type="text"
              icon={User}
              placeholder="Adınız Soyadınız"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              label="E-posta"
              type="email"
              icon={Mail}
              placeholder="ornek@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              label="Şifre"
              type="password"
              icon={Lock}
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            {/* Alan Seçimi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alan Seçimi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(FIELDS).map(f => (
                  <motion.button
                    key={f.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setField(f.value)}
                    className={`
                      px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all duration-200
                      ${field === f.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      }
                    `}
                  >
                    {f.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Kayıt Ol
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
