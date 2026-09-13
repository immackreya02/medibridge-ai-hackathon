import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../utils/firebase'

const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'demo-api-key' &&
  import.meta.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key'
)

const AuthContext = createContext(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState(null)
  const [language, setLanguageState] = useState(() => localStorage.getItem('medibridge_language') || 'en')

  const setLanguage = (code) => {
    localStorage.setItem('medibridge_language', code)
    setLanguageState(code)
    if (userProfile) {
      setUserProfile(p => ({ ...p, preferredLanguage: code }))
    }
  }

  const createUserDoc = async (firebaseUser, extra = {}) => {
    try {
      const ref = doc(db, 'users', firebaseUser.uid)
      const snap = await getDoc(ref)
      if (!snap.exists()) {
        await setDoc(ref, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || extra.name || 'Demo User',
          photoURL: firebaseUser.photoURL || '',
          preferredLanguage: 'en',
          createdAt: serverTimestamp(),
          totalChats: 0,
          totalReports: 0,
          ...extra,
        })
      }
      const updated = await getDoc(ref)
      setUserProfile(updated.data())
    } catch (err) {
      console.warn('Firestore doc creation skipped (using demo profile):', err.message)
      setUserProfile({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || extra.name || 'Demo User',
        preferredLanguage: 'en'
      })
    }
  }

  const setDemoSession = (email, name = 'Demo User') => {
    const demoUser = {
      uid: 'demo_user_' + Date.now(),
      email: email || 'demo@medibridge.ai',
      displayName: name || 'Demo User',
      photoURL: '',
      getIdToken: async () => 'demo-mock-token'
    }
    const demoProfile = {
      uid: demoUser.uid,
      email: demoUser.email,
      displayName: demoUser.displayName,
      preferredLanguage: 'en'
    }
    localStorage.setItem('medibridge_demo_user', JSON.stringify(demoUser))
    setUser(demoUser)
    setUserProfile(demoProfile)
    return { user: demoUser }
  }

  useEffect(() => {
    if (!isFirebaseConfigured) {
      const saved = localStorage.getItem('medibridge_demo_user')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          parsed.getIdToken = async () => 'demo-mock-token'
          setUser(parsed)
          setUserProfile({
            uid: parsed.uid,
            email: parsed.email,
            displayName: parsed.displayName,
            preferredLanguage: 'en'
          })
        } catch {}
      }
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) await createUserDoc(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    if (!isFirebaseConfigured) {
      return setDemoSession(email, email.split('@')[0])
    }
    try {
      return await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        console.warn('Firebase API key invalid, falling back to Demo Mode.')
        return setDemoSession(email, email.split('@')[0])
      }
      throw err
    }
  }

  const register = async (email, password, name) => {
    if (!isFirebaseConfigured) {
      return setDemoSession(email, name)
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      await createUserDoc(cred.user, { displayName: name })
      return cred
    } catch (err) {
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        console.warn('Firebase API key invalid, falling back to Demo Mode.')
        return setDemoSession(email, name)
      }
      throw err
    }
  }

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      return setDemoSession('google.user@medibridge.ai', 'Google Demo User')
    }
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await createUserDoc(cred.user)
      return cred
    } catch (err) {
      if (err.code === 'auth/api-key-not-valid' || err.message?.includes('api-key-not-valid')) {
        console.warn('Firebase API key invalid, falling back to Demo Mode.')
        return setDemoSession('google.user@medibridge.ai', 'Google Demo User')
      }
      throw err
    }
  }

  const logout = async () => {
    localStorage.removeItem('medibridge_demo_user')
    setUser(null)
    setUserProfile(null)
    if (isFirebaseConfigured) {
      try { await signOut(auth) } catch {}
    }
  }

  const resetPassword = (email) => {
    if (!isFirebaseConfigured) return Promise.resolve()
    return sendPasswordResetEmail(auth, email)
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, language, setLanguage, login, register, loginWithGoogle, logout, resetPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

