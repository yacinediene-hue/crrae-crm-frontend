import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import API from './api'
import './App.css'

// Login
function Login({ onLogin }) {
  const [email, setEmail] = useState('admin@crrae-umoa.org')
  const [password, setPassword] = useState('crrae2026')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      onLogin()
    } catch {
      setError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <h1 style={styles.loginTitle}>🏦 CRRAE-UMOA CRM</h1>
        <p style={styles.loginSubtitle}>Connectez-vous à votre espace</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" />
          <button style={styles.button} type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  )
}

// Dashboard
function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, tickets: 0 })

  useEffect(() => {
    Promise.all([
      API.get('/contacts'),
      API.get('/deals'),
      API.get('/tickets'),
    ]).then(([c, d, t]) => {
      setStats({ contacts: c.data.length, deals: d.data.length, tickets: t.data.length })
    }).catch(() => {})
  }, [])

  return (
    <div>
      <h2 style={styles.pageTitle}>📊 Dashboard</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><h3>👥 Contacts</h3><p style={styles.statNum}>{stats.contacts}</p></div>
        <div style={styles.statCard}><h3>💼 Deals</h3><p style={styles.statNum}>{stats.deals}</p></div>
        <div style={styles.statCard}><h3>🎫 Tickets</h3><p style={styles.statNum}>{stats.tickets}</p></div>
      </div>
    </div>
  )
}

// Contacts
function Contacts() {
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { API.get('/contacts').then(r => setContacts(r.data)).catch(() => {}) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/contacts', form)
      setContacts([...contacts, res.data])
      setForm({ name: '', email: '', phone: '', company: '' })
      setShowForm(false)
    } catch {}
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👥 Contacts</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={styles.input} placeholder="Téléphone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input style={styles.input} placeholder="Entreprise" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead><tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Entreprise</th><th>Statut</th></tr></thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.company}</td>
              <td><span style={styles.badge}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Layout
function Layout({ onLogout, children }) {
  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <h2 style={styles.navTitle}>🏦 CRRAE CRM</h2>
        <Link style={styles.navLink} to="/dashboard">📊 Dashboard</Link>
        <Link style={styles.navLink} to="/contacts">👥 Contacts</Link>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Déconnexion</button>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

// App
export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'))

  const logout = () => { localStorage.removeItem('token'); setAuth(false) }

  if (!auth) return <Login onLogin={() => setAuth(true)} />

  return (
    <BrowserRouter>
      <Layout onLogout={logout}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

const styles = {
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  loginBox: { background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '360px' },
  loginTitle: { textAlign: 'center', color: '#1a365d', marginBottom: '0.5rem' },
  loginSubtitle: { textAlign: 'center', color: '#666', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
  layout: { display: 'flex', minHeight: '100vh' },
  nav: { width: '220px', background: '#1a365d', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navTitle: { color: 'white', marginBottom: '1rem', fontSize: '1rem' },
  navLink: { color: '#bee3f8', textDecoration: 'none', padding: '0.5rem', borderRadius: '6px', display: 'block' },
  logoutBtn: { marginTop: 'auto', background: 'transparent', color: '#fc8181', border: '1px solid #fc8181', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  main: { flex: 1, padding: '2rem', background: '#f7fafc' },
  pageTitle: { color: '#1a365d', marginBottom: '1.5rem' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNum: { fontSize: '2.5rem', fontWeight: 'bold', color: '#2b6cb0' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden' },
  form: { background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' },
  badge: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' },
}