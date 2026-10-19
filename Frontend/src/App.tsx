import { useEffect, useState } from 'react'
import { accessToken, initializeAuth, keycloak } from './auth'
import './App.css'

type Approval = 'checking' | 'pending' | 'approved' | 'error'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [authenticated, setAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [approval, setApproval] = useState<Approval>('checking')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    let active = true
    initializeAuth()
      .then((signedIn) => {
        if (active) {
          setAuthenticated(signedIn)
          setAuthReady(true)
        }
      })
      .catch(() => {
        if (active) {
          setAuthError('Could not connect to Keycloak. Check the realm and client settings.')
          setAuthReady(true)
        }
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (path !== '/dashboard' || !authenticated) return
    const controller = new AbortController()

    const loadProfile = async () => {
      try {
        const token = await accessToken()
        const response = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        const profile: { username: string; approval: 'pending' | 'approved' } = await response.json()
        if (!controller.signal.aborted) {
          setUsername(profile.username)
          setApproval(profile.approval)
        }
      } catch {
        if (!controller.signal.aborted) setApproval('error')
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [path, authenticated])

  const navigate = (nextPath: '/' | '/login' | '/dashboard') => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const login = () => void keycloak.login({ redirectUri: `${window.location.origin}/dashboard` })
  const register = () => void keycloak.register({ redirectUri: `${window.location.origin}/dashboard` })
  const logout = () => void keycloak.logout({ redirectUri: window.location.origin })

  if (!authReady) return <main className="auth-page"><p role="status">Checking sign-in…</p></main>

  if (path === '/login' || (path === '/dashboard' && !authenticated)) {
    return <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>MicroSift</a>
        <h1 id="login-heading">Log in</h1>
        <p>Sign in through Keycloak to access MicroSift.</p>
        {authError && <p className="form-error" role="alert">{authError}</p>}
        <button type="button" onClick={login} disabled={!!authError}>Continue with Keycloak</button>
        <button type="button" onClick={register} disabled={!!authError}>Create account</button>
      </section>
    </main>
  }

  if (path === '/dashboard') {
    return <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>MicroSift</a>
        <nav aria-label="Dashboard navigation"><span className="active-nav">Dashboard</span><span>Workspace</span></nav>
        <button type="button" onClick={logout}>Log out</button>
      </aside>
      <section className="dashboard-content">
        <header><p className="eyebrow">OVERVIEW</p><h1>Dashboard</h1></header>
        {approval === 'checking' && <p role="status">Checking approval…</p>}
        {approval === 'pending' && <p role="status">Email verified. Awaiting admin approval.</p>}
        {approval === 'error' && <p role="alert">Could not verify access. Try signing in again.</p>}
        {approval === 'approved' && <>
          <p role="status">Signed in as {username}. API connected.</p>
          <div className="empty-grid">
            <section className="empty-panel"><p>No data yet.</p></section>
            <section className="empty-panel"><p>No data yet.</p></section>
            <section className="empty-panel empty-panel-wide"><p>No data yet.</p></section>
          </div>
        </>}
      </section>
    </main>
  }

  return <main className="home-page">
    <nav><span className="brand">MicroSift</span><a href="/login" onClick={(event) => { event.preventDefault(); navigate('/login') }}>Log in</a></nav>
    <section className="home-content">
      <p className="eyebrow">TRADE WITH CLARITY</p>
      <h1>MicroSift</h1>
      <p className="intro">A focused workspace for the decisions that matter.</p>
      <a className="primary-link" href="/login" onClick={(event) => { event.preventDefault(); navigate('/login') }}>Log in</a>
    </section>
  </main>
}

export default App
