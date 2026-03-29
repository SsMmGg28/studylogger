import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore'
import { db } from '../config/firebase'

function getTimerRef(userId) {
  return collection(db, 'users', userId, 'timerSessions')
}

export async function saveTimerSession(userId, data) {
  const ref = getTimerRef(userId)
  return addDoc(ref, {
    lesson: data.lesson,
    topic: data.topic || '',
    duration: data.duration,
    startedAt: Timestamp.fromDate(new Date(data.startedAt)),
    endedAt: serverTimestamp()
  })
}

export async function getTimerSessions(userId, limit = 20) {
  const ref = getTimerRef(userId)
  const q = query(ref, orderBy('startedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.slice(0, limit).map(d => ({ id: d.id, ...d.data() }))
}

export async function getTimerSessionsByDate(userId, startDate, endDate) {
  const ref = getTimerRef(userId)
  const q = query(
    ref,
    where('startedAt', '>=', Timestamp.fromDate(startDate)),
    where('startedAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('startedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
