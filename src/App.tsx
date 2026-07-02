import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { Auth } from '@/pages/Auth'
import { NotFound } from '@/pages/NotFound'

/**
 * Корневой компонент приложения.
 * Настраивает роутинг и оборачивает страницы в Layout.
 *
 * Каждый модуль (features/*) будет добавлять свои маршруты
 * через отдельные роутер-файлы для изоляции кода.
 */

export function App() {
  return (
    <BrowserRouter basename="/Cosplay_is_fun">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />

          {/* Плейсхолдеры для модулей — будут реализованы в своих ветках */}
          <Route path="/planner" element={<div>Планировщик (в разработке)</div>} />
          <Route path="/social" element={<div>Лента (в разработке)</div>} />
          <Route path="/gallery" element={<div>Галерея (в разработке)</div>} />
          <Route path="/profile" element={<div>Профиль (в разработке)</div>} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
