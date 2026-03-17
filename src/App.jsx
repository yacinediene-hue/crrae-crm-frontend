
const INDICATIFS = {
  "Bénin": "+229",
  "Burkina Faso": "+226",
  "Côte d'Ivoire": "+225",
  "Guinée Bissau": "+245",
  "Mali": "+223",
  "Niger": "+227",
  "Sénégal": "+221",
  "Togo": "+228",
  "France": "+33",
}

const AGENTS = ["Koffi Stephane", "Kacou Michèle", "Kouame Faty"]
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import API from './api'
import './App.css'
import * as XLSX from 'xlsx'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
      localStorage.setItem('userName', res.data.user.name)
      localStorage.setItem('userRole', res.data.user.role)
      localStorage.setItem('userEmail', res.data.user.email)
      onLogin()
    } catch {
      setError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={{textAlign:'center', marginBottom:'1rem'}}>
          <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{width:'120px'}} />
        </div>
        <h1 style={styles.loginTitle}>CRRAE-UMOA CRM</h1>
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
function Dashboard({ alertes = [] }) {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, tickets: 0, demandes: 0 })
  const [demandes, setDemandes] = useState([])

  useEffect(() => {
    Promise.all([
      API.get('/contacts'),
      API.get('/deals'),
      API.get('/tickets'),
      API.get('/demandes'),
    ]).then(([c, d, t, dem]) => {
      setStats({ contacts: c.data.length, deals: d.data.length, tickets: t.data.length, demandes: dem.data.length })
      setDemandes(dem.data)
    }).catch(() => {})
  }, [])

  const byStatut = [
    { name: 'Traité', value: demandes.filter(d => d.statut === 'Traité').length, color: '#276749' },
    { name: 'En cours', value: demandes.filter(d => d.statut === 'En cours').length, color: '#b7791f' },
    { name: 'En attente', value: demandes.filter(d => d.statut === 'En attente').length, color: '#2b6cb0' },
  ]

  const services = ['DPM','DPR','DSI','DCR','PATRIMOINE']
  const byService = services.map(s => ({
    name: s,
    total: demandes.filter(d => d.service === s).length,
    traite: demandes.filter(d => d.service === s && d.statut === 'Traité').length,
  })).filter(s => s.total > 0)

  const canaux = ['WhatsApp','Email','Appel','Courrier']
  const byCanal = canaux.map(c => ({
    name: c,
    value: demandes.filter(d => d.canal === c).length,
  })).filter(c => c.value > 0)

  const COLORS = ['#2b6cb0','#276749','#b7791f','#6b46c1','#c53030']

  return (
    <div>
      <h2 style={styles.pageTitle}>📊 Dashboard</h2>
      {alertes && alertes.length > 0 && (
        <div style={{background:'#fff5f5', border:'1px solid #feb2b2', borderRadius:'12px', padding:'1.25rem', marginBottom:'1.5rem'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
            <strong style={{color:'#c53030', fontSize:'1rem'}}>⚠️ {alertes.length} dossier{alertes.length > 1 ? 's' : ''} hors délai</strong>
            <Link to="/demandes" style={{background:'#c53030', color:'white', padding:'0.4rem 0.9rem', borderRadius:'6px', fontSize:'0.82rem', textDecoration:'none', fontWeight:'600'}}>
              Voir tous →
            </Link>
          </div>
          <div style={{display:'grid', gap:'0.5rem'}}>
            {alertes.slice(0,5).map(d => (
              <div key={d.id} style={{background:'white', borderRadius:'8px', padding:'0.65rem 1rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #fed7d7'}}>
                <div>
                  <span style={{fontWeight:'700', color:'#c53030', fontSize:'0.85rem'}}>{d.numDemande}</span>
                  <span style={{color:'#4a5568', fontSize:'0.85rem', margin:'0 0.5rem'}}>—</span>
                  <span style={{color:'#2d3748', fontSize:'0.85rem'}}>{d.nomPrenom}</span>
                </div>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                  <span style={{background:'#faf5ff', color:'#6b46c1', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem'}}>{d.service || '?'}</span>
                  <span style={{background:'#fff5f5', color:'#c53030', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem'}}>
                    {d.dateReception ? Math.ceil((new Date() - new Date(d.dateReception)) / (1000*60*60*24)) : '?'}j
                  </span>
                </div>
              </div>
            ))}
            {alertes.length > 5 && (
              <div style={{textAlign:'center', color:'#c53030', fontSize:'0.85rem', padding:'0.5rem'}}>
                ... et {alertes.length - 5} autres dossiers en retard
              </div>
            )}
          </div>
        </div>
      )}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><h3>👥 Contacts</h3><p style={styles.statNum}>{stats.contacts}</p></div>
        <div style={styles.statCard}><h3>💼 Deals</h3><p style={styles.statNum}>{stats.deals}</p></div>
        <div style={styles.statCard}><h3>🎫 Tickets</h3><p style={styles.statNum}>{stats.tickets}</p></div>
        <div style={styles.statCard}><h3>📋 Demandes</h3><p style={styles.statNum}>{stats.demandes}</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1a365d', marginBottom: '1rem', fontSize: '1rem' }}>📋 Demandes par statut</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatut} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                {byStatut.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1a365d', marginBottom: '1rem', fontSize: '1rem' }}>🏢 Demandes par service</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byService}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total" fill="#2b6cb0" />
              <Bar dataKey="traite" name="Traité" fill="#276749" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1a365d', marginBottom: '1rem', fontSize: '1rem' }}>📱 Demandes par canal</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCanal} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                {byCanal.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ color: '#1a365d', marginBottom: '1rem', fontSize: '1rem' }}>⏱️ Respect des délais</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={[
                { name: 'OUI', value: demandes.filter(d => d.respectDelai === 'OUI').length, color: '#276749' },
                { name: 'NON', value: demandes.filter(d => d.respectDelai === 'NON').length, color: '#c53030' },
              ]} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value}) => `${name}: ${value}`}>
                <Cell fill="#276749" />
                <Cell fill="#c53030" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}


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
        <thead><tr><th style={styles.th}>Nom</th><th style={styles.th}>Email</th><th style={styles.th}>Téléphone</th><th style={styles.th}>Entreprise</th><th style={styles.th}>Statut</th></tr></thead>
        <tbody>
          {contacts.map(c => (
            <tr key={c.id} style={styles.tr}>
              <td style={styles.td}>{c.name}</td>
              <td style={styles.td}>{c.email}</td>
              <td style={styles.td}>{c.phone}</td>
              <td style={styles.td}>{c.company}</td>
              <td style={styles.td}><span style={styles.badge}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Deals
function Deals() {
  const [deals, setDeals] = useState([])
  const [form, setForm] = useState({ title: '', amount: '', status: 'open', contactId: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { API.get('/deals').then(r => setDeals(r.data)).catch(() => {}) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/deals', { ...form, amount: parseFloat(form.amount) })
      setDeals([...deals, res.data])
      setForm({ title: '', amount: '', status: 'open', contactId: '' })
      setShowForm(false)
    } catch {}
  }

  const statusColor = (status) => {
    const map = {
      open: { background: '#ebf8ff', color: '#2b6cb0' },
      won: { background: '#f0fff4', color: '#276749' },
      lost: { background: '#fff5f5', color: '#c53030' },
      pending: { background: '#fffbeb', color: '#b7791f' },
    }
    return map[status] || map.open
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>💼 Deals</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Titre du deal" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input style={styles.input} placeholder="Montant (FCFA)" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="open">Ouvert</option>
            <option value="pending">En cours</option>
            <option value="won">Gagné</option>
            <option value="lost">Perdu</option>
          </select>
          <input style={styles.input} placeholder="ID Contact (optionnel)" value={form.contactId} onChange={e => setForm({...form, contactId: e.target.value})} />
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Titre</th>
            <th style={styles.th}>Montant</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {deals.map(d => (
            <tr key={d.id} style={styles.tr}>
              <td style={styles.td}>{d.title}</td>
              <td style={styles.td}>{d.amount ? `${Number(d.amount).toLocaleString('fr-FR')} FCFA` : '—'}</td>
              <td style={styles.td}><span style={{...styles.badge, ...statusColor(d.status)}}>{d.status}</span></td>
              <td style={styles.td}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Tickets
function Tickets() {
  const [tickets, setTickets] = useState([])
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium', status: 'open' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { API.get('/tickets').then(r => setTickets(r.data)).catch(() => {}) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/tickets', form)
      setTickets([...tickets, res.data])
      setForm({ subject: '', description: '', priority: 'medium', status: 'open' })
      setShowForm(false)
    } catch {}
  }

  const priorityColor = (priority) => {
    const map = {
      low: { background: '#f0fff4', color: '#276749' },
      medium: { background: '#fffbeb', color: '#b7791f' },
      high: { background: '#fff5f5', color: '#c53030' },
    }
    return map[priority] || map.medium
  }

  const statusColor = (status) => {
    const map = {
      open: { background: '#ebf8ff', color: '#2b6cb0' },
      in_progress: { background: '#faf5ff', color: '#6b46c1' },
      closed: { background: '#f7fafc', color: '#718096' },
    }
    return map[status] || map.open
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🎫 Tickets</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Sujet" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
          <textarea style={{...styles.input, height: '80px', resize: 'vertical'}} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <select style={styles.input} value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option value="low">Priorité basse</option>
            <option value="medium">Priorité moyenne</option>
            <option value="high">Priorité haute</option>
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="closed">Fermé</option>
          </select>
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Sujet</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Priorité</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id} style={styles.tr}>
              <td style={styles.td}>{t.subject}</td>
              <td style={styles.td}>{t.description ? t.description.substring(0, 50) + (t.description.length > 50 ? '...' : '') : '—'}</td>
              <td style={styles.td}><span style={{...styles.badge, ...priorityColor(t.priority)}}>{t.priority}</span></td>
              <td style={styles.td}><span style={{...styles.badge, ...statusColor(t.status)}}>{t.status}</span></td>
              <td style={styles.td}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('fr-FR') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Campagnes
function Campagnes() {
  const [campagnes, setCampagnes] = useState([])
  const [form, setForm] = useState({ name: '', type: 'email', status: 'draft', startDate: '', endDate: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { API.get('/campaigns').then(r => setCampagnes(r.data)).catch(() => {}) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/campaigns', form)
      setCampagnes([...campagnes, res.data])
      setForm({ name: '', type: 'email', status: 'draft', startDate: '', endDate: '' })
      setShowForm(false)
    } catch {}
  }

  const statusColor = (status) => {
    const map = {
      draft: { background: '#f7fafc', color: '#718096' },
      active: { background: '#f0fff4', color: '#276749' },
      paused: { background: '#fffbeb', color: '#b7791f' },
      completed: { background: '#ebf8ff', color: '#2b6cb0' },
    }
    return map[status] || map.draft
  }

  const typeColor = (type) => {
    const map = {
      email: { background: '#ebf8ff', color: '#2b6cb0' },
      sms: { background: '#faf5ff', color: '#6b46c1' },
      social: { background: '#f0fff4', color: '#276749' },
    }
    return map[type] || map.email
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📣 Campagnes</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Nom de la campagne" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <select style={styles.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="social">Réseaux sociaux</option>
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="draft">Brouillon</option>
            <option value="active">Active</option>
            <option value="paused">En pause</option>
            <option value="completed">Terminée</option>
          </select>
          <input style={styles.input} type="date" placeholder="Date de début" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
          <input style={styles.input} type="date" placeholder="Date de fin" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Type</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Début</th>
            <th style={styles.th}>Fin</th>
          </tr>
        </thead>
        <tbody>
          {campagnes.map(c => (
            <tr key={c.id} style={styles.tr}>
              <td style={styles.td}>{c.name}</td>
              <td style={styles.td}><span style={{...styles.badge, ...typeColor(c.type)}}>{c.type}</span></td>
              <td style={styles.td}><span style={{...styles.badge, ...statusColor(c.status)}}>{c.status}</span></td>
              <td style={styles.td}>{c.startDate ? new Date(c.startDate).toLocaleDateString('fr-FR') : '—'}</td>
              <td style={styles.td}>{c.endDate ? new Date(c.endDate).toLocaleDateString('fr-FR') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}




function FicheClient({ telephone, matricule, onClose }) {
  const [client, setClient] = useState(null)
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/demandes').then(r => {
      const all = r.data
      const filtered = all.filter(d =>
        (telephone && telephone.length >= 6 && d.telephone && d.telephone.replace(/[^0-9]/g,'').includes(telephone.replace(/[^0-9]/g,''))) ||
        (matricule && matricule.length >= 4 && d.matricule && d.matricule === matricule)
      )
      if (filtered.length > 0) {
        const last = filtered[0]
        setClient({ nomPrenom: last.nomPrenom, telephone: last.telephone, email: last.email, pays: last.pays, typeClient: last.typeClient, adherent: last.adherent, matricule: last.matricule })
        setDemandes(filtered)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [telephone, matricule])

  if (loading) return (
    <div style={{background:'#ebf8ff', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1rem', color:'#2b6cb0', fontSize:'0.9rem'}}>
      🔍 Recherche du profil client...
    </div>
  )

  if (!client) return null

  const notes = demandes.filter(d => d.noteSatisfaction).map(d => d.noteSatisfaction)
  const moyNote = notes.length > 0 ? (notes.reduce((a,b) => a+b, 0) / notes.length).toFixed(1) : null

  return (
    <div style={{background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:'12px', padding:'1rem', marginBottom:'1.5rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem'}}>
            <span style={{fontSize:'1.1rem', fontWeight:'700', color:'#276749'}}>👤 {client.nomPrenom}</span>
            <span style={{background:'#276749', color:'white', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem'}}>{client.typeClient}</span>
            {client.adherent && <span style={{background:'#ebf8ff', color:'#2b6cb0', padding:'0.15rem 0.5rem', borderRadius:'20px', fontSize:'0.75rem'}}>{client.adherent}</span>}
          </div>
          <div style={{fontSize:'0.85rem', color:'#4a5568', display:'flex', gap:'1rem', flexWrap:'wrap'}}>
            {client.telephone && <span>📞 {client.telephone}</span>}
            {client.email && <span>📧 {client.email}</span>}
            {client.pays && <span>🌍 {client.pays}</span>}
            {client.matricule && <span>🪪 {client.matricule}</span>}
          </div>
        </div>
        <div style={{display:'flex', gap:'0.5rem', textAlign:'center', flexShrink:0}}>
          <div style={{background:'white', borderRadius:'8px', padding:'0.5rem 0.75rem'}}>
            <div style={{fontSize:'1.3rem', fontWeight:'bold', color:'#2b6cb0'}}>{demandes.length}</div>
            <div style={{fontSize:'0.7rem', color:'#718096'}}>demandes</div>
          </div>
          <div style={{background:'white', borderRadius:'8px', padding:'0.5rem 0.75rem'}}>
            <div style={{fontSize:'1.3rem', fontWeight:'bold', color:'#276749'}}>{demandes.filter(d=>d.statut==='Traité').length}</div>
            <div style={{fontSize:'0.7rem', color:'#718096'}}>traitées</div>
          </div>
          {moyNote && (
            <div style={{background:'white', borderRadius:'8px', padding:'0.5rem 0.75rem'}}>
              <div style={{fontSize:'1.3rem', fontWeight:'bold', color:'#b7791f'}}>⭐{moyNote}</div>
              <div style={{fontSize:'0.7rem', color:'#718096'}}>note moy.</div>
            </div>
          )}
        </div>
      </div>
      {demandes.length > 0 && (
        <div style={{marginTop:'0.75rem', borderTop:'1px solid #9ae6b4', paddingTop:'0.75rem'}}>
          <div style={{fontSize:'0.8rem', color:'#276749', fontWeight:'600', marginBottom:'0.5rem'}}>DERNIÈRES DEMANDES</div>
          <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
            {demandes.slice(0,3).map(d => (
              <div key={d.id} style={{background:'white', borderRadius:'6px', padding:'0.5rem 0.75rem', display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}>
                <span style={{color:'#2b6cb0', fontWeight:'600'}}>{d.numDemande}</span>
                <span style={{color:'#4a5568'}}>{d.objetDemande}</span>
                <span style={{color:'#718096'}}>{d.dateReception ? new Date(d.dateReception).toLocaleDateString('fr-FR') : ''}</span>
                <span style={{background: d.statut==='Traité'?'#f0fff4':'#fffbeb', color: d.statut==='Traité'?'#276749':'#b7791f', padding:'0.1rem 0.4rem', borderRadius:'20px'}}>{d.statut}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function PanneauCommentaires({ demande, onClose }) {
  const [onglet, setOnglet] = useState('notes')
  const [timeline, setTimeline] = useState([])

  useEffect(() => {
    if (demande) {
      API.get(`/timeline/demande/${demande.id}`)
        .then(r => setTimeline(r.data))
        .catch(() => {})
    }
  }, [demande])

  const actionIcons = {
    'Création': '✅',
    'Modification': '✏️',
    'Statut': '🔄',
    'Note': '💬',
  }
  const [commentaires, setCommentaires] = useState([])
  const [texte, setTexte] = useState('')
  const auteur = localStorage.getItem('userName') || 'Agent'

  useEffect(() => {
    if (demande) {
      API.get(`/commentaires/demande/${demande.id}`)
        .then(r => setCommentaires(r.data))
        .catch(() => {})
    }
  }, [demande])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!texte.trim()) return
    try {
      const res = await API.post('/commentaires', {
        demandeId: demande.id,
        auteur,
        contenu: texte,
      })
      setCommentaires([...commentaires, res.data])
      setTexte('')
    } catch {}
  }

  const handleDelete = async (id) => {
    try {
      await API.delete(`/commentaires/${id}`)
      setCommentaires(commentaires.filter(c => c.id !== id))
    } catch {}
  }

  if (!demande) return null

  return (
    <>
    <div onClick={onClose} style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.5)', zIndex:9998}} />
    <div style={{position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'500px', maxHeight:'80vh', background:'white', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', zIndex:9999, display:'flex', flexDirection:'column', borderRadius:'12px', overflow:'hidden'}}>
      <div style={{background:'#1e4a7a', padding:'1.25rem', color:'white', flexShrink:0}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h3 style={{margin:0, fontSize:'1rem'}}>📋 {demande.numDemande}</h3>
            <div style={{opacity:0.8, fontSize:'0.8rem', marginTop:'0.25rem'}}>{demande.nomPrenom}</div>
          </div>
          <button onClick={onClose} style={{background:'transparent', border:'none', color:'white', fontSize:'1.5rem', cursor:'pointer'}}>✕</button>
        </div>
        <div style={{display:'flex', gap:'0.5rem', marginTop:'1rem'}}>
          {['notes','timeline'].map(o => (
            <button key={o} onClick={() => setOnglet(o)}
              style={{padding:'0.4rem 1rem', borderRadius:'6px', border:'none', cursor:'pointer', fontSize:'0.85rem',
                background: onglet === o ? 'white' : 'rgba(255,255,255,0.2)',
                color: onglet === o ? '#1e4a7a' : 'white', fontWeight: onglet === o ? '600' : '400'}}>
              {o === 'notes' ? '💬 Notes' : '📅 Timeline'}
            </button>
          ))}
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', padding:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem'}}>
        {commentaires.length === 0 && (
          <div style={{textAlign:'center', color:'#718096', padding:'2rem', fontSize:'0.9rem'}}>
            Aucune note — ajoutez la première !
          </div>
        )}
        {commentaires.map(c => (
          <div key={c.id} style={{background:'#fffbeb', border:'1px solid #fbd38d', borderRadius:'8px', padding:'0.75rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem'}}>
              <span style={{fontWeight:'600', color:'#b7791f', fontSize:'0.85rem'}}>👤 {c.auteur}</span>
              <div style={{display:'flex', alignItems:'center', gap:'0.5rem'}}>
                <span style={{color:'#718096', fontSize:'0.75rem'}}>{new Date(c.createdAt).toLocaleString('fr-FR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'})}</span>
                <button onClick={() => handleDelete(c.id)} style={{background:'transparent', border:'none', color:'#c53030', cursor:'pointer', fontSize:'0.8rem', padding:'0'}}>🗑️</button>
              </div>
            </div>
            <div style={{color:'#2d3748', fontSize:'0.9rem', lineHeight:'1.5'}}>{c.contenu}</div>
          </div>
        ))}
      </div>

      {onglet === 'timeline' && (
        <div style={{flex:1, overflowY:'auto', padding:'1rem'}}>
          {timeline.length === 0 && (
            <div style={{textAlign:'center', color:'#718096', padding:'2rem', fontSize:'0.9rem'}}>Aucun événement</div>
          )}
          <div style={{position:'relative'}}>
            <div style={{position:'absolute', left:'16px', top:0, bottom:0, width:'2px', background:'#e2e8f0'}}/>
            {timeline.map((t, i) => (
              <div key={t.id} style={{display:'flex', gap:'0.75rem', marginBottom:'1rem', position:'relative'}}>
                <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#ebf8ff', border:'2px solid #2b6cb0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, zIndex:1, fontSize:'0.9rem'}}>
                  {actionIcons[t.action] || '📌'}
                </div>
                <div style={{background:'white', border:'1px solid #e2e8f0', borderRadius:'8px', padding:'0.6rem 0.8rem', flex:1}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{fontWeight:'600', color:'#2d3748', fontSize:'0.85rem'}}>{t.action}</span>
                    <span style={{color:'#718096', fontSize:'0.75rem'}}>{new Date(t.createdAt).toLocaleString('fr-FR', {day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div style={{color:'#4a5568', fontSize:'0.82rem', marginTop:'0.2rem'}}>{t.detail}</div>
                  <div style={{color:'#718096', fontSize:'0.75rem', marginTop:'0.2rem'}}>par {t.auteur}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {onglet === 'notes' && <form onSubmit={handleAdd} style={{padding:'1rem', borderTop:'1px solid #e2e8f0', flexShrink:0}}>
        <textarea
          style={{width:'100%', padding:'0.75rem', border:'1px solid #ddd', borderRadius:'8px', fontSize:'0.9rem', resize:'none', height:'80px', boxSizing:'border-box'}}
          placeholder="Ajouter une note interne..."
          value={texte}
          onChange={e => setTexte(e.target.value)}
        />
        <button style={{...styles.button, marginTop:'0.5rem'}} type="submit">💾 Ajouter la note</button>
      </form>}
    </div>
    </>
  )
}

function Demandes({ onOpenCommentaires }) {
  const [demandes, setDemandes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const emptyForm = {
    nomPrenom: '', matricule: '', adherent: '', typeClient: 'Actif', pays: '',
    heureAppel: new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}), canal: 'WhatsApp', telephone: '', email: '',
    objetDemande: 'Information', commentaire: '',
    agentN1: localStorage.getItem('userName') || '', service: '', agentN2: '',
    dateReception: new Date().toISOString().split('T')[0],
    dateTraitement: '', statut: 'En cours', actionMenee: '',
    canalCommunication: 'WhatsApp', noteSatisfaction: '',
  }
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showFiche, setShowFiche] = useState(false)
  const [ficheSearch, setFicheSearch] = useState({ telephone: '', matricule: '' })
  useEffect(() => { API.get('/demandes').then(r => setDemandes(r.data)).catch(() => {}) }, [])
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        const res = await API.put(`/demandes/${editId}`, form)
        setDemandes(demandes.map(d => d.id === editId ? res.data : d))
        await API.post('/timeline', {
          demandeId: editId,
          auteur: localStorage.getItem('userName') || 'Agent',
          action: 'Modification',
          detail: `Statut: ${form.statut} — ${form.actionMenee || 'Mise à jour'}`,
        }).catch(() => {})
        setEditId(null)
      } else {
        const res = await API.post('/demandes', form)
        setDemandes([res.data, ...demandes])
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch { alert("Erreur enregistrement") }
  }

  const handleEdit = (d) => {
    setEditId(d.id)
    setForm({
      nomPrenom: d.nomPrenom || '', matricule: d.matricule || '',
      adherent: d.adherent || '', typeClient: d.typeClient || 'Actif',
      pays: d.pays || '', heureAppel: d.heureAppel || '',
      canal: d.canal || 'WhatsApp', telephone: d.telephone || '',
      email: d.email || '', objetDemande: d.objetDemande || 'Information',
      commentaire: d.commentaire || '', agentN1: d.agentN1 || '',
      service: d.service || '', agentN2: d.agentN2 || '',
      dateReception: d.dateReception ? new Date(d.dateReception).toISOString().split('T')[0] : '',
      dateTraitement: d.dateTraitement ? new Date(d.dateTraitement).toISOString().split('T')[0] : '',
      statut: d.statut || 'En cours', actionMenee: d.actionMenee || '',
      canalCommunication: d.canalCommunication || 'WhatsApp',
      noteSatisfaction: d.noteSatisfaction || '',
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return
    try {
      await API.delete(`/demandes/${id}`)
      setDemandes(demandes.filter(d => d.id !== id))
    } catch { alert("Erreur suppression") }
  }
  const f = (v) => v || '—'
  const sColor = (s) => ({'Traité': {background:'#f0fff4',color:'#276749'},'En cours': {background:'#fffbeb',color:'#b7791f'},'En attente': {background:'#ebf8ff',color:'#2b6cb0'}}[s] || {background:'#f7fafc',color:'#718096'})
  const exportExcel = () => {
    const data = filtered.map(d => ({
      'N° Demande': d.numDemande || '',
      'Date réception': d.dateReception ? new Date(d.dateReception).toLocaleDateString('fr-FR') : '',
      'Nom & Prénom': d.nomPrenom || '',
      'Matricule': d.matricule || '',
      'Adhérent': d.adherent || '',
      'Type client': d.typeClient || '',
      'Pays': d.pays || '',
      'Heure appel': d.heureAppel || '',
      'Canal': d.canal || '',
      'Téléphone': d.telephone || '',
      'Email': d.email || '',
      'Objet': d.objetDemande || '',
      'Commentaire': d.commentaire || '',
      'Agent N1': d.agentN1 || '',
      'Service': d.service || '',
      'Agent N2': d.agentN2 || '',
      'Date traitement': d.dateTraitement ? new Date(d.dateTraitement).toLocaleDateString('fr-FR') : '',
      'Statut': d.statut || '',
      'Action menée': d.actionMenee || '',
      'Délai (j)': d.delaiTraitement || '',
      'Respect délai': d.respectDelai || '',
      'Canal communication': d.canalCommunication || '',
      'Note satisfaction': d.noteSatisfaction || '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Demandes')
    XLSX.writeFile(wb, `Demandes_CRRAE_${new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')}.xlsx`)
  }

  const userRole = localStorage.getItem('userRole')
  const userName = localStorage.getItem('userName')
  const isFullAccess = userRole === 'admin' || userRole === 'manager' || userName === 'Ismael COULIBALY'

  const filtered = demandes.filter(d => {
    if (!isFullAccess && d.agentN1 !== userName && d.agentN2 !== userName) return false
    const q = search.toLowerCase()
    const ms = !q || (d.nomPrenom||'').toLowerCase().includes(q) || (d.numDemande||'').toLowerCase().includes(q)
    const mst = !filterStatut || d.statut === filterStatut
    return ms && mst
  })
  const inp = {...styles.input, marginBottom: '0.75rem'}
  const col2 = {display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem'}
  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📋 Suivi des Demandes</h2>
        <div style={{display:'flex', gap:'0.75rem'}}>
        <button style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem', background:'#276749'}} onClick={exportExcel}>
          📥 Exporter Excel
        </button>
        <button style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem'}} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Nouvelle demande'}
        </button>
        </div>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.5rem'}}>
        {[{label:'Total',val:demandes.length,bg:'#ebf8ff',col:'#2b6cb0'},{label:'Traités',val:demandes.filter(d=>d.statut==='Traité').length,bg:'#f0fff4',col:'#276749'},{label:'En cours',val:demandes.filter(d=>d.statut==='En cours').length,bg:'#fffbeb',col:'#b7791f'},{label:'Délai OK',val:demandes.filter(d=>d.respectDelai==='OUI').length,bg:'#faf5ff',col:'#6b46c1'}].map(s => (
          <div key={s.label} style={{background:s.bg,borderRadius:'10px',padding:'0.75rem',textAlign:'center'}}>
            <div style={{fontSize:'1.8rem',fontWeight:'bold',color:s.col}}>{s.val}</div>
            <div style={{fontSize:'0.8rem',color:s.col}}>{s.label}</div>
          </div>
        ))}
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={{...styles.form, marginBottom:'1.5rem'}}>
          {showFiche && <FicheClient telephone={ficheSearch.telephone} matricule={ficheSearch.matricule} onClose={() => setShowFiche(false)} />}
          <h3 style={{color:'#1a365d',marginBottom:'1rem',fontSize:'1rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'0.5rem'}}>👤 Informations client</h3>
          <div style={col2}>
            <input style={inp} placeholder="Nom et prénom *" value={form.nomPrenom} onChange={e=>setForm({...form,nomPrenom:e.target.value})} required />
            <input style={inp} placeholder="Matricule" value={form.matricule} 
              onChange={e=>setForm({...form,matricule:e.target.value})}
              onBlur={e=>{ if(e.target.value.length >= 4) { setFicheSearch({telephone:'', matricule:e.target.value}); setShowFiche(true) }}} />
            <input style={inp} placeholder="Adhérent (BOAD, BCEAO...)" value={form.adherent} onChange={e=>setForm({...form,adherent:e.target.value})} />
            <select style={inp} value={form.typeClient} onChange={e=>setForm({...form,typeClient:e.target.value})}>
              <option>Actif</option><option>Retraité</option><option>Ayant droit</option>
            </select>
            <select style={inp} value={form.pays} onChange={e=>{ const p=e.target.value; setForm({...form,pays:p,telephone:INDICATIFS[p]||form.telephone})}}>
              <option value="">-- Pays --</option>
              {["Bénin","Burkina Faso","Côte d'Ivoire","Guinée Bissau","Mali","Niger","Sénégal","Togo","France"].map(p=><option key={p}>{p}</option>)}
            </select>
            <input style={inp} placeholder="Téléphone" value={form.telephone}
              onChange={e=>setForm({...form,telephone:e.target.value})}
              onBlur={e=>{ if(e.target.value.replace(/[^0-9]/g,'').length >= 6) { setFicheSearch({telephone:e.target.value, matricule:''}); setShowFiche(true) }}} onFocus={e=>{ if(!form.telephone && form.pays && INDICATIFS[form.pays]) setForm(f=>({...f,telephone:INDICATIFS[form.pays]}))}} />
            <input style={inp} type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
            <input style={inp} placeholder="Heure appel (ex: 09h00)" value={form.heureAppel} onChange={e=>setForm({...form,heureAppel:e.target.value})} />
          </div>
          <h3 style={{color:'#1a365d',margin:'0.25rem 0 1rem',fontSize:'1rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'0.5rem'}}>📨 Demande</h3>
          <div style={col2}>
            <select style={inp} value={form.objetDemande} onChange={e=>setForm({...form,objetDemande:e.target.value})}>
              <option>Information</option><option>Réclamation</option><option>Demande de document</option><option>Autre</option>
            </select>
            <select style={inp} value={form.canal} onChange={e=>setForm({...form,canal:e.target.value})}>
              <option>WhatsApp</option><option>Appel</option><option>Email</option><option>Courrier</option>
            </select>
          </div>
          <textarea style={{...inp,height:'70px',resize:'vertical',width:'100%'}} placeholder="Commentaire" value={form.commentaire} onChange={e=>setForm({...form,commentaire:e.target.value})} />
          <h3 style={{color:'#1a365d',margin:'0.25rem 0 1rem',fontSize:'1rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'0.5rem'}}>⚙️ Traitement</h3>
          <div style={col2}>
            <input style={inp} placeholder="Agent N1" value={form.agentN1} onChange={e=>setForm({...form,agentN1:e.target.value})} />
            <select style={inp} value={form.service} onChange={e=>setForm({...form,service:e.target.value})}>
              <option value="">-- Service --</option>
              {["DPM","DPR","DSI","DCR","PATRIMOINE","REGISSEUR"].map(s=><option key={s}>{s}</option>)}
            </select>
            <input style={inp} placeholder="Agent N2" value={form.agentN2} onChange={e=>setForm({...form,agentN2:e.target.value})} />
            <select style={inp} value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
              <option>En cours</option><option>Traité</option><option>En attente</option>
            </select>
            <div><label style={{fontSize:'0.8rem',color:'#718096',display:'block',marginBottom:'0.25rem'}}>Date réception</label>
            <input style={inp} type="date" value={form.dateReception} onChange={e=>setForm({...form,dateReception:e.target.value})} /></div>
            <div><label style={{fontSize:'0.8rem',color:'#718096',display:'block',marginBottom:'0.25rem'}}>Date traitement</label>
            <input style={inp} type="date" value={form.dateTraitement} onChange={e=>setForm({...form,dateTraitement:e.target.value})} /></div>
            <select style={inp} value={form.canalCommunication} onChange={e=>setForm({...form,canalCommunication:e.target.value})}>
              <option value="WhatsApp">Retour : WhatsApp</option><option value="Email">Retour : Email</option><option value="Appel">Retour : Appel</option>
            </select>
            <select style={inp} value={form.noteSatisfaction} onChange={e=>setForm({...form,noteSatisfaction:e.target.value})}>
              <option value="">Note satisfaction</option>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>{n}/5</option>)}
            </select>
          </div>
          <textarea style={{...inp,height:'60px',resize:'vertical',width:'100%'}} placeholder="Action menée" value={form.actionMenee} onChange={e=>setForm({...form,actionMenee:e.target.value})} />
          <button style={styles.button} type="submit">{editId ? '💾 Modifier' : '💾 Enregistrer'}</button>
        </form>
      )}
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <input style={{...styles.input,marginBottom:0,flex:1}} placeholder="🔍 Rechercher..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select style={{...styles.input,marginBottom:0,width:'160px'}} value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}>
          <option value="">Tous statuts</option><option>Traité</option><option>En cours</option><option>En attente</option>
        </select>
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={styles.table}>
          <thead><tr>{['N°','Date','Nom','Type','Pays','Objet','Canal','Agent N1','Service','Statut','Délai','Note'].map(h=><th key={h} style={styles.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length===0 ? <tr><td colSpan={12} style={{...styles.td,textAlign:'center',color:'#718096',padding:'3rem'}}>Aucune demande — cliquez sur "+ Nouvelle demande"</td></tr>
            : filtered.map(d=>(
              <tr key={d.id} style={styles.tr}>
                <td style={{...styles.td,color:'#2b6cb0',fontWeight:'600'}}>{f(d.numDemande)}</td>
                <td style={styles.td}>{d.dateReception?new Date(d.dateReception).toLocaleDateString('fr-FR'):'—'}</td>
                <td style={styles.td}>{f(d.nomPrenom)}</td>
                <td style={styles.td}><span style={{...styles.badge,...(d.typeClient==='Actif'?{background:'#f0fff4',color:'#276749'}:{background:'#faf5ff',color:'#6b46c1'})}}>{f(d.typeClient)}</span></td>
                <td style={styles.td}>{f(d.pays)}</td>
                <td style={styles.td}><span style={{...styles.badge,...(d.objetDemande==='Réclamation'?{background:'#fff5f5',color:'#c53030'}:{background:'#ebf8ff',color:'#2b6cb0'})}}>{f(d.objetDemande)}</span></td>
                <td style={styles.td}>{f(d.canal)}</td>
                <td style={styles.td}>{f(d.agentN1)}</td>
                <td style={styles.td}>{f(d.service)}</td>
                <td style={styles.td}><span style={{...styles.badge,...sColor(d.statut)}}>{f(d.statut)}</span></td>
                <td style={styles.td}>{d.delaiTraitement?`${d.delaiTraitement}j`:'—'}</td>
                <td style={styles.td}>{d.noteSatisfaction?`⭐${d.noteSatisfaction}/5`:'—'}</td>
                <td style={styles.td}>
                  <button onClick={()=>handleEdit(d)} style={{background:'#ebf8ff',color:'#2b6cb0',border:'none',borderRadius:'6px',padding:'0.3rem 0.6rem',cursor:'pointer',marginRight:'0.4rem',fontSize:'0.8rem'}}>✏️</button>
                  <button onClick={()=>handleDelete(d.id)} style={{background:'#fff5f5',color:'#c53030',border:'none',borderRadius:'6px',padding:'0.3rem 0.6rem',cursor:'pointer',fontSize:'0.8rem'}}>🗑️</button>
                  <button onClick={()=> onOpenCommentaires(d)} style={{background:'#fffbeb',color:'#b7791f',border:'none',borderRadius:'6px',padding:'0.3rem 0.6rem',cursor:'pointer',fontSize:'0.8rem',marginLeft:'0.4rem'}}>💬</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}



function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const emptyForm = { name: '', email: '', password: '', role: 'agent' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { API.get('/users').then(r => setUsers(r.data)).catch(() => {}) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editUser) {
        const res = await API.put(`/users/${editUser.id}`, form)
        setUsers(users.map(u => u.id === editUser.id ? res.data : u))
        setEditUser(null)
      } else {
        const res = await API.post('/users', form)
        setUsers([...users, res.data])
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch { alert("Erreur lors de l'enregistrement") }
  }

  const handleEdit = (u) => {
    setEditUser(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setShowForm(true)
  }

  const roleColor = (r) => ({
    admin: { background: '#fff5f5', color: '#c53030' },
    agent: { background: '#ebf8ff', color: '#2b6cb0' },
    manager: { background: '#faf5ff', color: '#6b46c1' },
  }[r] || { background: '#f7fafc', color: '#718096' })

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👤 Utilisateurs</h2>
        <button style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem'}}
          onClick={() => { setShowForm(!showForm); setEditUser(null); setForm(emptyForm) }}>
          {showForm ? '✕ Annuler' : '+ Ajouter'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{color:'#1a365d', marginBottom:'1rem', fontSize:'1rem'}}>{editUser ? '✏️ Modifier' : '➕ Nouvel utilisateur'}</h3>
          <input style={styles.input} placeholder="Nom complet *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input style={styles.input} type="email" placeholder="Email *" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          <input style={styles.input} type="password" placeholder={editUser ? "Nouveau mot de passe (laisser vide pour ne pas changer)" : "Mot de passe *"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required={!editUser} />
          <select style={styles.input} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
          <button style={styles.button} type="submit">{editUser ? '💾 Modifier' : '💾 Créer'}</button>
        </form>
      )}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Rôle</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Créé le</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} style={styles.tr}>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}><span style={{...styles.badge,...roleColor(u.role)}}>{u.role}</span></td>
              <td style={styles.td}><span style={{...styles.badge,...(u.active?{background:'#f0fff4',color:'#276749'}:{background:'#fff5f5',color:'#c53030'})}}>{u.active?'Actif':'Inactif'}</span></td>
              <td style={styles.td}>{u.createdAt?new Date(u.createdAt).toLocaleDateString('fr-FR'):'—'}</td>
              <td style={styles.td}>
                <button onClick={()=>handleEdit(u)} style={{background:'#ebf8ff',color:'#2b6cb0',border:'none',borderRadius:'6px',padding:'0.3rem 0.75rem',cursor:'pointer',marginRight:'0.5rem'}}>✏️ Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function Rapports() {
  const [demandes, setDemandes] = useState([])
  const [periode, setPeriode] = useState('mois')

  useEffect(() => { API.get('/demandes').then(r => setDemandes(r.data)).catch(() => {}) }, [])

  const now = new Date()
  const filtered = demandes.filter(d => {
    if (!d.dateReception) return false
    const date = new Date(d.dateReception)
    if (periode === 'semaine') {
      const diff = (now - date) / (1000 * 60 * 60 * 24)
      return diff <= 7
    } else if (periode === 'mois') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    } else if (periode === 'annee') {
      return date.getFullYear() === now.getFullYear()
    }
    return true
  })

  const agents = [...new Set(demandes.map(d => d.agentN1).filter(Boolean))]
  const perfAgents = agents.map(a => ({
    name: a.split(' ')[0],
    total: filtered.filter(d => d.agentN1 === a).length,
    traite: filtered.filter(d => d.agentN1 === a && d.statut === 'Traité').length,
  })).filter(a => a.total > 0).sort((a,b) => b.total - a.total)

  const services = ['DPM','DPR','DSI','DCR','PATRIMOINE']
  const perfServices = services.map(s => {
    const total = filtered.filter(d => d.service === s).length
    const oui = filtered.filter(d => d.service === s && d.respectDelai === 'OUI').length
    return { name: s, total, taux: total > 0 ? Math.round(oui/total*100) : 0 }
  }).filter(s => s.total > 0)

  const notes = filtered.filter(d => d.noteSatisfaction).map(d => d.noteSatisfaction)
  const moyNote = notes.length > 0 ? (notes.reduce((a,b) => a+b, 0) / notes.length).toFixed(1) : '—'

  const tauxTraite = filtered.length > 0 ? Math.round(filtered.filter(d => d.statut === 'Traité').length / filtered.length * 100) : 0
  const tauxDelai = filtered.length > 0 ? Math.round(filtered.filter(d => d.respectDelai === 'OUI').length / filtered.length * 100) : 0

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📈 Rapports</h2>
        <div style={{display:'flex', gap:'0.5rem'}}>
          {[{val:'semaine',label:'Cette semaine'},{val:'mois',label:'Ce mois'},{val:'annee',label:'Cette année'},{val:'tout',label:'Tout'}].map(p => (
            <button key={p.val} onClick={() => setPeriode(p.val)}
              style={{padding:'0.5rem 1rem', borderRadius:'6px', border:'none', cursor:'pointer',
                background: periode === p.val ? '#2b6cb0' : '#edf2f7',
                color: periode === p.val ? 'white' : '#4a5568', fontSize:'0.85rem'}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.75rem', marginBottom:'1.5rem'}}>
        {[
          {label:'Total demandes', val:filtered.length, bg:'#ebf8ff', col:'#2b6cb0'},
          {label:'Taux traitement', val:`${tauxTraite}%`, bg:'#f0fff4', col:'#276749'},
          {label:'Respect délais', val:`${tauxDelai}%`, bg:'#faf5ff', col:'#6b46c1'},
          {label:'Note moyenne', val:`${moyNote}/5`, bg:'#fffbeb', col:'#b7791f'},
        ].map(s => (
          <div key={s.label} style={{background:s.bg, borderRadius:'10px', padding:'1rem', textAlign:'center'}}>
            <div style={{fontSize:'1.8rem', fontWeight:'bold', color:s.col}}>{s.val}</div>
            <div style={{fontSize:'0.8rem', color:s.col, opacity:0.85}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
        <div style={{background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{color:'#1a365d', marginBottom:'1rem', fontSize:'1rem'}}>👤 Performance par agent</h3>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Agent</th><th style={styles.th}>Total</th><th style={styles.th}>Traités</th><th style={styles.th}>Taux</th></tr></thead>
            <tbody>
              {perfAgents.map(a => (
                <tr key={a.name} style={styles.tr}>
                  <td style={styles.td}>{a.name}</td>
                  <td style={styles.td}>{a.total}</td>
                  <td style={styles.td}>{a.traite}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background:'#f0fff4', color:'#276749'}}>
                      {a.total > 0 ? Math.round(a.traite/a.total*100) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{background:'white', borderRadius:'12px', padding:'1.5rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
          <h3 style={{color:'#1a365d', marginBottom:'1rem', fontSize:'1rem'}}>🏢 Respect délais par service</h3>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Service</th><th style={styles.th}>Total</th><th style={styles.th}>Délai max</th><th style={styles.th}>Taux</th></tr></thead>
            <tbody>
              {perfServices.map(s => (
                <tr key={s.name} style={styles.tr}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.total}</td>
                  <td style={styles.td}>{{'DPM':'3j','DPR':'5j','DSI':'6j','PATRIMOINE':'7j','DCR':'5j'}[s.name]}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, background: s.taux >= 80 ? '#f0fff4' : '#fff5f5', color: s.taux >= 80 ? '#276749' : '#c53030'}}>
                      {s.taux}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}





// Layout
function Layout({ onLogout, children, alertes }) {
  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <div style={{textAlign:'center', marginBottom:'1rem'}}>
          <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{width:'140px', borderRadius:'8px', background:'white', padding:'8px', borderRadius:'12px'}} />
        </div>
        <Link style={styles.navLink} to="/dashboard">📊 Dashboard</Link>
        <Link style={styles.navLink} to="/demandes">
          📋 Suivi Demandes
          {alertes && alertes.length > 0 && (
            <span style={{background:'#c53030', color:'white', borderRadius:'12px', padding:'0.1rem 0.45rem', fontSize:'0.7rem', marginLeft:'0.5rem', fontWeight:'700', display:'inline-block'}}>
              {alertes.length}
            </span>
          )}
        </Link>
        <Link style={styles.navLink} to="/contacts">👥 Contacts</Link>
        <Link style={styles.navLink} to="/deals">💼 Deals</Link>
        <Link style={styles.navLink} to="/tickets">🎫 Tickets</Link>
        <Link style={styles.navLink} to="/campagnes">📣 Campagnes</Link>
        <Link style={styles.navLink} to="/rapports">📈 Rapports</Link>
        <Link style={styles.navLink} to="/users">👤 Utilisateurs</Link>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Déconnexion</button>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

// App
export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'))

  const [alertes, setAlertes] = useState([])

  useEffect(() => {
    if (auth) {
      const delaisMax = { DPM:3, DPR:5, DSI:6, PATRIMOINE:7, DCR:5, REGISSEUR:5 }
      API.get('/demandes').then(r => {
        const retard = r.data.filter(d => {
          if (d.statut === 'Traite') return false
          if (!d.dateReception) return false
          const jours = Math.ceil((new Date() - new Date(d.dateReception)) / (1000*60*60*24))
          return jours > (delaisMax[d.service] || 3)
        })
        setAlertes(retard)
      }).catch(() => {})
    }
  }, [auth])

  const logout = () => { localStorage.removeItem('token'); setAuth(false) }

  if (!auth) return <Login onLogin={() => setAuth(true)} />

  return (
    <BrowserRouter>
      <Layout onLogout={logout} alertes={alertes}>
        {demandeActive && <PanneauCommentaires demande={demandeActive} onClose={() => setDemandeActive(null)} />}
        <Routes>
          <Route path="/dashboard" element={<Dashboard alertes={alertes} />} />
          <Route path="/demandes" element={<Demandes onOpenCommentaires={setDemandeActive} />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/campagnes" element={<Campagnes />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/users" element={<Users />} />
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
  nav: { width: '240px', background: '#1e4a7a', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  navTitle: { color: 'white', marginBottom: '1rem', fontSize: '1rem' },
  navLink: { color: '#bee3f8', textDecoration: 'none', padding: '0.5rem', borderRadius: '6px', display: 'block' },
  logoutBtn: { marginTop: 'auto', background: 'transparent', color: '#fc8181', border: '1px solid #fc8181', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  main: { flex: 1, padding: '2rem', background: '#f7fafc' },
  pageTitle: { color: '#1a365d', marginBottom: '1.5rem' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNum: { fontSize: '2.5rem', fontWeight: 'bold', color: '#2b6cb0' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { background: '#edf2f7', padding: '0.75rem 1rem', textAlign: 'left', color: '#4a5568', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.75rem 1rem', color: '#2d3748', fontSize: '0.95rem' },
  form: { background: 'white', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  badge: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' },
}
