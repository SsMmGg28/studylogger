import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState(null)
  const intervalRef = useRef(null)
  const elapsedBeforePause = useRef(0)

  const start = useCallback(() => {
    if (isRunning) return
    setIsRunning(true)
    setStartTime(prev => prev || new Date())
    const startedAt = Date.now() - elapsedBeforePause.current * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 200)
  }, [isRunning])

  const pause = useCallback(() => {
    if (!isRunning) return
    setIsRunning(false)
    elapsedBeforePause.current = elapsed
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isRunning, elapsed])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    const finalElapsed = elapsed
    setElapsed(0)
    elapsedBeforePause.current = 0
    const finalStartTime = startTime
    setStartTime(null)
    return { duration: finalElapsed, startedAt: finalStartTime }
  }, [elapsed, startTime])

  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(0)
    setStartTime(null)
    elapsedBeforePause.current = 0
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { elapsed, isRunning, startTime, start, pause, stop, reset }
}
