import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

function getPlanRef(userId) {
  return collection(db, 'users', userId, 'weeklyPlans')
}

export async function addPlanItem(userId, data) {
  const ref = getPlanRef(userId)
  return addDoc(ref, {
    ...data,
    completed: false,
    createdAt: serverTimestamp()
  })
}

export async function getPlanItems(userId, weekStart) {
  const ref = getPlanRef(userId)
  const start = new Date(weekStart)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  const q = query(
    ref,
    where('weekStart', '>=', Timestamp.fromDate(start)),
    where('weekStart', '<', Timestamp.fromDate(end))
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function togglePlanItem(userId, itemId, completed) {
  const ref = doc(db, 'users', userId, 'weeklyPlans', itemId)
  return updateDoc(ref, { completed })
}

export async function deletePlanItem(userId, itemId) {
  const ref = doc(db, 'users', userId, 'weeklyPlans', itemId)
  return deleteDoc(ref)
}
