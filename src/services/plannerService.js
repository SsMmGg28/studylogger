import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

function getPlanRef(userId) {
  return collection(db, 'users', userId, 'weeklyPlans')
}

export async function addPlanItem(userId, data) {
  const ref = getPlanRef(userId)
  const { weekStart, ...rest } = data
  return addDoc(ref, {
    ...rest,
    weekStartKey: typeof weekStart === 'string' ? weekStart : weekStart.toDate ? weekStart.toDate().toISOString().split('T')[0] : new Date(weekStart).toISOString().split('T')[0],
    completed: false,
    createdAt: serverTimestamp()
  })
}

export async function getPlanItems(userId, weekStartISO) {
  const ref = getPlanRef(userId)
  const start = new Date(weekStartISO)
  start.setHours(0, 0, 0, 0)
  const weekKey = start.toISOString().split('T')[0]

  const q = query(
    ref,
    where('weekStartKey', '==', weekKey)
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
