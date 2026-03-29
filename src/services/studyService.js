import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

function getStudyLogsRef(userId) {
  return collection(db, 'users', userId, 'studyLogs')
}

export async function addStudyLog(userId, data) {
  const ref = getStudyLogsRef(userId)
  return addDoc(ref, {
    ...data,
    date: Timestamp.fromDate(new Date(data.date)),
    createdAt: serverTimestamp()
  })
}

export async function getStudyLogs(userId, filters = {}) {
  const ref = getStudyLogsRef(userId)
  let constraints = [orderBy('date', 'desc')]

  if (filters.startDate) {
    constraints.push(where('date', '>=', Timestamp.fromDate(new Date(filters.startDate))))
  }
  if (filters.endDate) {
    const end = new Date(filters.endDate)
    end.setHours(23, 59, 59, 999)
    constraints.push(where('date', '<=', Timestamp.fromDate(end)))
  }

  const q = query(ref, ...constraints)
  const snap = await getDocs(q)
  let logs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Client-side filtering for lesson and topic (Firestore compound query limitations)
  if (filters.lesson) {
    logs = logs.filter(l => l.lesson === filters.lesson)
  }
  if (filters.topic) {
    logs = logs.filter(l => l.topic === filters.topic)
  }
  if (filters.examType) {
    logs = logs.filter(l => l.examType === filters.examType)
  }

  return logs
}

export async function updateStudyLog(userId, logId, data) {
  const ref = doc(db, 'users', userId, 'studyLogs', logId)
  return updateDoc(ref, data)
}

export async function deleteStudyLog(userId, logId) {
  const ref = doc(db, 'users', userId, 'studyLogs', logId)
  return deleteDoc(ref)
}

export async function getTodayLogs(userId) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getStudyLogs(userId, {
    startDate: today.toISOString(),
    endDate: today.toISOString()
  })
}
