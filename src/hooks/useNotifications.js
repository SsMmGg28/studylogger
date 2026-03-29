import { useState, useEffect, useCallback, useRef } from 'react'

export function useNotifications() {
  const [permission, setPermission] = useState('default')
  const timerRef = useRef(null)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported'
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return
    const notification = new Notification(title, {
      icon: '/icons/icon-192x192.svg',
      badge: '/icons/icon-192x192.svg',
      ...options
    })
    return notification
  }, [permission])

  const scheduleReminder = useCallback((hours, minutes) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    const now = new Date()
    const target = new Date()
    target.setHours(hours, minutes, 0, 0)

    if (target <= now) {
      target.setDate(target.getDate() + 1)
    }

    const delay = target.getTime() - now.getTime()
    timerRef.current = setTimeout(() => {
      sendNotification('Çalışma Zamanı! 📚', {
        body: 'Bugünkü çalışma planını tamamlamayı unutma!',
        tag: 'study-reminder'
      })
    }, delay)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [sendNotification])

  const clearReminder = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    clearReminder
  }
}
