import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

const demoEmail = 'test@test.com'
const demoPassword = '12345'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (nextPath: '/' | '/login' | '/dashboard') => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email === demoEmail && password === demoPassword) {
      setError('')
      navigate('/dashboard')
      return
    }
    setError('Invalid email or password.')
  }

  if (path === '/login') {
    return <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>MicroSift</a>
        <h1 id="login-heading">Log in</h1>
        <p>Use the demo account to access the app.</p>
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit">Log in</button>
        </form>
        <small>Demo: test@test.com / 12345</small>
      </section>
    </main>
  }

  if (path === '/dashboard') {
    return <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigate('/') }}>MicroSift</a>
        <nav aria-label="Dashboard navigation"><span className="active-nav">Dashboard</span><span>Workspace</span></nav>
      </aside>
      <section className="dashboard-content">
        <header><p className="eyebrow">OVERVIEW</p><h1>Dashboard</h1></header>
        <div className="empty-grid">
          <section className="empty-panel"><p>No data yet.</p></section>
          <section className="empty-panel"><p>No data yet.</p></section>
          <section className="empty-panel empty-panel-wide"><p>No data yet.</p></section>
        </div>
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
