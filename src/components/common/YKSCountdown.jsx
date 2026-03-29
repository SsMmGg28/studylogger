import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Hourglass } from 'lucide-react'

// YKS TYT genellikle Haziran ortası yapılır
function getNextYKSDate() {
  const now = new Date()
  let year = now.getFullYear()
  // TYT genellikle Haziran'ın 2. veya 3. haftasonu
  let yksDate = new Date(year, 5, 14, 10, 0, 0) // 14 Haziran 10:00

  // Eğer bu yılki tarih geçtiyse gelecek yıla bak
  if (now > yksDate) {
    yksDate = new Date(year + 1, 5, 14, 10, 0, 0)
  }

  return yksDate
}

function getMotivation(days) {
  if (days <= 7) return { text: 'Son sprint! Her şey senin elinde! 🔥', color: 'from-red-500 to-rose-600' }
  if (days <= 30) return { text: 'Son düzlüğe girdin, durmak yok! 💪', color: 'from-orange-500 to-red-500' }
  if (days <= 60) return { text: 'Tekrar zamanı! Eksiklerini kapat 📝', color: 'from-amber-500 to-orange-500' }
  if (days <= 90) return { text: 'Her gün seni hedefe yaklaştırıyor ⭐', color: 'from-yellow-500 to-amber-500' }
  if (days <= 180) return { text: 'Düzenli çalışma başarının anahtarı 🗝️', color: 'from-emerald-500 to-teal-500' }
  return { text: 'Erken başlayan çok kazanır! 🚀', color: 'from-blue-500 to-indigo-500' }
}

export default function YKSCountdown() {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    function calc() {
      const yks = getNextYKSDate()
      const now = new Date()
      const diff = yks - now

      if (diff <= 0) return setTimeLeft(null)

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calc()
    const interval = setInterval(calc, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!timeLeft) return null

  const motivation = getMotivation(timeLeft.days)

  const units = [
    { value: timeLeft.days, label: 'Gün' },
    { value: timeLeft.hours, label: 'Saat' },
    { value: timeLeft.minutes, label: 'Dakika' },
    { value: timeLeft.seconds, label: 'Saniye' }
  ]

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${motivation.color} p-5 text-white shadow-lg`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-5 h-5" />
          <h3 className="font-bold text-sm uppercase tracking-wide opacity-90">
            YKS Geri Sayım
          </h3>
          <Hourglass className="w-4 h-4 opacity-70 animate-pulse" />
        </div>

        {/* Countdown boxes */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {units.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl py-2 px-1">
                <span className="text-2xl md:text-3xl font-bold tabular-nums">
                  {String(unit.value).padStart(2, '0')}
                </span>
              </div>
              <span className="text-[10px] font-medium opacity-80 mt-1 block">{unit.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Motivational message */}
        <p className="text-sm font-medium opacity-90 text-center">
          {motivation.text}
        </p>
      </div>
    </div>
  )
}
