import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Target,
  Palette,
  Sun,
  Moon,
  Save,
  LogOut,
  BookOpen,
  Info,
  Download,
  Bell,
  BellOff,
  Check
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme, GRADIENTS } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { useNotifications } from '../hooks/useNotifications'
import { FIELDS } from '../data/yksData'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function SettingsPage() {
  const { user, userProfile, updateUserProfile, logout } = useAuth()
  const { theme, toggleTheme, gradient, setGradient } = useTheme()
  const { addToast } = useToast()

  const [dailyGoal, setDailyGoal] = useState(String(userProfile?.dailyGoal || 100))
  const [field, setField] = useState(userProfile?.field || 'sayisal')
  const [saving, setSaving] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [reminderTime, setReminderTime] = useState(userProfile?.reminderTime || '20:00')
  const { permission, requestPermission, scheduleReminder } = useNotifications()

  // PWA install prompt
  useState(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  })

  async function handleSave() {
    setSaving(true)
    try {
      await updateUserProfile({
        dailyGoal: parseInt(dailyGoal) || 100,
        field,
        reminderTime,
        gradient
      })
      addToast('Ayarlar kaydedildi', 'success')
    } catch {
      addToast('Ayarlar kaydedilemedi', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      addToast('Uygulama yüklendi!', 'success')
    }
    setInstallPrompt(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>

      {/* Profile */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Profil</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
              {(user?.displayName || 'K')[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{user?.displayName || 'Kullanıcı'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Study Settings */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-orange-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Çalışma Ayarları</h3>
        </div>
        <div className="space-y-4">
          <Input
            label="Günlük Soru Hedefi"
            type="number"
            min="1"
            max="1000"
            value={dailyGoal}
            onChange={e => setDailyGoal(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alan Seçimi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(FIELDS).map(f => (
                <motion.button
                  key={f.value}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setField(f.value)}
                  className={`
                    px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all
                    ${field === f.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>

          <Button onClick={handleSave} loading={saving} icon={Save}>
            Kaydet
          </Button>
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Görünüm</h3>
        </div>

        {/* Dark/Light Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-primary-400" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {theme === 'dark' ? 'Karanlık Mod' : 'Açık Mod'}
            </span>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`
              relative w-12 h-7 rounded-full transition-colors duration-300
              ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'}
            `}
          >
            <motion.div
              animate={{ x: theme === 'dark' ? 22 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>

        {/* Gradient Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Arka Plan Teması
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {GRADIENTS.map(g => {
              const isSelected = gradient === g.id
              const previewBg = g.id === 'none'
                ? (theme === 'dark' ? '#0f172a' : '#f9fafb')
                : (theme === 'dark' ? g.dark : g.light)
              return (
                <motion.button
                  key={g.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setGradient(g.id)}
                  className={`
                    relative rounded-xl p-1 border-2 transition-all overflow-hidden
                    ${isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div
                    className="w-full h-14 rounded-lg"
                    style={{ background: previewBg }}
                  />
                  <p className={`text-[10px] mt-1 font-medium text-center pb-0.5 ${
                    isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {g.label}
                  </p>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center gap-3">
              {permission === 'granted' ? (
                <Bell className="w-5 h-5 text-yellow-500" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-400" />
              )}
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Çalışma Hatırlatıcısı
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {permission === 'granted' ? 'Bildirimler aktif' : 'Bildirim izni gerekli'}
                </p>
              </div>
            </div>
            {permission !== 'granted' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const result = await requestPermission()
                  if (result === 'granted') {
                    addToast('Bildirimler açıldı!', 'success')
                  } else if (result === 'denied') {
                    addToast('Bildirim izni reddedildi. Tarayıcı ayarlarından açabilirsiniz.', 'error')
                  }
                }}
              >
                İzin Ver
              </Button>
            ) : (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Aktif</span>
            )}
          </div>
          {permission === 'granted' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Hatırlatma Saati:</label>
              <input
                type="time"
                value={reminderTime}
                onChange={e => {
                  setReminderTime(e.target.value)
                  const [h, m] = e.target.value.split(':').map(Number)
                  scheduleReminder(h, m)
                }}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Install PWA */}
      {installPrompt && (
        <Card className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Uygulamayı Yükle</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            StudyLogger'ı ana ekranınıza ekleyin ve uygulama gibi kullanın.
          </p>
          <Button onClick={handleInstall} icon={Download} variant="outline">
            Uygulamayı Yükle
          </Button>
        </Card>
      )}

      {/* About */}
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <Info className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Hakkında</h3>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">StudyLogger</p>
            <p className="text-xs text-gray-500">v1.0.0 · YKS Çalışma Takip</p>
          </div>
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        icon={LogOut}
        onClick={logout}
        className="w-full"
      >
        Çıkış Yap
      </Button>
    </motion.div>
  )
}
