import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Mail, Lock, User, AtSign, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', displayName: '', username: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  function set(field) {
    return (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(form.email, form.password)
      if (error) setError(error.message)
    } else {
      if (!form.displayName.trim()) { setError('Please enter your name'); setLoading(false); return }
      if (!form.username.trim()) { setError('Please choose a username'); setLoading(false); return }
      if (!/^[a-z0-9_]+$/.test(form.username)) { setError('Username can only contain lowercase letters, numbers and underscores'); setLoading(false); return }

      // Check username is taken
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', form.username).maybeSingle()
      if (existing) { setError('That username is already taken'); setLoading(false); return }

      const { error } = await signUp(form.email, form.password, form.displayName, form.username)
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account, then log in.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <BookOpen className="w-6 h-6 text-accent" />
          <span className="font-display text-2xl font-bold">The Neighbourhood Bookstand</span>
        </div>

        <div className="bg-card border rounded-3xl p-8 shadow-sm">
          <h2 className="font-display text-2xl font-bold mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === 'login' ? 'Sign in to your bookstand' : 'Start your reading journey'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Your name" value={form.displayName} onChange={set('displayName')} className="pl-10 h-11 rounded-xl" />
                  </div>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="username (e.g. alex_reads)" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))} className="pl-10 h-11 rounded-xl" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder="Email" value={form.email} onChange={set('email')} className="pl-10 h-11 rounded-xl" required />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="password" placeholder="Password" value={form.password} onChange={set('password')} className="pl-10 h-11 rounded-xl" required minLength={6} />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            {message && <div className="text-sm bg-accent/10 text-accent rounded-xl px-3 py-2">{message}</div>}

            <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'login' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(''); setMessage('') }} className="text-accent font-medium hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
