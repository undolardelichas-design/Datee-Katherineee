import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Gate from './components/Gate'
import NavBar from './components/NavBar'
import WelcomeScreen from './pages/WelcomeScreen'
import Planner from './pages/Planner'
import NewDate from './pages/NewDate'
import Gallery from './pages/Gallery'
import DateDetail from './pages/DateDetail'
import { isUnlocked } from './services/auth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const unlocked = isUnlocked()
  const location = useLocation()
  if (!unlocked) return <Navigate to="/gate" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

export default function App() {
  const [, force] = useState(0)
  const location = useLocation()
  const esWelcome = location.pathname === '/'
  const esGate = location.pathname === '/gate'

  useEffect(() => {
    const onStorage = () => force((n) => n + 1)
    window.addEventListener('focus', onStorage)
    return () => window.removeEventListener('focus', onStorage)
  }, [])

  return (
    <>
      {/* En Welcome el header aparece al terminar la animación (lo renderiza la propia vista) */}
      {!esWelcome && !esGate && <NavBar />}

      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <WelcomeScreen />
            </RequireAuth>
          }
        />
        <Route path="/gate" element={<Gate />} />
        <Route
          path="/planner"
          element={
            <RequireAuth>
              <Planner />
            </RequireAuth>
          }
        />
        <Route
          path="/nuevo"
          element={
            <RequireAuth>
              <NewDate />
            </RequireAuth>
          }
        />
        <Route
          path="/date/:id"
          element={
            <RequireAuth>
              <DateDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/gallery"
          element={
            <RequireAuth>
              <Gallery />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
