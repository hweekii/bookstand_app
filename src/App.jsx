import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import AppLayout from '@/components/layout/AppLayout'
import AuthPage from '@/pages/AuthPage'
import Explore from '@/pages/Explore'
import LogBook from '@/pages/LogBook'
import Bookstand from '@/pages/Bookstand'
import Friends from '@/pages/Friends'
import BookDNA from '@/pages/BookDNA'
import FriendBookstand from '@/pages/FriendBookstand'
import Settings from '@/pages/Settings'

const queryClient = new QueryClient()

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-secondary border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/bookstand" replace />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/log" element={<LogBook />} />
        <Route path="/bookstand" element={<Bookstand />} />
        <Route path="/bookstand/:id" element={<FriendBookstand />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/book-dna" element={<BookDNA />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppRoutes />
        </Router>
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
