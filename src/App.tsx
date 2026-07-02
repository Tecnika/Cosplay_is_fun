import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { NotFound } from '@/pages/NotFound'

/** Восстанавливает маршрут после 404.html редиректа GitHub Pages */
function RedirectHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      const path = redirect.replace('/Cosplay_is_fun', '') || '/'
      navigate(path, { replace: true })
    }
  }, [navigate])
  return null
}

export function App() {
  return (
    <BrowserRouter basename="/Cosplay_is_fun">
      <RedirectHandler />
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            <Route path="/planner" element={<div>Планировщик (в разработке)</div>} />
            <Route path="/social" element={<div>Лента (в разработке)</div>} />
            <Route path="/gallery" element={<div>Галерея (в разработке)</div>} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
