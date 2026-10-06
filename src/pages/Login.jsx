import { useState } from 'react'
import { login, register, errorMessage } from '../api.js'
import Logo from '../components/Logo.jsx'

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'register') {
        await register(form)
        setNotice('Account created. Please log in.')
        setMode('login')
        setForm({ ...form, password: '' })
      } else {
        const data = await login(form.username, form.password)
        onLogin({ user: data.user, tokens: data.tokens })
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setNotice('')
  }

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <div className="brand">
          <Logo size={36} />
          <span>Product Management</span>
        </div>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">
          {mode === 'login' ? 'Log in to manage your product inventory.' : 'Register to start managing products.'}
        </p>

        {notice && <div className="alert ok" role="status">{notice}</div>}
        {error && <div className="alert err" role="alert">{error}</div>}

        <form onSubmit={submit} noValidate>
          <label>
            {mode === 'login' ? 'Username or email' : 'Username'}
            <input
              value={form.username}
              onChange={set('username')}
              autoComplete="username"
              placeholder={mode === 'login' ? 'admin' : 'choose a username'}
              required
            />
          </label>

          {mode === 'register' && (
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </label>
          )}

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              required
            />
          </label>

          <button className="btn primary block" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="switch">
          {mode === 'login' ? "Don't have an account?" : 'Already registered?'}{' '}
          <button type="button" className="link" onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </section>
    </main>
  )
}
