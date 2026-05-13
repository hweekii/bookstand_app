import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) setProfile(data)
    setLoading(false)
    return data
  }

  async function signUp(email, password, displayName, username) {
    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

    // 1. Create the auth user
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }
    if (!data?.user) return { error: { message: 'Signup failed, please try again' } }

    // 2. Insert profile row immediately using the new user's id
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: displayName,
      initials,
      username,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert failed:', profileError)
      return { error: { message: 'Account created but profile failed to save: ' + profileError.message } }
    }

    // 3. Set profile in state immediately so UI reflects it
    setProfile({ id: data.user.id, display_name: displayName, initials, username })
    return { error: null }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (!error) setProfile(data)
    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      updateProfile,
      fetchProfile: () => fetchProfile(user?.id)
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
