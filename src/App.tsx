import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Home } from '@/pages/Home'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'
import { SettingsPage } from '@/features/profile/pages/SettingsPage'
import { WorkshopPage } from '@/features/planner/pages/WorkshopPage'
import { ProjectNewPage } from '@/features/planner/pages/ProjectNewPage'
import { ProjectPage } from '@/features/planner/pages/ProjectPage'
import { ProjectEditPage } from '@/features/planner/pages/ProjectEditPage'
import { CostumeNewPage } from '@/features/planner/pages/CostumeNewPage'
import { CostumePage } from '@/features/planner/pages/CostumePage'
import { PropNewPage } from '@/features/planner/pages/PropNewPage'
import { PropPage } from '@/features/planner/pages/PropPage'
import { FriendsPage } from '@/features/social/pages/FriendsPage'
import { FindUsersPage } from '@/features/social/pages/FindUsersPage'
import { UsersPage } from '@/features/social/pages/UsersPage'
import { CirclesPage } from '@/features/social/pages/CirclesPage'
import { CircleNewPage } from '@/features/social/pages/CircleNewPage'
import { CirclePage } from '@/features/social/pages/CirclePage'
import { CircleSettingsPage } from '@/features/social/pages/CircleSettingsPage'
import { CircleJoinPage } from '@/features/social/pages/CircleJoinPage'
import { NotFound } from '@/pages/NotFound'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

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
        <ErrorBoundary>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />

            <Route path="/planner" element={<WorkshopPage />} />
            <Route path="/planner/new" element={<ProjectNewPage />} />
            <Route path="/planner/project/:id" element={<ProjectPage />} />
            <Route path="/planner/project/:id/edit" element={<ProjectEditPage />} />
            <Route path="/planner/costume/new" element={<CostumeNewPage />} />
            <Route path="/planner/costume/:id" element={<CostumePage />} />
            <Route path="/planner/prop/new" element={<PropNewPage />} />
            <Route path="/planner/prop/:id" element={<PropPage />} />
            <Route path="/social/users" element={<UsersPage />} />
            <Route path="/social" element={<FriendsPage />} />
            <Route path="/social/friends" element={<FriendsPage />} />
            <Route path="/social/friends/find" element={<FindUsersPage />} />
            <Route path="/social/circles" element={<CirclesPage />} />
            <Route path="/social/circles/new" element={<CircleNewPage />} />
            <Route path="/social/circles/join/:code" element={<CircleJoinPage />} />
            <Route path="/social/circles/:id" element={<CirclePage />} />
            <Route path="/social/circles/:id/settings" element={<CircleSettingsPage />} />
            <Route path="/gallery" element={<div>Галерея (в разработке)</div>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/settings" element={<SettingsPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}
