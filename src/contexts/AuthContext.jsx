import { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../config/firebase'

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const skipProfileFetch = useRef(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        // register/loginWithGoogle zaten profili set ediyor, tekrar çekme
        if (skipProfileFetch.current) {
          skipProfileFetch.current = false
          setLoading(false)
          return
        }
        try {
          const profile = await fetchUserProfile(firebaseUser.uid)
          setUserProfile(profile)
        } catch (err) {
          console.error('Profil çekme hatası:', err)
        }
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function fetchUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  }

  async function register(email, password, displayName, field) {
    skipProfileFetch.current = true
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    const profile = {
      displayName,
      email,
      field,
      dailyGoal: 100,
      theme: 'light',
      createdAt: serverTimestamp()
    }
    await setDoc(doc(db, 'users', cred.user.uid), profile)
    setUserProfile(profile)
    return cred.user
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function finalizeGoogleLogin(cred) {
    let existing
    try {
      existing = await getDoc(doc(db, 'users', cred.user.uid))
    } catch (err) {
      console.error('Google profil kontrol hatası:', err)
      throw err
    }

    if (!existing.exists()) {
      return { user: cred.user, isNew: true }
    }

    setUserProfile(existing.data())
    return { user: cred.user, isNew: false }
  }

  async function loginWithGoogle({ useRedirect = false } = {}) {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider)
      return null
    }

    skipProfileFetch.current = true
    const cred = await signInWithPopup(auth, googleProvider)
    return finalizeGoogleLogin(cred)
  }

  async function getGoogleRedirectLoginResult() {
    const cred = await getRedirectResult(auth)
    if (!cred) return null

    skipProfileFetch.current = true
    return finalizeGoogleLogin(cred)
  }

  async function completeGoogleProfile(field) {
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı')
    const profile = {
      displayName: user.displayName || 'Kullanıcı',
      email: user.email,
      field,
      dailyGoal: 100,
      theme: 'light',
      createdAt: serverTimestamp()
    }
    await setDoc(doc(db, 'users', user.uid), profile)
    setUserProfile(profile)
  }

  async function updateUserProfile(data) {
    if (!user) return
    await setDoc(doc(db, 'users', user.uid), data, { merge: true })
    setUserProfile(prev => ({ ...prev, ...data }))
  }

  async function logout() {
    await signOut(auth)
    setUser(null)
    setUserProfile(null)
  }

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    loginWithGoogle,
    getGoogleRedirectLoginResult,
    completeGoogleProfile,
    updateUserProfile,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
