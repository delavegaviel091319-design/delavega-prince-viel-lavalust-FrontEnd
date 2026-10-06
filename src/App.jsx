import { useEffect, useState, useCallback } from 'react'
import { loadAuth, saveAuth, clearAuth, logout as apiLogout } from './api.js'
import Login from './pages/Login.jsx'
import Products from './pages/Products.jsx'

export default function App() {
  const [auth, setAuth] = useState(() => loadAuth())

  const handleLogin = (data) => {
    saveAuth(data)
    setAuth(data)
  }

  const handleLogout = useCallback(async () => {
    const current = loadAuth()
    try {
      if (current?.tokens?.refresh_token) await apiLogout(current.tokens.refresh_token)
    } catch {
      /* token may already be expired - still log out locally */
    }
    clearAuth()
    setAuth(null)
  }, [])

  // The axios interceptor fires this when the session can no longer be refreshed
  useEffect(() => {
    const onForcedLogout = () => setAuth(null)
    window.addEventListener('pm:logout', onForcedLogout)
    return () => window.removeEventListener('pm:logout', onForcedLogout)
  }, [])

  return auth?.tokens?.access_token ? (
    <Products user={auth.user} onLogout={handleLogout} />
  ) : (
    <Login onLogin={handleLogin} />
  )
}
