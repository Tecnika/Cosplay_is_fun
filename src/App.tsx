import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { NotFound } from '@/pages/NotFound'

export function App() {
  return (
    <BrowserRouter basename="/Cosplay_is_fun">
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            {/* Плейсхолдеры для модулей — будут реализованы в своих ветках */}
            <Route path="/planner" element={<div>Планировщик (в разработке)</div>} />
            <Route path="/social" element={<div>Лента (в разработке)</div>} />
            <Route path="/gallery" element={<div>Галерея (в разработке)</div>} />
            <Route path="/profile" element={<div>Профиль (в разработке)</div>} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
