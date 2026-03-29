import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const GOOGLE_REDIRECT_PENDING_KEY = 'studylogger-google-redirect-pending'

function getAuthErrorMessage(err, mode = 'login') {
  const commonMessages = {
    'auth/invalid-email': 'Geçersiz e-posta adresi.',
    'auth/too-many-requests': 'Çok fazla deneme yapıldı. Birkaç dakika sonra tekrar deneyin.',
    'auth/network-request-failed': 'Ağ bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.',
    'auth/internal-error': 'Firebase tarafında beklenmeyen bir hata oluştu.'
  }

  const loginMessages = {
    'auth/user-not-found': 'Bu e-posta ile kayıtlı kullanıcı bulunamadı.',
    'auth/wrong-password': 'Şifre hatalı.',
    'auth/invalid-credential': 'E-posta veya şifre hatalı.',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
    'auth/operation-not-allowed': 'E-posta/şifre ile giriş Firebase Authentication içinde aktif değil.'
  }

  const googleMessages = {
    'auth/popup-blocked': 'Tarayıcı popup penceresini engelledi. Google girişi yönlendirme ile devam edecek.',
    'auth/popup-closed-by-user': 'Google giriş penceresi kapatıldı.',
    'auth/cancelled-popup-request': 'Google giriş isteği iptal edildi.',
    'auth/unauthorized-domain': 'Bu domain Firebase Authentication içinde yetkili değil.',
    'auth/operation-not-allowed': 'Google ile giriş yöntemi Firebase Authentication içinde aktif değil.'
  }

  const scopedMessages = mode === 'google' ? googleMessages : loginMessages
  return scopedMessages[err?.code] || commonMessages[err?.code] || `Kimlik doğrulama hatası: ${err?.code || err?.message || 'bilinmeyen-hata'}`
}

function shouldUseRedirect() {
  if (typeof window === 'undefined') return false

  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobileBrowser = /android|iphone|ipad|ipod|mobile/.test(userAgent)
  const isInAppBrowser = /(fbav|instagram|line|wv)/.test(userAgent)

  return isSmallScreen || isMobileBrowser || isInAppBrowser
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle, getGoogleRedirectLoginResult } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false

    async function handleRedirectResult() {
      if (!window.sessionStorage.getItem(GOOGLE_REDIRECT_PENDING_KEY)) return

      try {
        const result = await getGoogleRedirectLoginResult()
        window.sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
        if (!result || ignore) return

        if (result.isNew) {
          addToast('Google hesabınız bağlandı. Profilinizi tamamlayın.', 'success')
          navigate('/complete-profile', { replace: true })
          return
        }

        addToast('Giriş başarılı!', 'success')
        navigate('/', { replace: true })
      } catch (err) {
        window.sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
        console.error('Google redirect giriş hatası:', err)
        if (!ignore) {
          addToast(getAuthErrorMessage(err, 'google'), 'error')
        }
      }
    }

    handleRedirectResult()

    return () => {
      ignore = true
    }
  }, [addToast, getGoogleRedirectLoginResult, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) {
      addToast('Lütfen tüm alanları doldurun', 'error')
      return
    }
    setLoading(true)
    try {
      await login(email, password)
      addToast('Giriş başarılı!', 'success')
      navigate('/')
    } catch (err) {
      console.error('E-posta/şifre giriş hatası:', err)
      addToast(getAuthErrorMessage(err, 'login'), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setLoading(true)
    try {
      const useRedirect = shouldUseRedirect()
      if (useRedirect) {
        window.sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
      }
      const result = await loginWithGoogle({ useRedirect })

      if (useRedirect) {
        return
      }

      if (result.isNew) {
        navigate('/complete-profile')
      } else {
        addToast('Giriş başarılı!', 'success')
        navigate('/')
      }
    } catch (err) {
      console.error('Google popup giriş hatası:', err)

      if (err?.code === 'auth/popup-blocked' || err?.code === 'auth/web-storage-unsupported') {
        try {
          window.sessionStorage.setItem(GOOGLE_REDIRECT_PENDING_KEY, '1')
          await loginWithGoogle({ useRedirect: true })
          return
        } catch (redirectErr) {
          window.sessionStorage.removeItem(GOOGLE_REDIRECT_PENDING_KEY)
          console.error('Google redirect fallback hatası:', redirectErr)
          addToast(getAuthErrorMessage(redirectErr, 'google'), 'error')
        }
      } else {
        addToast(getAuthErrorMessage(err, 'google'), 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-950 dark:via-gray-900 dark:to-primary-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
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

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Giriş Yap</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button type="submit" loading={loading} className="w-full">
              Giriş Yap
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white dark:bg-gray-800 text-gray-500">veya</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogle}
            loading={loading}
            className="w-full"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </Button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Hesabınız yok mu?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
