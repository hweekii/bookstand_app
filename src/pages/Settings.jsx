import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, User, AtSign, LogOut, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const { profile, signOut, updateProfile } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Always sync from profile whenever it changes
  useEffect(() => {
    setDisplayName(profile?.display_name || '')
    setUsername(profile?.username || '')
  }, [profile?.display_name, profile?.username])

  async function handleSave() {
    if (!displayName.trim()) { setError('Name cannot be empty'); return }
    if (!username.trim()) { setError('Username cannot be empty'); return }
    if (!/^[a-z0-9_]+$/.test(username)) { setError('Username: lowercase letters, numbers and underscores only'); return }

    setSaving(true)
    setError('')
    setSuccess(false)

    // Check username uniqueness only if it changed
    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()
      if (existing) { setError('That username is already taken'); setSaving(false); return }
    }

    const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const { error: err } = await updateProfile({ display_name: displayName, username, initials })

    if (err) setError(err.message)
    else setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-accent/10">
            <SettingsIcon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your profile</p>
          </div>
        </div>

        {/* Avatar preview */}
        <div className="bg-card border rounded-3xl p-6 mb-4 flex items-center gap-5">
          <Avatar className="h-20 w-20 bg-primary">
            <AvatarFallback className="text-2xl font-display font-bold bg-primary text-primary-foreground">
              {profile?.initials || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display font-bold text-lg">{profile?.display_name || '—'}</p>
            <p className="text-sm text-muted-foreground">@{profile?.username || '—'}</p>
          </div>
        </div>

        {/* Edit profile */}
        <div className="bg-card border rounded-3xl p-6 mb-4 space-y-4">
          <h2 className="font-display text-lg font-bold">Edit Profile</h2>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Display name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 h-11 rounded-xl"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Username</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="pl-10 h-11 rounded-xl"
                placeholder="your_username"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 ml-1">Friends can find you by this username</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-xl px-3 py-2">
              <CheckCircle className="w-4 h-4 shrink-0" />Profile updated!
            </div>
          )}

          <Button className="w-full h-11 rounded-xl" onClick={handleSave} disabled={saving}>
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Save className="w-4 h-4 mr-2" />Save changes</>
            }
          </Button>
        </div>

        {/* Sign out */}
        <div className="bg-card border rounded-3xl p-6">
          <h2 className="font-display text-lg font-bold mb-1">Account</h2>
          <p className="text-sm text-muted-foreground mb-4">Sign out of your bookstand</p>
          <Button
            variant="outline"
            className="w-full h-11 rounded-xl text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />Sign out
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
