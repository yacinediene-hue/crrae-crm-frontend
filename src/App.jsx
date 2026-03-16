import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import API from './api'
import './App.css'
import './App.css'

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
        {error
cat >> ~/crrae-crm-frontend/src/App.jsx << 'EOF'

function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, deals: 0, tickets: 0, demandes: 0 })
  useEffect(() => {
    Promise.all([
      API.get('/contacts'),
      API.get('/deals'),
      API.get('/tickets'),
      API.get('/demandes'),
    ]).then(([c, d, t, dem]) => {
      setStats({ contacts: c.data.length, deals: d.data.length, tickets: t.data.length, demandes: dem.data.length })
    }).catch(() => {})
  }, [])
  return (
    <div>
      <h2 style={styles.pageTitle}>📊 Dashboard</h2>
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><h3>👥 Contacts</h3><p style={styles.statNum}>{stats.contacts}</p></div>
        <div style={styles.statCard}><h3>💼 Deals</h3><p style={styles.statNum}>{stats.deals}</p></div>
        <div style={styles.statCard}><h3>🎫 Tickets</h3><p style={styles.statNum}>{stats.tickets}</p></div>
        <div style={styles.statCard}><h3>📋 Demandes</h3><p style={styles.statNum}>{stats.demandes}</p></div>
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
              <td style={styles.td}>{c.name}</td><td style={styles.td}>{c.email}</td>
              <td style={styles.td}>{c.phone}</td><td style={styles.td}>{c.company}</td>
              <td style={styles.td}><span style={styles.badge}>{c.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Deals() {
  const [deals, setDeals] = useState([])
  const [form, setForm] = useState({ title: '', amount: '', status: 'open' })
  const [showForm, setShowForm] = useState(false)
  useEffect(() => { API.get('/deals').then(r => setDeals(r.data)).catch(() => {}) }, [])
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/deals', { ...form, amount: parseFloat(form.amount) })
      setDeals([...deals, res.data])
      setForm({ title: '', amount: '', status: 'open' })
      setShowForm(false)
    } catch {}
  }
  const statusColor = (s) => ({ open: { background: '#ebf8ff', color: '#2b6cb0' }, won: { background: '#f0fff4', color: '#276749' }, lost: { background: '#fff5f5', color: '#c53030' }, pending: { background: '#fffbeb', color: '#b7791f' } }[s] || { background: '#ebf8ff', color: '#2b6cb0' })
  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>💼 Deals</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Titre" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
          <input style={styles.input} placeholder="Montant (FCFA)" type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="open">Ouvert</option><option value="pending">En cours</option>
            <option value="won">Gagné</option><option value="lost">Perdu</option>
          </select>
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Titre</th><th style={styles.th}>Montant</th><th style={styles.th}>Statut</th><th style={styles.th}>Date</th></tr></thead>
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
  const priorityColor = (p) => ({ low: { background: '#f0fff4', color: '#276749' }, medium: { background: '#fffbeb', color: '#b7791f' }, high: { background: '#fff5f5', color: '#c53030' } }[p] || {})
  const statusColor = (s) => ({ open: { background: '#ebf8ff', color: '#2b6cb0' }, in_progress: { background: '#faf5ff', color: '#6b46c1' }, closed: { background: '#f7fafc', color: '#718096' } }[s] || {})
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
            <option value="low">Basse</option><option value="medium">Moyenne</option><option value="high">Haute</option>
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="open">Ouvert</option><option value="in_progress">En cours</option><option value="closed">Fermé</option>
          </select>
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Sujet</th><th style={styles.th}>Priorité</th><th style={styles.th}>Statut</th><th style={styles.th}>Date</th></tr></thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id} style={styles.tr}>
              <td style={styles.td}>{t.subject}</td>
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
  const statusColor = (s) => ({ draft: { background: '#f7fafc', color: '#718096' }, active: { background: '#f0fff4', color: '#276749' }, paused: { background: '#fffbeb', color: '#b7791f' }, completed: { background: '#ebf8ff', color: '#2b6cb0' } }[s] || {})
  const typeColor = (t) => ({ email: { background: '#ebf8ff', color: '#2b6cb0' }, sms: { background: '#faf5ff', color: '#6b46c1' }, social: { background: '#f0fff4', color: '#276749' } }[t] || {})
  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📣 Campagnes</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={styles.form}>
          <input style={styles.input} placeholder="Nom" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <select style={styles.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
            <option value="email">Email</option><option value="sms">SMS</option><option value="social">Réseaux sociaux</option>
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            <option value="draft">Brouillon</option><option value="active">Active</option>
            <option value="paused">En pause</option><option value="completed">Terminée</option>
          </select>
          <input style={styles.input} type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
          <input style={styles.input} type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
          <button style={styles.button} type="submit">Enregistrer</button>
        </form>
      )}
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Nom</th><th style={styles.th}>Type</th><th style={styles.th}>Statut</th><th style={styles.th}>Début</th><th style={styles.th}>Fin</th></tr></thead>
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

function Demandes() {
  const [demandes, setDemandes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterService, setFilterService] = useState('')
  const emptyForm = {
    nomPrenom: '', matricule: '', adherent: '', typeClient: 'Actif', pays: '',
    heureAppel: '', canal: 'WhatsApp', telephone: '', email: '',
    objetDemande: 'Information', commentaire: '',
    agentN1: '', service: '', agentN2: '',
    dateReception: new Date().toISOString().split('T')[0],
    dateTraitement: '', statut: 'En cours', actionMenee: '',
    canalCommunication: 'WhatsApp', noteSatisfaction: '',
  }
  const [form, setForm] = useState(emptyForm)
  useEffect(() => { API.get('/demandes').then(r => setDemandes(r.data)).catch(() => {}) }, [])
  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/demandes', form)
      setDemandes([res.data, ...demandes])
      setForm(emptyForm)
      setShowForm(false)
    } catch {
      alert("Erreur : vérifiez que l'endpoint /demandes existe sur le backend.")
    }
  }
  const f = (v) => v || '—'
  const statutColor = (s) => ({
    'Traité': { background: '#f0fff4', color: '#276749' },
    'En cours': { background: '#fffbeb', color: '#b7791f' },
    'En attente': { background: '#ebf8ff', color: '#2b6cb0' },
  }[s] || { background: '#f7fafc', color: '#718096' })
  const respDelaiColor = (v) => v === 'OUI'
    ? { background: '#f0fff4', color: '#276749' }
    : { background: '#fff5f5', color: '#c53030' }
  const filtered = demandes.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      (d.nomPrenom || '').toLowerCase().includes(q) ||
      (d.numDemande || '').toLowerCase().includes(q) ||
      (d.objetDemande || '').toLowerCase().includes(q) ||
      (d.commentaire || '').toLowerCase().includes(q)
    const matchStatut = !filterStatut || d.statut === filterStatut
    const matchService = !filterService || d.service === filterService
    return matchSearch && matchStatut && matchService
  })
  const col2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }
  const inp = { ...styles.input, marginBottom: '0.75rem' }
  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📋 Suivi des Demandes</h2>
        <button style={{ ...styles.button, width: 'auto', padding: '0.75rem 1.25rem' }}
          onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Nouvelle demande'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: demandes.length, bg: '#ebf8ff', col: '#2b6cb0' },
          { label: 'Traités', val: demandes.filter(d => d.statut === 'Traité').length, bg: '#f0fff4', col: '#276749' },
          { label: 'En cours', val: demandes.filter(d => d.statut === 'En cours').length, bg: '#fffbeb', col: '#b7791f' },
          { label: 'Délai respecté', val: demandes.filter(d => d.respectDelai === 'OUI').length, bg: '#faf5ff', col: '#6b46c1' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '10px', padding: '0.75rem 1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: s.col }}>{s.val}</div>
            <div style={{ fontSize: '0.8rem', color: s.col, opacity: 0.85 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={{ ...styles.form, marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#1a365d', marginBottom: '1rem', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>👤 Informations client</h3>
          <div style={col2}>
            <input style={inp} placeholder="Nom et prénom *" value={form.nomPrenom} onChange={e => setForm({...form, nomPrenom: e.target.value})} required />
            <input style={inp} placeholder="Matricule" value={form.matricule} onChange={e => setForm({...form, matricule: e.target.value})} />
            <input style={inp} placeholder="Adhérent (ex: BOAD, BCEAO)" value={form.adherent} onChange={e => setForm({...form, adherent: e.target.value})} />
            <select style={inp} value={form.typeClient} onChange={e => setForm({...form, typeClient: e.target.value})}>
              <option value="Actif">Actif</option>
              <option value="Retraité">Retraité</option>
              <option value="Ayant droit">Ayant droit</option>
            </select>
            <select style={inp} value={form.pays} onChange={e => setForm({...form, pays: e.target.value})}>
              <option value="">-- Pays --</option>
              {["Bénin","Burkina Faso","Côte d'Ivoire","Guinée Bissau","Mali","Niger","Sénégal","Togo","France"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input style={inp} placeholder="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
            <input style={inp} type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <input style={inp} placeholder="Heure d'appel (ex: 09h00)" value={form.heureAppel} onChange={e => setForm({...form, heureAppel: e.target.value})} />
          </div>
          <h3 style={{ color: '#1a365d', margin: '0.25rem 0 1rem', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>📨 Demande reçue</h3>
          <div style={col2}>
            <select style={inp} value={form.objetDemande} onChange={e => setForm({...form, objetDemande: e.target.value})}>
              <option value="Information">Information</option>
              <option value="Réclamation">Réclamation</option>
              <option value="Demande de document">Demande de document</option>
              <option value="Autre">Autre</option>
            </select>
            <select style={inp} value={form.canal} onChange={e => setForm({...form, canal: e.target.value})}>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Appel">Appel</option>
              <option value="Email">Email</option>
              <option value="Courrier">Courrier</option>
            </select>
          </div>
          <textarea style={{ ...inp, height: '70px', resize: 'vertical', width: '100%' }} placeholder="Commentaire / détail de la demande" value={form.commentaire} onChange={e => setForm({...form, commentaire: e.target.value})} />
          <h3 style={{ color: '#1a365d', margin: '0.25rem 0 1rem', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>⚙️ Traitement</h3>
          <div style={col2}>
            <input style={inp} placeholder="Agent traitant N1" value={form.agentN1} onChange={e => setForm({...form, agentN1: e.target.value})} />
            <select style={inp} value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
              <option value="">-- Service --</option>
              {["DPM","DPR","DSI","DCR","PATRIMOINE","REGISSEUR"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input style={inp} placeholder="Agent traitant N2" value={form.agentN2} onChange={e => setForm({...form, agentN2: e.target.value})} />
            <select style={inp} value={form.statut} onChange={e => setForm({...form, statut: e.target.value})}>
              <option value="En cours">En cours</option>
              <option value="Traité">Traité</option>
              <option value="En attente">En attente</option>
            </select>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', display: 'block' }}>Date réception</label>
              <input style={inp} type="date" value={form.dateReception} onChange={e => setForm({...form, dateReception: e.target.value})} />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.25rem', display: 'block' }}>Date traitement</label>
              <input style={inp} type="date" value={form.dateTraitement} onChange={e => setForm({...form, dateTraitement: e.target.value})} />
            </div>
            <select style={inp} value={form.canalCommunication} onChange={e => setForm({...form, canalCommunication: e.target.value})}>
              <option value="WhatsApp">Canal retour : WhatsApp</option>
              <option value="Email">Canal retour : Email</option>
              <option value="Appel">Canal retour : Appel</option>
            </select>
            <select style={inp} value={form.noteSatisfaction} onChange={e => setForm({...form, noteSatisfaction: e.target.value})}>
              <option value="">Note satisfaction (optionnel)</option>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}
            </select>
          </div>
          <textarea style={{ ...inp, height: '60px', resize: 'vertical', width: '100%' }} placeholder="Action menée" value={form.actionMenee} onChange={e => setForm({...form, actionMenee: e.target.value})} />
          <button style={styles.button} type="submit">💾 Enregistrer la demande</button>
        </form>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input style={{ ...styles.input, marginBottom: 0, flex: 1, minWidth: '220px' }} placeholder="🔍 Rechercher par nom, N° demande, objet..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={{ ...styles.input, marginBottom: 0, width: '160px' }} value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="Traité">Traité</option>
          <option value="En cours">En cours</option>
          <option value="En attente">En attente</option>
        </select>
        <select style={{ ...styles.input, marginBottom: 0, width: '150px' }} value={filterService} onChange={e => setFilterService(e.target.value)}>
          <option value="">Tous les services</option>
          {["DPM","DPR","DSI","DCR","PATRIMOINE"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || filterStatut || filterService) && (
          <button style={{ ...styles.button, width: 'auto', padding: '0.75rem 1rem', background: '#718096' }}
            onClick={() => { setSearch(''); setFilterStatut(''); setFilterService('') }}>✕ Réinitialiser</button>
        )}
      </div>
      <p style={{ color: '#718096', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{filtered.length} demande{filtered.length > 1 ? 's' : ''} affichée{filtered.length > 1 ? 's' : ''}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['N° Demande','Date récep.','Nom & Prénom','Type','Pays','Objet','Canal','Agent N1','Service','Agent N2','Date traitement','Statut','Délai (j)','Resp. délai','Note'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={15} style={{ ...styles.td, textAlign: 'center', color: '#718096', padding: '3rem' }}>Aucune demande — cliquez sur "+ Nouvelle demande" pour commencer</td></tr>
            ) : filtered.map(d => (
              <tr key={d.id} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: '600', color: '#2b6cb0', whiteSpace: 'nowrap' }}>{f(d.numDemande)}</td>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{d.dateReception ? new Date(d.dateReception).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{f(d.nomPrenom)}</td>
                <td style={styles.td}><span style={{ ...styles.badge, ...(d.typeClient === 'Actif' ? { background: '#f0fff4', color: '#276749' } : { background: '#faf5ff', color: '#6b46c1' }) }}>{f(d.typeClient)}</span></td>
                <td style={styles.td}>{f(d.pays)}</td>
                <td style={styles.td}><span style={{ ...styles.badge, ...(d.objetDemande === 'Réclamation' ? { background: '#fff5f5', color: '#c53030' } : { background: '#ebf8ff', color: '#2b6cb0' }) }}>{f(d.objetDemande)}</span></td>
                <td style={styles.td}>{f(d.canal)}</td>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{f(d.agentN1)}</td>
                <td style={styles.td}>{f(d.service)}</td>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{f(d.agentN2)}</td>
                <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{d.dateTraitement ? new Date(d.dateTraitement).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={styles.td}><span style={{ ...styles.badge, ...statutColor(d.statut) }}>{f(d.statut)}</span></td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{f(d.delaiTraitement)}</td>
                <td style={styles.td}>{d.respectDelai ? <span style={{ ...styles.badge, ...respDelaiColor(d.respectDelai) }}>{d.respectDelai}</span> : '—'}</td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{d.noteSatisfaction ? `⭐ ${d.noteSatisfaction}/5` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NavLink({ to, children }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link style={{ ...styles.navLink, ...(active ? styles.navLinkActive : {}) }} to={to}>
      {children}
    </Link>
  )
}

function Layout({ onLogout, children }) {
  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <h2 style={styles.navTitle}>🏦 CRRAE CRM</h2>
        <NavLink to="/dashboard">📊 Dashboard</NavLink>
        <NavLink to="/demandes">📋 Suivi Demandes</NavLink>
        <NavLink to="/contacts">👥 Contacts</NavLink>
        <NavLink to="/deals">💼 Deals</NavLink>
        <NavLink to="/tickets">🎫 Tickets</NavLink>
        <NavLink to="/campagnes">📣 Campagnes</NavLink>
        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Déconnexion</button>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('token'))
  const logout = () => { localStorage.removeItem('token'); setAuth(false) }
  if (!auth) return <Login onLogin={() => setAuth(true)} />
  return (
    <BrowserRouter>
      <Layout onLogout={logout}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/demandes" element={<Demandes />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/campagnes" element={<Campagnes />} />
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
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
  layout: { display: 'flex', minHeight: '100vh' },
  nav: { width: '220px', background: '#1a365d', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 },
  navTitle: { color: 'white', marginBottom: '1rem', fontSize: '1rem' },
  navLink: { color: '#bee3f8', textDecoration: 'none', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'block', fontSize: '0.9rem' },
  navLinkActive: { background: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: '600' },
  logoutBtn: { marginTop: 'auto', background: 'transparent', color: '#fc8181', border: '1px solid #fc8181', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  main: { flex: 1, padding: '2rem', background: '#f7fafc', overflowX: 'auto' },
  pageTitle: { color: '#1a365d', marginBottom: '1.5rem' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  statCard: { background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' },
  statNum: { fontSize: '2.5rem', fontWeight: 'bold', color: '#2b6cb0' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  th: { background: '#edf2f7', padding: '0.65rem 0.85rem', textAlign: 'left', color: '#4a5568', fontSize: '0.78rem', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #e2e8f0' },
  td: { padding: '0.65rem 0.85rem', color: '#2d3748', fontSize: '0.88rem' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  badge: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', whiteSpace: 'nowrap' },
}
