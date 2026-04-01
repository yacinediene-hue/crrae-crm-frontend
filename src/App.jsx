
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
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import API from './api'
import './App.css'
import * as XLSX from 'xlsx'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Login
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{ width: '130px', height: '130px', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e3a6d', letterSpacing: '-0.01em', lineHeight: 1 }}>
            CRRAE-UMOA
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#6b7280', marginTop: '0.3rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            CRM
          </div>
          <div style={{ width: '40px', height: '3px', background: '#1e3a6d', borderRadius: '2px', margin: '0.9rem auto 0' }} />
        </div>
        <p style={{ textAlign: 'center', color: '#4a5568', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Connectez-vous à votre espace</p>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
          <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" />
          <button style={styles.button} type="submit">Se connecter</button>
        </form>
        <p style={{textAlign:'center', marginTop:'1rem'}}>
          <a href="/forgot-password" style={{color:'#6366f1', fontSize:'0.875rem'}}>Mot de passe oublié ?</a>
        </p>
      </div>
    </div>
  )
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
    } catch {
      setMessage('Une erreur est survenue. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={{textAlign:'center', marginBottom:'1rem'}}>
          <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{width:'120px'}} />
        </div>
        <h1 style={{ fontSize: '56px', fontWeight: '800', color: '#243a5e', marginBottom: '20px', lineHeight: '1.1', textAlign: 'center' }}>
          Mot de passe oublié
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '30px' }}>
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
        {message ? (
          <p style={{textAlign:'center', color:'#16a34a', marginBottom:'1rem'}}>{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
            <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Envoyer le lien'}</button>
          </form>
        )}
        <p style={{textAlign:'center', marginTop:'1rem'}}>
          <a href="/" style={{color:'#6366f1', fontSize:'0.875rem'}}>Retour à la connexion</a>
        </p>
      </div>
    </div>
  )
}

function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await API.post('/auth/reset-password', { token, password })
      setMessage(res.data.message)
    } catch (e) {
      setError(e.response?.data?.message || 'Lien invalide ou expiré.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox}>
        <div style={{textAlign:'center', marginBottom:'1rem'}}>
          <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{width:'120px'}} />
        </div>
        <h1 style={styles.loginTitle}>Nouveau mot de passe</h1>
        {message ? (
          <>
            <p style={{textAlign:'center', color:'#16a34a', marginBottom:'1rem'}}>{message}</p>
            <p style={{textAlign:'center'}}>
              <a href="/" style={{color:'#6366f1', fontSize:'0.875rem'}}>Se connecter</a>
            </p>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <p style={styles.error}>{error}</p>}
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nouveau mot de passe (8 car. min.)" required />
            <input style={styles.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirmer le mot de passe" required />
            <button style={styles.button} type="submit" disabled={loading}>{loading ? 'Enregistrement...' : 'Réinitialiser'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

// Dashboard
function Dashboard({ alertes = [] }) {
  const [stats, setStats] = useState({ contacts: 0, deals: 0 })
  const [demandes, setDemandes] = useState([])
  const [periode, setPeriode] = useState('30j')

  const demandesFiltrees = demandes.filter((d) => {
    if (!d.createdAt) return true
    const date = new Date(d.createdAt)
    const now = new Date()
    if (periode === 'today') return date.toDateString() === now.toDateString()
    if (periode === '7j') { const t = new Date(); t.setDate(now.getDate() - 7); return date >= t }
    if (periode === '30j') { const t = new Date(); t.setDate(now.getDate() - 30); return date >= t }
    return true
  })

  const slaStats = demandesFiltrees.reduce((acc, item) => {
    const service = item.service || 'Autre'
    if (!acc[service]) acc[service] = { total: 0, slaOk: 0 }
    acc[service].total++
    if (item.respectDelai === 'OUI') acc[service].slaOk++
    return acc
  }, {})

  const agentStats = demandesFiltrees.reduce((acc, item) => {
    const agent = item.agentN1 || 'Non assigné'
    if (!acc[agent]) acc[agent] = { total: 0, slaOk: 0 }
    acc[agent].total++
    if (item.respectDelai === 'OUI') acc[agent].slaOk++
    return acc
  }, {})

  const filesService = demandesFiltrees.reduce((acc, d) => {
    const service = d.service || 'Autre'
    if (!acc[service]) acc[service] = { enCours: 0, horsSla: 0 }
    if (d.statut === 'En cours') acc[service].enCours++
    if (d.statut !== 'Traité' && d.respectDelai === 'NON') acc[service].horsSla++
    return acc
  }, {})

  useEffect(() => {
    Promise.all([
      API.get('/contacts'),
      API.get('/deals'),
      API.get('/demandes'),
    ]).then(([c, d, dem]) => {
      setStats({ contacts: c.data.length, deals: d.data.length })
      setDemandes(dem.data)
    }).catch(() => {})
  }, [])

  const byStatut = [
    { name: 'Traité', value: demandesFiltrees.filter(d => d.statut === 'Traité').length, color: '#276749' },
    { name: 'En cours', value: demandesFiltrees.filter(d => d.statut === 'En cours').length, color: '#b7791f' },
    { name: 'En attente', value: demandesFiltrees.filter(d => d.statut === 'En attente').length, color: '#2b6cb0' },
  ]

  const services = ['DPM','DPR','DSI','DCR','PATRIMOINE']
  const byService = services.map(s => ({
    name: s,
    total: demandesFiltrees.filter(d => d.service === s).length,
    traite: demandesFiltrees.filter(d => d.service === s && d.statut === 'Traité').length,
  })).filter(s => s.total > 0)

  const canaux = ['WhatsApp','Email','Appel','Courrier']
  const byCanal = canaux.map(c => ({
    name: c,
    value: demandesFiltrees.filter(d => d.canal === c).length,
  })).filter(c => c.value > 0)


  const COLORS = ['#2b6cb0','#276749','#b7791f','#6b46c1','#c53030']

  const slaRows = Object.entries(slaStats).map(([service, values]) => {
    const taux = values.total > 0 ? Math.round((values.slaOk / values.total) * 100) : 0
    return {
      service,
      total: values.total,
      slaOk: values.slaOk,
      taux,
    }
  })

  const slaChartData = Object.entries(slaStats).map(([service, values]) => {
    const taux = values.total > 0 ? Math.round((values.slaOk / values.total) * 100) : 0

    return {
      service,
      taux,
    }
  })

  const agentRows = Object.entries(agentStats).map(([agent, values]) => {
    const taux = values.total > 0 ? Math.round((values.slaOk / values.total) * 100) : 0
    return {
      agent,
      total: values.total,
      slaOk: values.slaOk,
      taux,
    }
  })

  const npsStats = demandesFiltrees.reduce(
    (acc, d) => {
      if (d.noteSatisfaction === null || d.noteSatisfaction === undefined) return acc

      if (d.noteSatisfaction >= 9) acc.promoteurs++
      else if (d.noteSatisfaction >= 7) acc.passifs++
      else acc.detracteurs++

      return acc
    },
    { promoteurs: 0, passifs: 0, detracteurs: 0 }
  )

  const totalNps =
    npsStats.promoteurs + npsStats.passifs + npsStats.detracteurs

  const scoreNps =
    totalNps > 0
      ? Math.round(
          ((npsStats.promoteurs - npsStats.detracteurs) / totalNps) * 100
        )
      : 0

  const npsChartData = [
    { name: 'Promoteurs', value: npsStats.promoteurs, color: '#276749' },
    { name: 'Passifs', value: npsStats.passifs, color: '#b7791f' },
    { name: 'Détracteurs', value: npsStats.detracteurs, color: '#c53030' },
  ]

  const demandesEnCours = demandesFiltrees.filter(d => d.statut === 'En cours')
  const demandesTraitees = demandesFiltrees.filter(d => d.statut === 'Traité')
  const demandesCritiques = demandesFiltrees.filter(d =>
    ['En cours', 'En attente'].includes(d.statut) && (
      d.priorite === 'Urgent' ||
      d.respectDelai === 'NON' ||
      d.objetDemande === 'Réclamation'
    )
  )
  const demandesHorsSla = demandesFiltrees.filter(d => ['En cours', 'En attente'].includes(d.statut) && d.respectDelai === 'NON')

  const demandesEntrantes = [...demandesFiltrees]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const chargeParAgent = Object.entries(
    demandesFiltrees.reduce((acc, d) => {
      const agent = d.agentN1 || 'Non assigné'
      acc[agent] = (acc[agent] || 0) + 1
      return acc
    }, {})
  ).map(([agent, total]) => ({ agent, total }))
   .sort((a, b) => b.total - a.total)

  const chargeParService = Object.entries(
    demandesFiltrees.reduce((acc, d) => {
      const service = d.service || 'Non défini'
      acc[service] = (acc[service] || 0) + 1
      return acc
    }, {})
  ).map(([service, total]) => ({ service, total }))
   .sort((a, b) => b.total - a.total)

  const chargeParCanal = Object.entries(
    demandesFiltrees.reduce((acc, d) => {
      const canal = d.canal || 'Non défini'
      acc[canal] = (acc[canal] || 0) + 1
      return acc
    }, {})
  ).map(([canal, total]) => ({ canal, total }))
   .sort((a, b) => b.total - a.total)

  return (
    <div>
      <h2 style={styles.pageTitle}>📊 Dashboard</h2>
      <div style={{marginBottom:'1rem'}}>
        <select
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          style={{
            padding:'0.5rem',
            borderRadius:'6px',
            border:'1px solid #ddd'
          }}
        >
          <option value="today">Aujourd'hui</option>
          <option value="7j">7 derniers jours</option>
          <option value="30j">30 derniers jours</option>
        </select>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:'0.9rem', marginBottom:'1rem'}}>
        {[
          {label:'Demandes', val:demandesFiltrees.length, col:'#2b6cb0', icon:'📥'},
          {label:'En cours', val:demandesEnCours.length, col:'#b7791f', icon:'⏳'},
          {label:'Traitées', val:demandesTraitees.length, col:'#276749', icon:'✅'},
          {label:'Hors SLA', val:demandesHorsSla.length, col:'#c53030', icon:'⚠️'},
        ].map(card => (
          <div
            key={card.label}
            style={{
              background:'white',
              borderRadius:'14px',
              padding:'1rem',
              boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
              borderTop:`4px solid ${card.col}`
            }}
          >
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'0.82rem', color:'#718096'}}>{card.label}</div>
              <div style={{
                width:'36px',
                height:'36px',
                borderRadius:'10px',
                background:card.col,
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                color:'white',
                fontSize:'1rem'
              }}>
                {card.icon}
              </div>
            </div>

            <div style={{fontSize:'2rem', fontWeight:'700', color:card.col, marginTop:'0.45rem'}}>
              {card.val}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background:'white',
        borderRadius:'12px',
        padding:'0.9rem 1rem',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        marginBottom:'1rem',
        color:'#4a5568',
        fontSize:'0.9rem'
      }}>
        Vue consolidée du service client : suivi des volumes, urgences, charge opérationnelle et canaux d'entrée.
      </div>

      <div style={{
        background:'white',
        borderRadius:'14px',
        padding:'1.25rem',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        marginBottom:'1rem',
        borderLeft:'5px solid #c53030'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
          <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>🚨 Alertes opérationnelles</h3>
          <span style={{fontSize:'0.8rem', color:'#718096'}}>
            Points de vigilance
          </span>
        </div>

        <div style={{display:'grid', gap:'0.65rem'}}>
          <div style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            padding:'0.8rem 0.9rem',
            background:'#fff5f5',
            border:'1px solid #fed7d7',
            borderRadius:'10px'
          }}>
            <span style={{color:'#9b2c2c', fontWeight:'600'}}>Demandes critiques</span>
            <span style={{
              background:'#c53030',
              color:'white',
              borderRadius:'999px',
              padding:'0.2rem 0.6rem',
              fontSize:'0.8rem',
              fontWeight:'700'
            }}>
              {demandesCritiques.length}
            </span>
          </div>

          <div style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            padding:'0.8rem 0.9rem',
            background:'#fffbea',
            border:'1px solid #f6e05e',
            borderRadius:'10px'
          }}>
            <span style={{color:'#975a16', fontWeight:'600'}}>Demandes hors SLA</span>
            <span style={{
              background:'#b7791f',
              color:'white',
              borderRadius:'999px',
              padding:'0.2rem 0.6rem',
              fontSize:'0.8rem',
              fontWeight:'700'
            }}>
              {demandesHorsSla.length}
            </span>
          </div>

          <div style={{
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center',
            padding:'0.8rem 0.9rem',
            background:'#fffbeb',
            border:'1px solid #fbd38d',
            borderRadius:'10px'
          }}>
            <span style={{color:'#b7791f', fontWeight:'600'}}>Demandes en cours</span>
            <span style={{
              background:'#d69e2e',
              color:'white',
              borderRadius:'999px',
              padding:'0.2rem 0.6rem',
              fontSize:'0.8rem',
              fontWeight:'700'
            }}>
              {demandesEnCours.length}
            </span>
          </div>
        </div>
      </div>

      <div style={{
        background:'white',
        borderRadius:'14px',
        padding:'1.25rem',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        marginBottom:'1rem'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
          <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>📡 Demandes entrantes récentes</h3>
          <span style={{fontSize:'0.8rem', color:'#718096'}}>
            Dernières demandes reçues
          </span>
        </div>

        <div style={{display:'grid', gap:'0.55rem'}}>
          {demandesEntrantes.length === 0 ? (
            <div style={{color:'#718096', fontSize:'0.9rem'}}>Aucune demande récente</div>
          ) : (
            demandesEntrantes.map(d => (
              <div
                key={d.id}
                style={{
                  border:'1px solid #edf2f7',
                  borderRadius:'10px',
                  padding:'0.75rem 0.85rem',
                  display:'flex',
                  justifyContent:'space-between',
                  gap:'0.75rem',
                  flexWrap:'wrap'
                }}
              >
                <span style={{fontWeight:'600', color:'#2b6cb0'}}>{d.numDemande}</span>
                <span style={{color:'#2d3748'}}>{d.nomPrenom}</span>
                <span style={{color:'#718096'}}>{d.canal || '—'}</span>
                <span style={{color:'#4a5568'}}>
                  {d.createdAt ? new Date(d.createdAt).toLocaleString('fr-FR', {
                    day:'2-digit',
                    month:'2-digit',
                    hour:'2-digit',
                    minute:'2-digit'
                  }) : '—'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem'}}>
        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
            <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>👤 Charge par agent</h3>
            <span style={{fontSize:'0.8rem', color:'#718096'}}>Répartition des demandes</span>
          </div>
          <div style={{display:'grid', gap:'0.55rem'}}>
            {chargeParAgent.length === 0 ? (
              <div style={{color:'#718096', fontSize:'0.9rem'}}>Aucune donnée</div>
            ) : (
              chargeParAgent.slice(0, 6).map(item => (
                <div key={item.agent} style={{
                  border:'1px solid #edf2f7', borderRadius:'10px',
                  padding:'0.75rem 0.85rem', display:'flex',
                  justifyContent:'space-between', alignItems:'center'
                }}>
                  <span style={{color:'#2d3748', fontWeight:'500'}}>{item.agent}</span>
                  <span style={{
                    background:'#ebf8ff', color:'#2b6cb0',
                    borderRadius:'999px', padding:'0.2rem 0.6rem',
                    fontSize:'0.8rem', fontWeight:'700'
                  }}>{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
            <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>🏢 Charge par service</h3>
            <span style={{fontSize:'0.8rem', color:'#718096'}}>Répartition opérationnelle</span>
          </div>
          <div style={{display:'grid', gap:'0.55rem'}}>
            {chargeParService.length === 0 ? (
              <div style={{color:'#718096', fontSize:'0.9rem'}}>Aucune donnée</div>
            ) : (
              chargeParService.slice(0, 6).map(item => (
                <div key={item.service} style={{
                  border:'1px solid #edf2f7', borderRadius:'10px',
                  padding:'0.75rem 0.85rem', display:'flex',
                  justifyContent:'space-between', alignItems:'center'
                }}>
                  <span style={{color:'#2d3748', fontWeight:'500'}}>{item.service}</span>
                  <span style={{
                    background:'#f0fff4', color:'#276749',
                    borderRadius:'999px', padding:'0.2rem 0.6rem',
                    fontSize:'0.8rem', fontWeight:'700'
                  }}>{item.total}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div style={{
        background:'white',
        borderRadius:'14px',
        padding:'1.25rem',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        marginBottom:'1rem'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
          <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>📡 Répartition par canal</h3>
          <span style={{fontSize:'0.8rem', color:'#718096'}}>Origine des demandes</span>
        </div>
        <div style={{display:'grid', gap:'0.55rem'}}>
          {chargeParCanal.length === 0 ? (
            <div style={{color:'#718096', fontSize:'0.9rem'}}>Aucune donnée</div>
          ) : (
            chargeParCanal.map(item => (
              <div key={item.canal} style={{
                border:'1px solid #edf2f7', borderRadius:'10px',
                padding:'0.75rem 0.85rem', display:'flex',
                justifyContent:'space-between', alignItems:'center'
              }}>
                <span style={{color:'#2d3748', fontWeight:'500'}}>{item.canal}</span>
                <span style={{
                  background:'#faf5ff', color:'#6b46c1',
                  borderRadius:'999px', padding:'0.2rem 0.6rem',
                  fontSize:'0.8rem', fontWeight:'700'
                }}>{item.total}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {(demandesCritiques.length > 0 || demandesHorsSla.length > 0) && (
        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1rem 1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
          marginBottom:'1rem',
          borderLeft:'5px solid #c53030'
        }}>
          <div style={{fontWeight:'700', color:'#1a365d', marginBottom:'0.6rem'}}>
            🚨 Points de vigilance
          </div>

          {demandesCritiques.length > 0 && (
            <div style={{color:'#c53030', marginBottom:'0.35rem'}}>
              {demandesCritiques.length} demande(s) critique(s)
            </div>
          )}

          {demandesHorsSla.length > 0 && (
            <div style={{color:'#b7791f'}}>
              {demandesHorsSla.length} demande(s) hors SLA
            </div>
          )}
        </div>
      )}

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
        <div style={styles.statCard}><h3>📋 Demandes</h3><p style={styles.statNum}>{demandesFiltrees.length}</p></div>
      </div>

      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginTop: '1.5rem'
      }}>
        <h3 style={{color:'#1a365d'}}>📊 Respect SLA par service</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={slaChartData}>
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="taux" fill="#2b6cb0" name="SLA %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '1.5rem' }}>
        <h3 style={{ color: '#1a365d', marginBottom: '1rem' }}>⏱️ Respect SLA par service</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Service</th>
              <th style={styles.th}>Demandes</th>
              <th style={styles.th}>SLA respecté</th>
              <th style={styles.th}>Taux</th>
            </tr>
          </thead>
          <tbody>
            {slaRows.map((row) => (
              <tr key={row.service} style={styles.tr}>
                <td style={styles.td}>{row.service}</td>
                <td style={styles.td}>{row.total}</td>
                <td style={styles.td}>{row.slaOk}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: row.taux >= 80 ? '#f0fff4' : row.taux >= 50 ? '#fffbeb' : '#fff5f5',
                      color: row.taux >= 80 ? '#276749' : row.taux >= 50 ? '#b7791f' : '#c53030',
                    }}
                  >
                    {row.taux}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginTop: '1.5rem' }}>
        <h3 style={{ color: '#1a365d', marginBottom: '1rem' }}>👨‍💼 Performance des agents</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Demandes</th>
              <th style={styles.th}>SLA respecté</th>
              <th style={styles.th}>Taux</th>
            </tr>
          </thead>
          <tbody>
            {agentRows.map((row) => (
              <tr key={row.agent} style={styles.tr}>
                <td style={styles.td}>{row.agent}</td>
                <td style={styles.td}>{row.total}</td>
                <td style={styles.td}>{row.slaOk}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      background: row.taux >= 80 ? '#f0fff4' : row.taux >= 50 ? '#fffbeb' : '#fff5f5',
                      color: row.taux >= 80 ? '#276749' : row.taux >= 50 ? '#b7791f' : '#c53030',
                    }}
                  >
                    {row.taux}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{marginTop:'2rem'}}>📥 Files d'attente par service</h3>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem'}}>
        {Object.entries(filesService).map(([service, s]) => (
          <div key={service} style={{
            background:'#f7fafc',
            borderRadius:'10px',
            padding:'1rem',
            border:'1px solid #e2e8f0'
          }}>
            <div style={{fontWeight:'bold',color:'#2b6cb0',marginBottom:'0.5rem'}}>
              {service}
            </div>
            <div>En cours : {s.enCours}</div>
            <div style={{color:'#c53030'}}>
              Hors SLA : {s.horsSla}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          marginTop: '1.5rem',
        }}
      >
        <h3 style={{ color: '#1a365d' }}>⭐ Satisfaction clients (NPS)</h3>

        <p style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
          Score NPS : {scoreNps}
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={npsChartData}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {npsChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
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
                { name: 'OUI', value: demandesFiltrees.filter(d => d.respectDelai === 'OUI').length, color: '#276749' },
                { name: 'NON', value: demandesFiltrees.filter(d => d.respectDelai === 'NON').length, color: '#c53030' },
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


function FileCritique() {
  const [demandes, setDemandes] = useState([])
  const [ticketOuvert, setTicketOuvert] = useState(null)
  const [timelineTicket, setTimelineTicket] = useState([])

  useEffect(() => {
    API.get('/demandes')
      .then(r => setDemandes(r.data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (ticketOuvert) {
      API.get(`/timeline/demande/${ticketOuvert.id}`)
        .then(r => setTimelineTicket(r.data))
        .catch(() => setTimelineTicket([]))
    } else {
      setTimelineTicket([])
    }
  }, [ticketOuvert])

  const critiques = demandes.filter(d =>
    ['En cours', 'En attente'].includes(d.statut) && (
      d.priorite === 'Urgent' ||
      d.respectDelai === 'NON' ||
      d.objetDemande === 'Réclamation'
    )
  )

  const f = (v) => v || '—'

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🔥 File critique</h2>
      </div>

      <div style={{
        background:'white',
        borderRadius:'12px',
        padding:'1rem',
        boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Demande</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Objet</th>
              <th style={styles.th}>Service</th>
              <th style={styles.th}>Priorité</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {critiques.length === 0 ? (
              <tr>
                <td colSpan="6" style={styles.td}>Aucune demande critique</td>
              </tr>
            ) : critiques.map(d => (
              <tr
                key={d.id}
                style={{...styles.tr, cursor:'pointer'}}
                onClick={() => setTicketOuvert(d)}
              >
                <td style={{...styles.td, color:'#2b6cb0', fontWeight:'600'}}>{f(d.numDemande)}</td>
                <td style={styles.td}>{f(d.nomPrenom)}</td>
                <td style={styles.td}>{f(d.objetDemande)}</td>
                <td style={styles.td}>{f(d.service)}</td>
                <td style={styles.td}>
                  <span style={{
                    background:'#fff5f5',
                    color:'#c53030',
                    padding:'2px 8px',
                    borderRadius:'8px',
                    fontSize:'0.75rem'
                  }}>
                    {d.priorite || 'Urgent'}
                  </span>
                </td>
                <td style={styles.td}>{f(d.statut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ticketOuvert && (
        <div style={{
          position:'fixed',
          top:0,
          right:0,
          width:'420px',
          height:'100vh',
          background:'white',
          boxShadow:'-6px 0 20px rgba(0,0,0,0.15)',
          zIndex:9999,
          padding:'1.25rem',
          overflowY:'auto'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem'}}>
            <h3 style={{margin:0}}>🎫 {ticketOuvert.numDemande}</h3>
            <button
              onClick={() => setTicketOuvert(null)}
              style={{background:'transparent', border:'none', fontSize:'1.4rem', cursor:'pointer'}}
            >
              ✕
            </button>
          </div>

          <div style={{marginBottom:'1rem'}}><strong>Client :</strong> {ticketOuvert.nomPrenom}</div>
          <div style={{marginBottom:'1rem'}}><strong>Objet :</strong> {ticketOuvert.objetDemande}</div>
          <div style={{marginBottom:'1rem'}}><strong>Service :</strong> {ticketOuvert.service || '—'}</div>
          <div style={{marginBottom:'1rem'}}><strong>Statut :</strong> {ticketOuvert.statut}</div>
          <div style={{marginBottom:'1rem'}}>
            <strong>Commentaire :</strong>
            <div style={{marginTop:'0.3rem', color:'#4a5568'}}>{ticketOuvert.commentaire || '—'}</div>
          </div>

          <div style={{marginBottom:'1rem'}}>
            <strong>Timeline :</strong>
            <div style={{marginTop:'0.6rem', display:'grid', gap:'0.55rem'}}>
              {timelineTicket.length === 0 ? (
                <div style={{color:'#718096', fontSize:'0.9rem'}}>Aucun événement</div>
              ) : (
                timelineTicket.map(t => (
                  <div key={t.id} style={{
                    border:'1px solid #e2e8f0',
                    borderRadius:'10px',
                    padding:'0.65rem 0.75rem',
                    background:'#f8fafc'
                  }}>
                    <div style={{display:'flex', justifyContent:'space-between', gap:'0.75rem'}}>
                      <span style={{fontWeight:'600', color:'#2d3748'}}>{t.action}</span>
                      <span style={{fontSize:'0.75rem', color:'#718096'}}>
                        {new Date(t.createdAt).toLocaleString('fr-FR', {
                          day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'
                        })}
                      </span>
                    </div>
                    <div style={{marginTop:'0.25rem', color:'#4a5568', fontSize:'0.85rem'}}>{t.detail || '—'}</div>
                    <div style={{marginTop:'0.2rem', color:'#718096', fontSize:'0.75rem'}}>
                      par {t.auteur}{t.canal ? ` • ${t.canal}` : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Contacts() {
  const [contacts, setContacts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [contactOuvert, setContactOuvert] = useState(null)
  const [contactDetail, setContactDetail] = useState(null)
  const [loadingContactDetail, setLoadingContactDetail] = useState(false)
  const [previewContacts, setPreviewContacts] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [formActivite, setFormActivite] = useState({
    type: 'Appel',
    date: new Date().toISOString().slice(0, 10),
    note: '',
  })
  const [savingActivite, setSavingActivite] = useState(false)
  const [formTicket, setFormTicket] = useState({
    subject: '',
    description: '',
    type: 'Information',
    priority: 'normal',
  })
  const [savingTicket, setSavingTicket] = useState(false)
  const [searchContact, setSearchContact] = useState('')
  const [filtreStatutContact, setFiltreStatutContact] = useState('')
  const [filtreProfilClient, setFiltreProfilClient] = useState('')

  const formVide = {
    name: '',
    email: '',
    phone: '',
    company: '',
    profilClient: '',
    status: 'prospect',
  }

  const [form, setForm] = useState(formVide)

  useEffect(() => {
    API.get('/contacts').then(r => setContacts(r.data)).catch(() => {})
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/contacts', form)
      setContacts([res.data, ...contacts])
      setForm(formVide)
      setShowForm(false)
    } catch (err) {
      console.error('Erreur création contact', err)
      alert('Erreur lors de la création du contact')
    }
  }

  const statusColor = (status) => {
    const map = {
      active: { background: '#f0fff4', color: '#276749' },
      prospect: { background: '#ebf8ff', color: '#2b6cb0' },
      inactive: { background: '#f7fafc', color: '#718096' },
      relance: { background: '#fff5f5', color: '#c53030' },
    }
    return map[status] || { background: '#f7fafc', color: '#718096' }
  }

  const contactsFiltres = [...contacts]
    .filter(c => {
      const q = searchContact.toLowerCase()
      const matchSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q)
      const matchStatut = !filtreStatutContact || c.status === filtreStatutContact
      const matchProfil = !filtreProfilClient || c.profilClient === filtreProfilClient
      return matchSearch && matchStatut && matchProfil
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

  const handleImportExcel = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)
    const contacts = rows.map(r => ({
      name: r.Nom || r.name || '',
      email: r.Email || '',
      phone: r.Telephone || r.Téléphone || '',
      company: r.Entreprise || '',
      status: r.Statut || 'prospect',
    }))
    setPreviewContacts(contacts)
    setShowPreview(true)
  }

  const confirmImportContacts = async () => {
    try {
      const res = await API.post('/contacts/import', previewContacts)
      const rapport = res.data
      alert(
        `Import terminé\n\nTotal : ${rapport.total}\nImportés : ${rapport.imported}\nDoublons : ${rapport.duplicates}\nIgnorés : ${rapport.skipped}\nErreurs : ${rapport.errors}`
      )
      const updated = await API.get('/contacts')
      setContacts(updated.data)
      setShowPreview(false)
      setPreviewContacts([])
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'import")
    }
  }

  const ajouterActiviteContact = async () => {
    const contactData = contactDetail || contactOuvert
    if (!contactData?.id) return
    try {
      setSavingActivite(true)
      await API.post('/activities', {
        contactId: contactData.id,
        type: formActivite.type,
        date: formActivite.date,
        note: formActivite.note,
      })
      const res = await API.get(`/contacts/${contactData.id}`)
      setContactDetail(res.data)
      setFormActivite({
        type: 'Appel',
        date: new Date().toISOString().slice(0, 10),
        note: '',
      })
    } catch (err) {
      console.error('Erreur création activité', err)
      alert("Erreur lors de l'ajout de l'activité")
    } finally {
      setSavingActivite(false)
    }
  }

  const PROFILS_CLIENTS = [
    'Participant Cadre',
    'Participant Non-cadre',
    'Participant Volontaire',
    'Participant Individuel',
    'Participant RVC',
    'Retraité',
    'Réversataire',
    'Adhérent (institution)',
    'Locataire',
    'Prospect',
    'Autres',
  ]

  const ajouterTicketContact = async () => {
    const contactData = contactDetail || contactOuvert
    if (!contactData?.id) return
    try {
      setSavingTicket(true)
      await API.post('/tickets', {
        contactId: contactData.id,
        subject: formTicket.subject,
        description: formTicket.description,
        type: formTicket.type,
        priority: formTicket.priority,
      })
      const res = await API.get(`/contacts/${contactData.id}`)
      setContactDetail(res.data)
      setFormTicket({
        subject: '',
        description: '',
        type: 'Information',
        priority: 'normal',
      })
    } catch (err) {
      console.error('Erreur création ticket', err)
      alert('Erreur lors de la création du ticket')
    } finally {
      setSavingTicket(false)
    }
  }

  const ouvrirContact = async (contact) => {
    setContactOuvert(contact)
    setContactDetail(null)
    setLoadingContactDetail(true)
    try {
      const res = await API.get(`/contacts/${contact.id}`)
      setContactDetail(res.data)
    } catch (err) {
      console.error('Erreur chargement contact', err)
      setContactDetail(contact)
    } finally {
      setLoadingContactDetail(false)
    }
  }

  const statsContacts = {
    total: contacts.length,
    actifs: contacts.filter(c => c.status === 'active').length,
    prospects: contacts.filter(c => c.status === 'prospect').length,
    aRelancer: contacts.filter(c => c.status === 'relance').length,
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>👥 Contacts</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
          <label style={{ ...styles.button, cursor: 'pointer' }}>
            Importer Excel
            <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleImportExcel} />
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Total', value: statsContacts.total, color: '#2b6cb0' },
          { label: 'Actifs', value: statsContacts.actifs, color: '#276749' },
          { label: 'Prospects', value: statsContacts.prospects, color: '#b7791f' },
          { label: 'À relancer', value: statsContacts.aRelancer, color: '#c53030' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '0.9rem 1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '0.78rem', color: '#718096' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...styles.input, maxWidth: '320px', marginBottom: 0 }}
          placeholder="Rechercher un contact"
          value={searchContact}
          onChange={e => setSearchContact(e.target.value)}
        />
        <select
          style={{ ...styles.input, maxWidth: '220px', marginBottom: 0 }}
          value={filtreStatutContact}
          onChange={e => setFiltreStatutContact(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactif</option>
          <option value="relance">À relancer</option>
        </select>
        <select
          style={{ ...styles.input, maxWidth: '240px', marginBottom: 0 }}
          value={filtreProfilClient}
          onChange={e => setFiltreProfilClient(e.target.value)}
        >
          <option value="">Tous les profils</option>
          {PROFILS_CLIENTS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <button type="button"
          onClick={() => { setSearchContact(''); setFiltreStatutContact(''); setFiltreProfilClient('') }}
          style={{ border: 'none', background: '#edf2f7', color: '#4a5568', borderRadius: '8px', padding: '0.7rem 1rem', cursor: 'pointer' }}>
          Réinitialiser
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...styles.form, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <input style={styles.input} placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <input style={styles.input} placeholder="Entreprise / Institution" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <input style={styles.input} placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input style={styles.input} placeholder="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select style={styles.input} value={form.profilClient} onChange={e => setForm({ ...form, profilClient: e.target.value })}>
            <option value="">Profil client</option>
            {PROFILS_CLIENTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select style={styles.input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option value="prospect">Prospect</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="relance">À relancer</option>
          </select>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button style={styles.button} type="submit">Enregistrer</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(formVide) }} style={{ ...styles.button, background: '#718096' }}>Annuler</button>
          </div>
        </form>
      )}

      {showPreview && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Prévisualisation import</h3>
          <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #edf2f7' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Téléphone</th>
                  <th style={styles.th}>Entreprise</th>
                  <th style={styles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {previewContacts.slice(0, 50).map((c, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{c.name}</td>
                    <td style={styles.td}>{c.email}</td>
                    <td style={styles.td}>{c.phone}</td>
                    <td style={styles.td}>{c.company}</td>
                    <td style={styles.td}>{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <button style={styles.button} onClick={confirmImportContacts}>
              Importer {previewContacts.length} contacts
            </button>
            <button style={{ ...styles.button, background: '#718096' }} onClick={() => setShowPreview(false)}>
              Annuler
            </button>
          </div>
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Téléphone</th>
            <th style={styles.th}>Entreprise</th>
            <th style={styles.th}>Profil client</th>
            <th style={styles.th}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {contactsFiltres.length === 0 ? (
            <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#718096', padding: '2rem' }}>Aucun contact</td></tr>
          ) : (
            contactsFiltres.map(c => (
              <tr key={c.id} style={{ ...styles.tr, cursor: 'pointer' }} onClick={() => ouvrirContact(c)}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.email || '—'}</td>
                <td style={styles.td}>{c.phone || '—'}</td>
                <td style={styles.td}>{c.company || '—'}</td>
                <td style={styles.td}>{c.profilClient || '—'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...statusColor(c.status) }}>{c.status || '—'}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {contactOuvert && (
        <>
          <div onClick={() => { setContactOuvert(null); setContactDetail(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '580px', maxHeight: '85vh', overflowY: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.28)', zIndex: 9999, padding: '1.5rem' }}>
            {(() => {
              const contactData = contactDetail || contactOuvert
              const timelineClient = [
                ...(contactData?.activities || []).map(a => ({
                  type: 'activité', titre: a.type || 'Activité', date: a.date || a.createdAt,
                  detail: a.note || '', color: '#6b46c1', icon: '🕘',
                })),
                ...(contactData?.deals || []).map(d => ({
                  type: 'adhésion', titre: d.typeAdhesion ? `Dossier ${d.typeAdhesion}` : "Dossier d'adhésion",
                  date: d.dateDemande || d.createdAt, detail: d.etapeAdhesion || '', color: '#2b6cb0', icon: '📋',
                })),
                ...(contactData?.tickets || []).map(t => ({
                  type: 'ticket', titre: t.subject || 'Ticket', date: t.createdAt,
                  detail: `${t.status || '—'} • ${t.priority || '—'}`, color: '#c53030', icon: '🎫',
                })),
                ...(contactData?.contracts || []).map(ct => ({
                  type: 'contrat', titre: ct.title || 'Contrat', date: ct.startDate || ct.createdAt,
                  detail: ct.status || '', color: '#276749', icon: '📄',
                })),
                ...(contactData?.events || []).map(ev => ({
                  type: 'événement', titre: ev.title || 'Événement', date: ev.date || ev.createdAt,
                  detail: ev.note || '', color: '#b7791f', icon: '📅',
                })),
              ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
              const resumeRelation = {
                deals: contactData?.deals?.length || 0,
                tickets: contactData?.tickets?.length || 0,
                activities: contactData?.activities?.length || 0,
                lastInteraction: contactData?.activities?.length
                  ? new Date(
                      [...contactData.activities]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
                    ).toLocaleDateString('fr-FR')
                  : null
              }
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1e4a7a' }}>{contactData.name}</h3>
                      {contactData.company && <div style={{ color: '#718096', fontSize: '0.9rem' }}>{contactData.company}</div>}
                    </div>
                    <button onClick={() => { setContactOuvert(null); setContactDetail(null) }} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#718096' }}>✕</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', marginBottom: '1rem' }}>
                    {[
                      { label: 'Dossiers',       value: resumeRelation.deals,                       color: '#2b6cb0' },
                      { label: 'Tickets',         value: resumeRelation.tickets,                     color: '#c53030' },
                      { label: 'Activités',       value: resumeRelation.activities,                  color: '#6b46c1' },
                      { label: 'Dernier contact', value: resumeRelation.lastInteraction || '—',      color: '#276749' },
                    ].map(card => (
                      <div key={card.label} style={{ background: 'white', borderRadius: '10px', padding: '0.7rem', borderTop: `4px solid ${card.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#718096' }}>{card.label}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: card.color }}>{card.value}</div>
                      </div>
                    ))}
                  </div>

                  {loadingContactDetail ? (
                    <div style={{ color: '#718096', padding: '1rem 0' }}>Chargement du contact…</div>
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                        {[
                          ['Email', contactData?.email],
                          ['Téléphone', contactData?.phone],
                          ['Entreprise', contactData?.company],
                          ['Profil client', contactData?.profilClient],
                          ['Statut', contactData?.status],
                        ].map(([label, val]) => (
                          <div key={label} style={{ background: '#f7fafc', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                            <div style={{ fontSize: '0.72rem', color: '#718096', marginBottom: '0.2rem' }}>{label}</div>
                            <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '500' }}>{val || '—'}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
                          <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.5rem' }}>📋 Dossiers d'adhésion</div>
                          {contactData?.deals?.length ? (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {contactData.deals.map(d => (
                                <div key={d.id} style={{ border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{d.typeAdhesion || '—'}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>{d.etapeAdhesion || '—'}</div>
                                </div>
                              ))}
                            </div>
                          ) : <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucun dossier d'adhésion</div>}
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
                          <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.5rem' }}>🎫 Tickets / demandes</div>
                          {contactData?.tickets?.length ? (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {contactData.tickets.map(t => (
                                <div key={t.id} style={{ border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{t.subject || '—'}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>{t.status || '—'} • {t.priority || '—'}</div>
                                </div>
                              ))}
                            </div>
                          ) : <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucun ticket</div>}
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
                          <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.5rem' }}>🕘 Activités</div>
                          {contactData?.activities?.length ? (
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                              {contactData.activities.map(a => (
                                <div key={a.id} style={{ border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{a.type || '—'}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>{a.date ? new Date(a.date).toLocaleDateString('fr-FR') : '—'}</div>
                                  {a.note && <div style={{ fontSize: '0.84rem', color: '#4a5568', marginTop: '0.2rem' }}>{a.note}</div>}
                                </div>
                              ))}
                            </div>
                          ) : <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucune activité</div>}
                        </div>

                        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem' }}>
                          <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.5rem' }}>📄 Contrats / Événements</div>
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            <div>
                              <div style={{ fontSize: '0.78rem', color: '#718096', marginBottom: '0.35rem' }}>Contrats</div>
                              {contactData?.contracts?.length ? contactData.contracts.map(ct => (
                                <div key={ct.id} style={{ border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.4rem' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{ct.title || '—'}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>{ct.status || '—'}</div>
                                </div>
                              )) : <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucun contrat</div>}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.78rem', color: '#718096', marginBottom: '0.35rem' }}>Événements</div>
                              {contactData?.events?.length ? contactData.events.map(ev => (
                                <div key={ev.id} style={{ border: '1px solid #edf2f7', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.4rem' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{ev.title || '—'}</div>
                                  <div style={{ fontSize: '0.82rem', color: '#718096' }}>{ev.date ? new Date(ev.date).toLocaleDateString('fr-FR') : '—'}</div>
                                </div>
                              )) : <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucun événement</div>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem', marginTop: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.6rem' }}>➕ Nouvelle activité</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '0.6rem' }}>
                          <select style={styles.input} value={formActivite.type} onChange={e => setFormActivite({ ...formActivite, type: e.target.value })}>
                            <option value="Appel">Appel</option>
                            <option value="Email">Email</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Relance">Relance</option>
                            <option value="Rendez-vous">Rendez-vous</option>
                            <option value="Note">Note</option>
                          </select>
                          <input type="date" style={styles.input} value={formActivite.date} onChange={e => setFormActivite({ ...formActivite, date: e.target.value })} />
                        </div>
                        <textarea style={{ ...styles.input, width: '100%', height: '80px', resize: 'vertical', boxSizing: 'border-box' }}
                          placeholder="Note / détail de l'activité" value={formActivite.note}
                          onChange={e => setFormActivite({ ...formActivite, note: e.target.value })} />
                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={ajouterActiviteContact} disabled={savingActivite}
                            style={{ ...styles.button, opacity: savingActivite ? 0.7 : 1, cursor: savingActivite ? 'not-allowed' : 'pointer' }}>
                            {savingActivite ? 'Enregistrement...' : 'Ajouter activité'}
                          </button>
                        </div>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem', marginTop: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.6rem' }}>🎫 Nouvelle demande client</div>
                        <input style={styles.input} placeholder="Sujet de la demande" value={formTicket.subject}
                          onChange={e => setFormTicket({ ...formTicket, subject: e.target.value })} />
                        <textarea style={{ ...styles.input, width: '100%', height: '80px', resize: 'vertical', boxSizing: 'border-box', marginTop: '0.6rem' }}
                          placeholder="Description de la demande" value={formTicket.description}
                          onChange={e => setFormTicket({ ...formTicket, description: e.target.value })} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.6rem' }}>
                          <select style={styles.input} value={formTicket.type} onChange={e => setFormTicket({ ...formTicket, type: e.target.value })}>
                            <option value="Information">Information</option>
                            <option value="Réclamation">Réclamation</option>
                            <option value="Demande prestation">Demande prestation</option>
                            <option value="Demande adhésion">Demande adhésion</option>
                            <option value="Autre">Autre</option>
                          </select>
                          <select style={styles.input} value={formTicket.priority} onChange={e => setFormTicket({ ...formTicket, priority: e.target.value })}>
                            <option value="low">Faible</option>
                            <option value="normal">Normal</option>
                            <option value="high">Urgent</option>
                          </select>
                        </div>
                        <div style={{ marginTop: '0.7rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <button onClick={ajouterTicketContact} disabled={savingTicket}
                            style={{ ...styles.button, opacity: savingTicket ? 0.7 : 1 }}>
                            {savingTicket ? 'Création...' : 'Créer ticket'}
                          </button>
                        </div>
                      </div>

                      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem', marginTop: '1rem' }}>
                        <div style={{ fontWeight: '700', color: '#1e4a7a', marginBottom: '0.6rem' }}>🧭 Timeline client</div>
                        {timelineClient.length ? (
                          <div style={{ display: 'grid', gap: '0.65rem' }}>
                            {timelineClient.map((item, index) => (
                              <div key={index} style={{ borderLeft: `4px solid ${item.color}`, background: '#f8fafc', borderRadius: '8px', padding: '0.7rem 0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{item.icon} {item.titre}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#718096' }}>
                                    {item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}
                                  </div>
                                </div>
                                {item.detail && (
                                  <div style={{ fontSize: '0.84rem', color: '#4a5568', marginTop: '0.25rem' }}>{item.detail}</div>
                                )}
                                <div style={{ fontSize: '0.72rem', color: item.color, marginTop: '0.25rem', fontWeight: '600' }}>
                                  {item.type.toUpperCase()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: '#718096', fontSize: '0.88rem' }}>Aucun historique disponible</div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

// Deals
const PROFILS_CLIENTS = [
  'Participant Cadre',
  'Participant Non-cadre',
  'Participant Volontaire',
  'Participant Individuel',
  'Participant RVC',
  'Retraité',
  'Réversataire',
  'Adhérent (institution)',
  'Locataire',
  'Prospect',
  'Autres',
]

const ETAPES_ADHESION = [
  'Prospect identifié',
  'Qualification',
  'Documents attendus',
  'Dossier en constitution',
  'Documents incomplets',
  'Dossier complet',
  'Validation CRRAE',
  'Adhésion enregistrée',
  'Adhésion activée',
]

const etapeColor = (etape) => {
  const map = {
    'Prospect identifié':    { background: '#f7fafc', color: '#718096' },
    'Qualification':         { background: '#ebf8ff', color: '#2b6cb0' },
    'Documents attendus':    { background: '#fffbeb', color: '#b7791f' },
    'Dossier en constitution': { background: '#fef3c7', color: '#92400e' },
    'Documents incomplets':  { background: '#fff5f5', color: '#c53030' },
    'Dossier complet':       { background: '#faf5ff', color: '#6b46c1' },
    'Validation CRRAE':      { background: '#e6fffa', color: '#234e52' },
    'Adhésion enregistrée':  { background: '#ebf8ff', color: '#1e4a7a' },
    'Adhésion activée':      { background: '#f0fff4', color: '#276749' },
  }
  return map[etape] || { background: '#f7fafc', color: '#718096' }
}

function Deals() {
  const [deals, setDeals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [dealOuvert, setDealOuvert] = useState(null)
  const [vueDeals, setVueDeals] = useState('tableau')
  const formVide = {
    nomPrenom: '', institution: '', pays: '', telephone: '', email: '',
    typeClient: 'Individuel', typeAdhesion: '', modeAdhesion: '',
    etapeAdhesion: 'Prospect identifié',
    documentsAttendus: '', documentsManquants: '',
    agentResponsable: '', service: '', canalAcquisition: '',
    dateDemande: '', commentaire: '',
  }
  const [form, setForm] = useState(formVide)

  useEffect(() => { API.get('/deals').then(r => setDeals(r.data)).catch(() => {}) }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await API.post('/deals', form)
      setDeals([res.data, ...deals])
      setForm(formVide)
      setShowForm(false)
    } catch (err) {
      console.error('Erreur création deal', err)
      alert('Erreur lors de la création')
    }
  }

  const handleUpdate = async (id, data) => {
    const updatedData = { ...data }

    if (data.documentsManquants !== undefined) {
      if (data.documentsManquants && data.documentsManquants.trim() !== '') {
        updatedData.etapeAdhesion = 'Documents incomplets'
      }
      if (!data.documentsManquants || data.documentsManquants.trim() === '') {
        updatedData.etapeAdhesion = 'Dossier en constitution'
      }
    }

    try {
      const res = await API.put(`/deals/${id}`, updatedData)
      setDeals(deals.map(d => d.id === id ? res.data : d))
      setDealOuvert(res.data)
    } catch (err) {
      console.error('Erreur mise à jour deal', err)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce dossier ?')) return
    try {
      await API.delete(`/deals/${id}`)
      setDeals(deals.filter(d => d.id !== id))
      setDealOuvert(null)
    } catch {}
  }

  const inp = { ...styles.input, marginBottom: '0.5rem' }

  const colonnesDeals = [
    'Prospect identifié',
    'Qualification',
    'Documents attendus',
    'Dossier en constitution',
    'Documents incomplets',
    'Dossier complet',
    'Validation CRRAE',
    'Adhésion enregistrée',
    'Adhésion activée',
  ]

  const dealsParEtape = colonnesDeals.map((etape) => ({
    etape,
    items: deals.filter(d => (d.etapeAdhesion || 'Prospect identifié') === etape)
  }))

  const documentsParTypeEtAdhesion = {
    'Participant Individuel': {
      RVC: `• Bulletin d'adhésion à titre individuel RVC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      RRPC: `• Bulletin d'adhésion à titre individuel RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      RCPNC: `• Bulletin d'adhésion à titre individuel RCPNC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      'FAAM RRPC': `• Bulletin d'adhésion à titre individuel FAAM RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      'FAAM RCPNC': `• Bulletin d'adhésion à titre individuel FAAM RCPNC (à élaborer)\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
    },
    'Participant Volontaire': {
      RVC: `• Bulletin d'adhésion à titre individuel RVC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      RRPC: `• Bulletin d'adhésion à titre individuel RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      RCPNC: `• Bulletin d'adhésion à titre individuel RCPNC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      'FAAM RRPC': `• Bulletin d'adhésion à titre individuel FAAM RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
      'FAAM RCPNC': `• Bulletin d'adhésion à titre individuel FAAM RCPNC (à élaborer)\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
    },
    'Adhérent (institution)': {
      RVC: `• État du personnel des salariés RCPNC\n• État du personnel des salariés RRPC\n• Bulletin d'adhésion RVC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation familiale\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans\n• Courrier de demande d'adhésion à faire par l'adhérent`,
      RRPC: `• État du personnel des salariés RRPC\n• Bulletin d'adhésion RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation familiale\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans\n• Courrier de demande d'adhésion à faire par l'adhérent`,
      RCPNC: `• État du personnel des salariés RCPNC\n• Bulletin d'adhésion RCPNC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation familiale\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans\n• Courrier de demande d'adhésion à faire par l'adhérent`,
      'FAAM RRPC': `• Bulletin d'adhésion FAAM RRPC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation familiale\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans\n• Courrier de demande d'adhésion à faire par l'adhérent`,
      'FAAM RCPNC': `• Bulletin d'adhésion FAAM RCPNC (à élaborer)\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation familiale\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans\n• Courrier de demande d'adhésion à faire par l'adhérent`,
    },
    'Participant RVC': {
      RVC: `• Bulletin d'adhésion à titre individuel RVC\n• Fiche de reconstitution de périodes d'assurance vieillesse\n• Fiche de situation de famille\n• Engagement de cotiser pour satisfaire la durée minimale de 10 ans`,
    },
  }

  const statsPipeline = colonnesDeals.map(etape => ({
    etape,
    total: deals.filter(d => (d.etapeAdhesion || 'Prospect identifié') === etape).length
  }))

  const getDocumentsAttendus = (typeClient, typeAdhesion) => {
    if (documentsParTypeEtAdhesion?.[typeClient]?.[typeAdhesion]) {
      return documentsParTypeEtAdhesion[typeClient][typeAdhesion]
    }

    if (
      (typeClient === 'Participant Cadre' || typeClient === 'Participant Non-cadre') &&
      documentsParTypeEtAdhesion['Adhérent (institution)']?.[typeAdhesion]
    ) {
      return documentsParTypeEtAdhesion['Adhérent (institution)'][typeAdhesion]
    }

    return ''
  }

  const statutDossier = (deal) => {
    const hasMissingDocs = deal.documentsManquants && deal.documentsManquants.trim() !== ''
    if (hasMissingDocs) {
      return { label: 'Dossier incomplet', style: { background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' } }
    }
    return { label: 'Dossier complet', style: { background: '#f0fff4', color: '#276749', border: '1px solid #9ae6b4' } }
  }

  const avancerEtapeDeal = (deal) => {
    const index = colonnesDeals.indexOf(deal.etapeAdhesion || 'Prospect identifié')
    if (index === -1 || index === colonnesDeals.length - 1) return
    const prochaineEtape = colonnesDeals[index + 1]
    handleUpdate(deal.id, { etapeAdhesion: prochaineEtape })
  }

  const reculerEtapeDeal = (deal) => {
    const index = colonnesDeals.indexOf(deal.etapeAdhesion || 'Prospect identifié')
    if (index <= 0) return
    const etapePrecedente = colonnesDeals[index - 1]
    handleUpdate(deal.id, { etapeAdhesion: etapePrecedente })
  }

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📋 Dossiers d'adhésion</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={{ ...styles.button, background: vueDeals === 'tableau' ? '#1e4a7a' : '#718096' }}
            type="button" onClick={() => setVueDeals('tableau')}>
            📋 Tableau
          </button>
          <button style={{ ...styles.button, background: vueDeals === 'pipeline' ? '#1e4a7a' : '#718096' }}
            type="button" onClick={() => setVueDeals('pipeline')}>
            🧩 Pipeline
          </button>
          <button style={styles.button} onClick={() => setShowForm(!showForm)}>
            + Nouveau dossier
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...styles.form, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <input style={inp} placeholder="Nom & Prénom *" value={form.nomPrenom} onChange={e => setForm({...form, nomPrenom: e.target.value})} required />
          <input style={inp} placeholder="Institution / Employeur" value={form.institution} onChange={e => setForm({...form, institution: e.target.value})} />
          <input style={inp} placeholder="Pays" value={form.pays} onChange={e => setForm({...form, pays: e.target.value})} />
          <input style={inp} placeholder="Téléphone" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} />
          <input style={inp} placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <select style={inp} value={form.typeClient} onChange={e => {
            const typeClient = e.target.value
            setForm({ ...form, typeClient, documentsAttendus: getDocumentsAttendus(typeClient, form.typeAdhesion) })
          }}>
            <option value="">Profil client</option>
            {PROFILS_CLIENTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select style={inp} value={form.typeAdhesion} onChange={e => {
            const typeAdhesion = e.target.value
            setForm({ ...form, typeAdhesion, documentsAttendus: getDocumentsAttendus(form.typeClient, typeAdhesion) })
          }}>
            <option value="">Type d'adhésion</option>
            <option value="RRPC">RRPC</option>
            <option value="RCPNC">RCPNC</option>
            <option value="RVC">RVC</option>
            <option value="FAAM RRPC">FAAM RRPC</option>
            <option value="FAAM RCPNC">FAAM RCPNC</option>
          </select>
          <select style={inp} value={form.modeAdhesion} onChange={e => setForm({...form, modeAdhesion: e.target.value})}>
            <option value="">Mode d'adhésion</option>
            <option value="Via employeur">Via employeur</option>
            <option value="Individuelle">Individuelle</option>
            <option value="Migration interne">Migration interne</option>
          </select>
          <select style={inp} value={form.etapeAdhesion} onChange={e => setForm({...form, etapeAdhesion: e.target.value})}>
            {ETAPES_ADHESION.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input style={inp} placeholder="Agent responsable" value={form.agentResponsable} onChange={e => setForm({...form, agentResponsable: e.target.value})} />
          <select style={inp} value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
            <option value="">Service</option>
            <option value="DCR">DCR</option>
            <option value="DPR">DPR</option>
          </select>
          <select style={inp} value={form.canalAcquisition} onChange={e => setForm({...form, canalAcquisition: e.target.value})}>
            <option value="">Canal d'acquisition</option>
            <option value="Email">Email</option>
            <option value="Téléphone">Téléphone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Présentiel">Présentiel</option>
          </select>
          <input style={inp} type="date" placeholder="Date demande" value={form.dateDemande} onChange={e => setForm({...form, dateDemande: e.target.value})} />
          <div style={{ gridColumn: '1 / -1' }}>
            <textarea style={{ ...inp, width: '100%', height: '60px', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Documents attendus" value={form.documentsAttendus}
              onChange={e => setForm({...form, documentsAttendus: e.target.value})} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <textarea style={{ ...inp, width: '100%', height: '60px', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Documents manquants" value={form.documentsManquants}
              onChange={e => setForm({...form, documentsManquants: e.target.value})} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <textarea style={{ ...inp, width: '100%', height: '60px', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Commentaire" value={form.commentaire}
              onChange={e => setForm({...form, commentaire: e.target.value})} />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
            <button style={styles.button} type="submit">💾 Enregistrer</button>
            <button style={{ ...styles.button, background: '#718096' }} type="button" onClick={() => { setShowForm(false); setForm(formVide) }}>Annuler</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {statsPipeline.map(s => (
          <div key={s.etape} style={{ background: 'white', borderRadius: '10px', padding: '0.75rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginBottom: '0.2rem' }}>{s.etape}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e4a7a' }}>{s.total}</div>
          </div>
        ))}
      </div>

      {vueDeals === 'tableau' ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Nom / Institution</th>
              <th style={styles.th}>Pays</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Adhésion</th>
              <th style={styles.th}>Dossier</th>
              <th style={styles.th}>Étape</th>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Date demande</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 && (
              <tr>
                <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#718096', padding: '2rem' }}>
                  Aucun dossier
                </td>
              </tr>
            )}
            {deals.map(d => (
              <tr key={d.id} style={{ ...styles.tr, cursor: 'pointer' }} onClick={() => setDealOuvert(d)}>
                <td style={styles.td}>
                  <div style={{ fontWeight: '600', color: '#2d3748' }}>{d.nomPrenom}</div>
                  {d.institution && <div style={{ fontSize: '0.8rem', color: '#718096' }}>{d.institution}</div>}
                </td>
                <td style={styles.td}>{d.pays || '—'}</td>
                <td style={styles.td}>{d.typeClient || '—'}</td>
                <td style={styles.td}>{d.typeAdhesion || '—'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...statutDossier(d).style }}>{statutDossier(d).label}</span>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...etapeColor(d.etapeAdhesion) }}>{d.etapeAdhesion || '—'}</span>
                  {d.documentsManquants && (
                    <span style={{ marginLeft: '0.4rem', color: '#c53030', fontSize: '0.78rem', fontWeight: '600' }}>⚠ Docs manquants</span>
                  )}
                </td>
                <td style={styles.td}>{d.agentResponsable || '—'}</td>
                <td style={styles.td}>{d.dateDemande ? new Date(d.dateDemande).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, minmax(240px, 1fr))',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {dealsParEtape.map(col => (
            <div key={col.etape} style={{
              background: '#f7fafc',
              borderRadius: '12px',
              padding: '0.75rem',
              minHeight: '420px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: '700', color: '#1e4a7a', fontSize: '0.92rem' }}>{col.etape}</div>
                <div style={{ fontSize: '0.78rem', color: '#718096' }}>{col.items.length} dossier(s)</div>
              </div>
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {col.items.map(d => (
                  <div key={d.id} onClick={() => setDealOuvert(d)} style={{
                    background: 'white',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    border: d.documentsManquants ? '1px solid #feb2b2' : '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontWeight: '600', color: '#2d3748', marginBottom: '0.25rem' }}>{d.nomPrenom}</div>
                    {d.institution && (
                      <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.35rem' }}>{d.institution}</div>
                    )}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                      {d.typeClient && (
                        <span style={{ ...styles.badge, background: '#ebf8ff', color: '#2b6cb0' }}>{d.typeClient}</span>
                      )}
                      {d.typeAdhesion && (
                        <span style={{ ...styles.badge, background: '#f0fff4', color: '#276749' }}>{d.typeAdhesion}</span>
                      )}
                    </div>
                    <div style={{ marginBottom: '0.45rem' }}>
                      <span style={{ ...styles.badge, ...statutDossier(d).style }}>{statutDossier(d).label}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#4a5568', marginBottom: '0.25rem' }}>{d.agentResponsable || 'Non assigné'}</div>
                    <div style={{ fontSize: '0.76rem', color: '#718096' }}>
                      {d.dateDemande ? new Date(d.dateDemande).toLocaleDateString('fr-FR') : '—'}
                    </div>
                    {d.documentsManquants && (
                      <div style={{ marginTop: '0.55rem', fontSize: '0.75rem', color: '#c53030', fontWeight: '600' }}>
                        ⚠ Documents manquants
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.65rem' }}>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); reculerEtapeDeal(d) }}
                        style={{ flex: 1, border: '1px solid #e2e8f0', background: 'white', color: '#4a5568', borderRadius: '8px', padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                        ← Reculer
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); avancerEtapeDeal(d) }}
                        style={{ flex: 1, border: 'none', background: '#1e4a7a', color: 'white', borderRadius: '8px', padding: '0.35rem 0.5rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                        Avancer →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {dealOuvert && (
        <>
          <div onClick={() => setDealOuvert(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', maxHeight: '85vh', overflowY: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', zIndex: 9999, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e4a7a' }}>{dealOuvert.nomPrenom}</h3>
                {dealOuvert.institution && <div style={{ color: '#718096', fontSize: '0.9rem' }}>{dealOuvert.institution}</div>}
              </div>
              <button onClick={() => setDealOuvert(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              {[
                ['Pays', dealOuvert.pays],
                ['Téléphone', dealOuvert.telephone],
                ['Email', dealOuvert.email],
                ['Type client', dealOuvert.typeClient],
                ['Type adhésion', dealOuvert.typeAdhesion],
                ['Mode adhésion', dealOuvert.modeAdhesion],
                ['Agent', dealOuvert.agentResponsable],
                ['Service', dealOuvert.service],
                ['Canal', dealOuvert.canalAcquisition],
                ['Date demande', dealOuvert.dateDemande ? new Date(dealOuvert.dateDemande).toLocaleDateString('fr-FR') : '—'],
                ['Date validation', dealOuvert.dateValidation ? new Date(dealOuvert.dateValidation).toLocaleDateString('fr-FR') : '—'],
                ['Date activation', dealOuvert.dateActivation ? new Date(dealOuvert.dateActivation).toLocaleDateString('fr-FR') : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: '#f7fafc', borderRadius: '6px', padding: '0.5rem 0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#718096', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '500' }}>{val || '—'}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#718096', marginBottom: '0.4rem', fontWeight: '600' }}>ÉTAPE</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {ETAPES_ADHESION.map(e => (
                  <button key={e} onClick={() => handleUpdate(dealOuvert.id, { etapeAdhesion: e })}
                    style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: '0.8rem',
                      ...(dealOuvert.etapeAdhesion === e ? etapeColor(e) : { background: 'white', color: '#4a5568' }) }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {dealOuvert.documentsAttendus && (
              <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#b7791f', fontWeight: '600', marginBottom: '0.25rem' }}>DOCUMENTS ATTENDUS</div>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: '#744210', whiteSpace: 'pre-wrap' }}>{dealOuvert.documentsAttendus}</pre>
              </div>
            )}
            {dealOuvert.documentsManquants && (
              <div style={{ background: '#fff5f5', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#c53030', fontWeight: '600', marginBottom: '0.25rem' }}>DOCUMENTS MANQUANTS</div>
                <pre style={{ margin: 0, fontSize: '0.85rem', color: '#742a2a', whiteSpace: 'pre-wrap' }}>{dealOuvert.documentsManquants}</pre>
              </div>
            )}
            {dealOuvert.commentaire && (
              <div style={{ background: '#f0fff4', borderRadius: '8px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#276749', fontWeight: '600', marginBottom: '0.25rem' }}>COMMENTAIRE</div>
                <div style={{ fontSize: '0.85rem', color: '#2d3748' }}>{dealOuvert.commentaire}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => handleDelete(dealOuvert.id)}
                style={{ background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2', borderRadius: '6px', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


// Campagnes
function Campagnes() {
  const [campagnes, setCampagnes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [campagneOuverte, setCampagneOuverte] = useState(null)
  const [searchCampagne, setSearchCampagne] = useState('')
  const [filtreStatutCampagne, setFiltreStatutCampagne] = useState('')
  const [targets, setTargets] = useState([])

  const formVide = {
    name: '',
    canal: 'email',
    statut: 'draft',
    profilClient: '',
    subject: '',
    content: '',
    dateEnvoi: '',
  }

  const [form, setForm] = useState(formVide)

  useEffect(() => {
    API.get('/campaigns').then(r => setCampagnes(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (campagneOuverte?.id) {
      API.get(`/campaigns/${campagneOuverte.id}/targets`)
        .then(r => setTargets(r.data))
        .catch(() => setTargets([]))
    } else {
      setTargets([])
    }
  }, [campagneOuverte])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...form, status: form.statut }
      const res = await API.post('/campaigns', payload)
      setCampagnes([res.data, ...campagnes])
      setForm(formVide)
      setShowForm(false)
    } catch (err) {
      console.error('Erreur création campagne', err)
      alert('Erreur lors de la création de la campagne')
    }
  }

  const statusColor = (status) => {
    const map = {
      draft:     { background: '#f7fafc', color: '#718096' },
      planned:   { background: '#ebf8ff', color: '#2b6cb0' },
      active:    { background: '#f0fff4', color: '#276749' },
      paused:    { background: '#fffbeb', color: '#b7791f' },
      completed: { background: '#faf5ff', color: '#6b46c1' },
    }
    return map[status] || map.draft
  }

  const typeColor = (type) => {
    const map = {
      email:     { background: '#ebf8ff', color: '#2b6cb0' },
      sms:       { background: '#faf5ff', color: '#6b46c1' },
      whatsapp:  { background: '#f0fff4', color: '#276749' },
      social:    { background: '#fff5f5', color: '#c53030' },
      multicanal:{ background: '#fffbeb', color: '#b7791f' },
    }
    return map[type] || map.email
  }

  const statsCampagnes = {
    total:     campagnes.length,
    actives:   campagnes.filter(c => c.status === 'active').length,
    brouillons:campagnes.filter(c => c.status === 'draft').length,
    terminees: campagnes.filter(c => c.status === 'completed').length,
  }

  const campagnesFiltrees = [...campagnes]
    .filter(c => {
      const q = searchCampagne.toLowerCase()
      const matchSearch = !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.segment || '').toLowerCase().includes(q) ||
        (c.subject || '').toLowerCase().includes(q)
      const matchStatut = !filtreStatutCampagne || c.status === filtreStatutCampagne
      return matchSearch && matchStatut
    })
    .sort((a, b) => new Date(b.sentAt || b.createdAt || 0) - new Date(a.sentAt || a.createdAt || 0))

  return (
    <div>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📣 Campagnes</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Total',      value: statsCampagnes.total,      color: '#2b6cb0' },
          { label: 'Actives',    value: statsCampagnes.actives,    color: '#276749' },
          { label: 'Brouillons', value: statsCampagnes.brouillons, color: '#b7791f' },
          { label: 'Terminées',  value: statsCampagnes.terminees,  color: '#6b46c1' },
        ].map(card => (
          <div key={card.label} style={{ background: 'white', borderRadius: '12px', padding: '0.9rem 1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderTop: `4px solid ${card.color}` }}>
            <div style={{ fontSize: '0.78rem', color: '#718096' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '700', color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input style={{ ...styles.input, maxWidth: '320px', marginBottom: 0 }} placeholder="Rechercher une campagne"
          value={searchCampagne} onChange={e => setSearchCampagne(e.target.value)} />
        <select style={{ ...styles.input, maxWidth: '220px', marginBottom: 0 }}
          value={filtreStatutCampagne} onChange={e => setFiltreStatutCampagne(e.target.value)}>
          <option value="">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="planned">Planifiée</option>
          <option value="active">Active</option>
          <option value="paused">En pause</option>
          <option value="completed">Terminée</option>
        </select>
        <button type="button" onClick={() => { setSearchCampagne(''); setFiltreStatutCampagne('') }}
          style={{ border: 'none', background: '#edf2f7', color: '#4a5568', borderRadius: '8px', padding: '0.7rem 1rem', cursor: 'pointer' }}>
          Réinitialiser
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ ...styles.form, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <input style={styles.input} placeholder="Nom de la campagne *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select style={styles.input} value={form.canal} onChange={e => setForm({ ...form, canal: e.target.value })}>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
          <select style={styles.input} value={form.profilClient} onChange={e => setForm({ ...form, profilClient: e.target.value })}>
            <option value="">Tous les profils</option>
            {PROFILS_CLIENTS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select style={styles.input} value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })}>
            <option value="draft">Brouillon</option>
            <option value="planned">Planifiée</option>
            <option value="active">Active</option>
            <option value="completed">Terminée</option>
          </select>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#718096', display: 'block', marginBottom: '0.2rem' }}>Date d'envoi</label>
            <input type="date" style={{ ...styles.input, marginBottom: 0 }} value={form.dateEnvoi} onChange={e => setForm({ ...form, dateEnvoi: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <input style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
              placeholder="Sujet / objet du message"
              value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <textarea style={{ ...styles.input, width: '100%', height: '120px', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="Message à envoyer" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', gridColumn: '1 / -1' }}>
            <button style={styles.button} type="submit">Enregistrer</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(formVide) }} style={{ ...styles.button, background: '#718096' }}>Annuler</button>
          </div>
        </form>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nom</th>
            <th style={styles.th}>Canal</th>
            <th style={styles.th}>Statut</th>
            <th style={styles.th}>Cible</th>
            <th style={styles.th}>Début</th>
            <th style={styles.th}>Fin</th>
          </tr>
        </thead>
        <tbody>
          {campagnesFiltrees.length === 0 ? (
            <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', color: '#718096', padding: '2rem' }}>Aucune campagne</td></tr>
          ) : (
            campagnesFiltrees.map(c => (
              <tr key={c.id} style={{ ...styles.tr, cursor: 'pointer' }} onClick={() => setCampagneOuverte(c)}>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}><span style={{ ...styles.badge, ...typeColor(c.type) }}>{c.type}</span></td>
                <td style={styles.td}><span style={{ ...styles.badge, ...statusColor(c.status) }}>{c.status}</span></td>
                <td style={styles.td}>{c.segment || '—'}</td>
                <td style={styles.td}>{c.startDate ? new Date(c.startDate).toLocaleDateString('fr-FR') : '—'}</td>
                <td style={styles.td}>{c.endDate ? new Date(c.endDate).toLocaleDateString('fr-FR') : '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {campagneOuverte && (
        <>
          <div onClick={() => setCampagneOuverte(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '540px', maxHeight: '85vh', overflowY: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.28)', zIndex: 9999, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#1e4a7a' }}>{campagneOuverte.name}</h3>
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ ...styles.badge, ...typeColor(campagneOuverte.type) }}>{campagneOuverte.type}</span>
                  <span style={{ ...styles.badge, ...statusColor(campagneOuverte.status) }}>{campagneOuverte.status}</span>
                </div>
              </div>
              <button onClick={() => setCampagneOuverte(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                ['Profil ciblé', campagneOuverte.profilClient || 'Tous'],
                ['Contacts ciblés', targets.length],
                ['Canal', campagneOuverte.canal || '—'],
                ['Statut', campagneOuverte.statut || campagneOuverte.status || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: '#f7fafc', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#718096', marginBottom: '0.2rem' }}>{label}</div>
                  <div style={{ fontSize: '0.9rem', color: '#2d3748', fontWeight: '500' }}>{val ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
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
        (telephone &&
          telephone.length >= 6 &&
          d.telephone &&
          d.telephone.replace(/[^0-9]/g, '').includes(telephone.replace(/[^0-9]/g, ''))) ||
        (matricule &&
          matricule.length >= 4 &&
          d.matricule &&
          d.matricule === matricule) ||
        (d.email && client?.email && d.email.toLowerCase() === client.email.toLowerCase())
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
        <div style={{display:'flex', gap:'0.5rem', textAlign:'center', flexShrink:0, alignItems:'flex-start'}}>
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
          <button onClick={onClose} style={{background:'transparent', border:'none', fontSize:'1.25rem', cursor:'pointer', color:'#276749', lineHeight:1, padding:'0.25rem'}} title="Fermer la fiche">✕</button>
        </div>
      </div>
      {demandes.length > 0 && (
        <div style={{marginTop:'0.75rem', borderTop:'1px solid #9ae6b4', paddingTop:'0.75rem'}}>
          <div style={{fontSize:'0.8rem', color:'#276749', fontWeight:'600', marginBottom:'0.5rem'}}>DERNIÈRES DEMANDES</div>
          <div style={{display:'flex', flexDirection:'column', gap:'0.4rem'}}>
            {demandes.slice(0,5).map(d => (
              <div key={d.id} style={{background:'white', borderRadius:'6px', padding:'0.5rem 0.75rem', display:'flex', justifyContent:'space-between', fontSize:'0.82rem'}}>
                <span style={{color:'#2b6cb0', fontWeight:'600'}}>{d.numDemande}</span>
                <span style={{color:'#4a5568'}}>{d.objetDemande}</span>
                <span style={{color:'#718096'}}>{d.dateReception ? new Date(d.dateReception).toLocaleDateString('fr-FR') : ''}</span>
                <span style={{background: d.statut==='Traité'?'#f0fff4':'#fffbeb', color: d.statut==='Traité'?'#276749':'#b7791f', padding:'0.1rem 0.4rem', borderRadius:'20px'}}>{d.statut}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:'0.75rem', display:'flex', gap:'0.75rem', flexWrap:'wrap'}}>
            <span style={{background:'#fff5f5', color:'#c53030', padding:'0.25rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem'}}>
              Réclamations : {demandes.filter(d => d.objetDemande === 'Réclamation').length}
            </span>
            <span style={{background:'#ebf8ff', color:'#2b6cb0', padding:'0.25rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem'}}>
              Infos : {demandes.filter(d => d.objetDemande === 'Information').length}
            </span>
            <span style={{background:'#fffbeb', color:'#b7791f', padding:'0.25rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem'}}>
              En cours : {demandes.filter(d => d.statut === 'En cours').length}
            </span>
            <span style={{background:'#f0fff4', color:'#276749', padding:'0.25rem 0.6rem', borderRadius:'20px', fontSize:'0.75rem'}}>
              Traitée(s) : {demandes.filter(d => d.statut === 'Traité').length}
            </span>
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
    if (!texte || !texte.trim()) {
      alert('Veuillez saisir une note')
      return
    }
    try {
      console.log('AJOUT NOTE PAYLOAD', {
        demandeId: demande?.id,
        auteur,
        contenu: texte
      })
      const res = await API.post('/commentaires', {
        demandeId: demande.id,
        auteur,
        contenu: texte.trim(),
      })
      console.log('AJOUT NOTE OK', res.data)
      setCommentaires((prev) => [res.data, ...prev])
      setTexte('')
    } catch (err) {
      console.error('ERREUR AJOUT NOTE', err)
      alert("Erreur lors de l'enregistrement de la note")
    }
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
                  <div style={{color:'#718096', fontSize:'0.75rem', marginTop:'0.2rem'}}>
                    par {t.auteur}{t.canal ? ` • canal : ${t.canal}` : ''}
                  </div>
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

function Demandes({ onOpenCommentaires, onAssigner, ouvrirNouvelleDemande, onNouvelleDemandeOuverte }) {
  const [demandes, setDemandes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterCanal, setFilterCanal] = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterTypeClient, setFilterTypeClient] = useState('')
  const [filterObjet, setFilterObjet] = useState('')
  const [filterDateDebut, setFilterDateDebut] = useState('')
  const [filterDateFin, setFilterDateFin] = useState('')
  const [showFiltres, setShowFiltres] = useState(false)
  const [filtresColonnes, setFiltresColonnes] = useState({})
  const [colonneActive, setColonneActive] = useState(null)
  const emptyForm = {
    nomPrenom: '', matricule: '', adherent: '', typeClient: 'Actif', profilClient: '', pays: '',
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
  const [clientActif, setClientActif] = useState(null)
  const [ticketOuvert, setTicketOuvert] = useState(null)
  const [timelineTicket, setTimelineTicket] = useState([])
  const [showClient, setShowClient] = useState(false)
  const [importData, setImportData] = useState(null) // { lignes, doublons, aImporter }
  const [ficheSearch, setFicheSearch] = useState({
    telephone: '',
    matricule: '',
    email: '',
    nomPrenom: '',
    numDemande: '',
  })
  useEffect(() => { API.get('/demandes').then(r => setDemandes(r.data)).catch(() => {}) }, [])

  useEffect(() => {
    if (ticketOuvert) {
      API.get(`/timeline/demande/${ticketOuvert.id}`)
        .then(r => setTimelineTicket(r.data))
        .catch(() => setTimelineTicket([]))
    } else {
      setTimelineTicket([])
    }
  }, [ticketOuvert])

  useEffect(() => {
    const demandeRechercheeId = localStorage.getItem('demandeRechercheeId')
    if (demandeRechercheeId && demandes.length > 0) {
      const demandeTrouvee = demandes.find(d => d.id === demandeRechercheeId)
      if (demandeTrouvee) {
        onOpenCommentaires(demandeTrouvee)
      }
      localStorage.removeItem('demandeRechercheeId')
    }
  }, [demandes, onOpenCommentaires])

  useEffect(() => {
    if (ouvrirNouvelleDemande) {
      setShowForm(true)
      if (onNouvelleDemandeOuverte) onNouvelleDemandeOuverte()
    }
  }, [ouvrirNouvelleDemande, onNouvelleDemandeOuverte])

  useEffect(() => {
    const fermerMenus = () => setColonneActive(null)
    window.addEventListener('click', fermerMenus)
    return () => window.removeEventListener('click', fermerMenus)
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        const ancienneDemande = demandes.find(d => d.id === editId)

        const payload = {
          ...form,
          dateReception: form.dateReception ? new Date(form.dateReception).toISOString() : null,
          dateTraitement: form.dateTraitement ? new Date(form.dateTraitement).toISOString() : null,
          noteSatisfaction: form.noteSatisfaction !== '' && form.noteSatisfaction !== null && form.noteSatisfaction !== undefined
            ? parseInt(form.noteSatisfaction, 10) : null,
        }
        const res = await API.put(`/demandes/${editId}`, payload)
        setDemandes(demandes.map(d => d.id === editId ? res.data : d))

        await API.post('/timeline', {
          demandeId: editId,
          auteur: localStorage.getItem('userName') || 'Agent',
          action: 'Modification',
          canal: form.canal,
          detail: `Statut: ${form.statut} — ${form.actionMenee || 'Mise à jour'}`,
        }).catch(() => {})

        // Enquête automatique quand statut passe à Traité
        if (ancienneDemande && ancienneDemande.statut !== 'Traité' && res.data.statut === 'Traité' && !res.data.enqueteEnvoyee) {
          // Email → envoi immédiat via mailto
          // WhatsApp/Appel → géré par polling whatsapp-instance.js (pas d'action ici)
          if (res.data.canal === 'Email' && res.data.email) {
            envoyerEnquete(res.data, true)
          }
        }

        setEditId(null)
      } else {
        const createPayload = {
          ...form,
          dateReception: form.dateReception ? new Date(form.dateReception).toISOString() : null,
          dateTraitement: form.dateTraitement ? new Date(form.dateTraitement).toISOString() : null,
          noteSatisfaction: form.noteSatisfaction !== '' && form.noteSatisfaction !== null && form.noteSatisfaction !== undefined
            ? parseInt(form.noteSatisfaction, 10) : null,
        }
        const res = await API.post('/demandes', createPayload)
        setDemandes([res.data, ...demandes])
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch(err) { alert("Erreur enregistrement : " + (err?.response?.data?.message || err?.message || JSON.stringify(err))) }
  }

  const handleEdit = (d) => {
    setEditId(d.id)
    setForm({
      nomPrenom: d.nomPrenom || '', matricule: d.matricule || '',
      adherent: d.adherent || '', typeClient: d.typeClient || 'Actif', profilClient: d.profilClient || '',
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

  const ENQUETE_URL = 'https://thriving-cassata-92f38e.netlify.app'

  const envoyerEnquete = async (d, auto = false) => {
    if (!auto && !window.confirm("Envoyer l'enquête de satisfaction au client ?")) return
    const lien = `${ENQUETE_URL}?ref=${d.numDemande}`
    try {
      await API.post('/timeline', {
        demandeId: d.id,
        auteur: localStorage.getItem('userName') || 'Agent',
        action: 'Enquête envoyée',
        canal: d.canal || 'CRM',
        detail: `Enquête de satisfaction envoyée (${d.canal || '?'})`
      })
    } catch (e) {}
    await API.put(`/demandes/${d.id}`, { enqueteEnvoyee: true }).catch(() => {})
    // WhatsApp / Appel → géré par le polling whatsapp-instance.js
    // Email → ouvre le client mail
    if (d.canal === 'Email' && d.email) {
      const sujet = `Évaluation de votre demande ${d.numDemande} — CRRAE-UMOA`
      const corps = `Bonjour,%0D%0A%0D%0AVotre demande n°${d.numDemande} a été traitée par nos services.%0D%0A%0D%0ANous vous invitons à évaluer la qualité de notre traitement :%0D%0A%0D%0A👉 ${lien}%0D%0A%0D%0AVotre retour est précieux.%0D%0A%0D%0ACordialement,%0D%0AService Client CRRAE-UMOA`
      window.open(`mailto:${d.email}?subject=${sujet}&body=${corps}`)
    }
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

  const handleImportExcel = (e) => {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    const reader = new FileReader()
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

      const lignes = rows.map(r => ({
        nomPrenom: r['Nom & Prénom'] || r['nomPrenom'] || '',
        matricule: r['Matricule'] || r['matricule'] || '',
        adherent: r['Adhérent'] || r['adherent'] || '',
        typeClient: r['Type client'] || r['typeClient'] || 'Actif',
        pays: r['Pays'] || r['pays'] || '',
        telephone: String(r['Téléphone'] || r['telephone'] || ''),
        email: r['Email'] || r['email'] || '',
        heureAppel: r['Heure appel'] || r['heureAppel'] || '',
        canal: r['Canal'] || r['canal'] || 'WhatsApp',
        objetDemande: r['Objet'] || r['objetDemande'] || 'Information',
        commentaire: r['Commentaire'] || r['commentaire'] || '',
        agentN1: r['Agent N1'] || r['agentN1'] || '',
        service: r['Service'] || r['service'] || '',
        agentN2: r['Agent N2'] || r['agentN2'] || '',
        dateReception: r['Date réception'] ? (r['Date réception'] instanceof Date ? r['Date réception'].toISOString().split('T')[0] : r['Date réception']) : new Date().toISOString().split('T')[0],
        dateTraitement: r['Date traitement'] ? (r['Date traitement'] instanceof Date ? r['Date traitement'].toISOString().split('T')[0] : r['Date traitement']) : '',
        statut: r['Statut'] || r['statut'] || 'En cours',
        actionMenee: r['Action menée'] || r['actionMenee'] || '',
        canalCommunication: r['Canal communication'] || r['canalCommunication'] || 'WhatsApp',
        noteSatisfaction: r['Note satisfaction'] || r['noteSatisfaction'] || '',
      }))

      // Détection doublons : même téléphone + même date réception + même objet
      const estDoublon = (ligne) => demandes.some(d =>
        d.telephone && ligne.telephone && d.telephone === ligne.telephone &&
        d.objetDemande === ligne.objetDemande &&
        d.dateReception && ligne.dateReception &&
        new Date(d.dateReception).toISOString().split('T')[0] === ligne.dateReception
      )

      const lignesAvecStatut = lignes.map(l => ({ ...l, _doublon: estDoublon(l) }))
      const doublons = lignesAvecStatut.filter(l => l._doublon).length
      setImportData({ lignes: lignesAvecStatut, doublons })
    }
    reader.readAsArrayBuffer(file)
  }

  const handleConfirmerImport = async () => {
    const aImporter = importData.lignes.filter(l => !l._doublon)
    let importes = 0
    for (const ligne of aImporter) {
      try {
        const { _doublon, ...data } = ligne
        const res = await API.post('/demandes', data)
        setDemandes(prev => [res.data, ...prev])
        importes++
      } catch {}
    }
    alert(`Import terminé : ${importes} demande(s) importée(s), ${importData.doublons} doublon(s) ignoré(s).`)
    setImportData(null)
  }

  const userRole = localStorage.getItem('userRole')
  const userName = localStorage.getItem('userName')
  const isFullAccess = userRole === 'admin' || userRole === 'manager' || userName === 'Ismael COULIBALY'

  const critiques = demandes.filter(d =>
    ['En cours', 'En attente'].includes(d.statut) && (
      d.priorite === 'Urgent' ||
      d.respectDelai === 'NON' ||
      d.objetDemande === 'Réclamation'
    )
  )

  const horsSLA = demandes.filter(d => {
    if (!d.dateReception || !['En cours', 'En attente'].includes(d.statut)) return false

    const jours = Math.floor(
      (new Date() - new Date(d.dateReception)) / (1000 * 60 * 60 * 24)
    )

    return jours > 3
  })

  const demandesTriees = [...demandes].sort((a, b) => {
    const dateA = new Date(a.dateReception || a.createdAt)
    const dateB = new Date(b.dateReception || b.createdAt)
    return dateB - dateA
  })

  const filtered = demandesTriees.filter(d => {
    if (!isFullAccess && d.agentN1 !== userName && d.agentN2 !== userName) return false
    const q = search.toLowerCase()
    if (q && !(
      (d.nomPrenom||'').toLowerCase().includes(q) ||
      (d.numDemande||'').toLowerCase().includes(q) ||
      (d.telephone||'').includes(q) ||
      (d.matricule||'').toLowerCase().includes(q)
    )) return false
    if (filterStatut && d.statut !== filterStatut) return false
    if (filterCanal && d.canal !== filterCanal) return false
    if (filterService && d.service !== filterService) return false
    if (filterTypeClient && d.typeClient !== filterTypeClient) return false
    if (filterObjet && d.objetDemande !== filterObjet) return false
    if (filterDateDebut && d.dateReception && new Date(d.dateReception) < new Date(filterDateDebut)) return false
    if (filterDateFin && d.dateReception && new Date(d.dateReception) > new Date(filterDateFin + 'T23:59:59')) return false
    // Filtres colonnes
    if (filtresColonnes.typeClient && d.typeClient !== filtresColonnes.typeClient) return false
    if (filtresColonnes.pays && d.pays !== filtresColonnes.pays) return false
    if (filtresColonnes.objetDemande && d.objetDemande !== filtresColonnes.objetDemande) return false
    if (filtresColonnes.canal && d.canal !== filtresColonnes.canal) return false
    if (filtresColonnes.agentN1 && d.agentN1 !== filtresColonnes.agentN1) return false
    if (filtresColonnes.service && d.service !== filtresColonnes.service) return false
    if (filtresColonnes.statut && d.statut !== filtresColonnes.statut) return false
    if (filtresColonnes.priorite && d.priorite !== filtresColonnes.priorite) return false
    return true
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))


  const demandesClient = (telephone) =>
    demandes.filter(d => d.telephone === telephone)

  const inp = {...styles.input, marginBottom: '0.75rem'}
  const col2 = {display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 1rem'}

  const getSlaBadge = (d) => {
    if (d.respectDelai === 'NON') {
      return <span style={{background:'#fff5f5', color:'#c53030', padding:'0.15rem 0.45rem', borderRadius:'20px', fontSize:'0.72rem', marginLeft:'0.4rem'}}>🚨 SLA dépassé</span>
    }

    if (d.statut !== 'Traité' && d.dateReception) {
      const jours = Math.ceil((new Date() - new Date(d.dateReception)) / (1000 * 60 * 60 * 24))
      const delaisService = { DPM: 3, DPR: 5, DSI: 6, PATRIMOINE: 7, DCR: 5, REGISSEUR: 5 }
      const delaiMax = delaisService[d.service] ?? 3

      if (jours === delaiMax || jours === delaiMax - 1) {
        return <span style={{background:'#fffbeb', color:'#b7791f', padding:'0.15rem 0.45rem', borderRadius:'20px', fontSize:'0.72rem', marginLeft:'0.4rem'}}>⚠️ SLA proche</span>
      }
    }

    return null
  }

  const valeursUniques = ['typeClient','pays','objetDemande','canal','agentN1','service','statut','priorite'].reduce((acc, cle) => {
    acc[cle] = [...new Set(demandes.map(d => d[cle]).filter(Boolean))].sort()
    return acc
  }, {})

  const renderHeaderFiltrable = (label, cle) => (
    <th key={cle} style={{ ...styles.th, position: 'relative', overflow: 'visible' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setColonneActive(colonneActive === cle ? null : cle)
        }}
        style={{
          background: filtresColonnes[cle] ? '#ebf8ff' : 'transparent',
          border: 'none',
          padding: '0.1rem 0.3rem',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          cursor: 'pointer',
          font: 'inherit',
          color: filtresColonnes[cle] ? '#2b6cb0' : 'inherit',
          fontWeight: filtresColonnes[cle] ? '700' : 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{label}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{filtresColonnes[cle] ? '●' : '▾'}</span>
      </button>

      {colonneActive === cle ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: '180px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
            zIndex: 5000,
            padding: '0.35rem'
          }}
        >
          <div
            onClick={() => {
              setFiltresColonnes((prev) => ({ ...prev, [cle]: '' }))
              setColonneActive(null)
            }}
            style={{
              padding: '0.6rem 0.7rem',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            Tout afficher
          </div>

          {valeursUniques[cle]?.map((val) => (
            <div
              key={val}
              onClick={() => {
                setFiltresColonnes({ ...filtresColonnes, [cle]: val })
                setColonneActive(null)
              }}
              style={{
                padding: '0.5rem 0.65rem',
                cursor: 'pointer',
                borderRadius: '8px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap'
              }}
            >
              {val}
            </div>
          ))}
        </div>
      ) : null}
    </th>
  )

  const profilClientColor = (profil) => {
    const map = {
      'Participant Cadre': { background: '#ebf8ff', color: '#2b6cb0' },
      'Participant Non-cadre': { background: '#e6fffa', color: '#234e52' },
      'Participant Volontaire': { background: '#fff5f5', color: '#c53030' },
      'Participant Individuel': { background: '#faf5ff', color: '#6b46c1' },
      'Participant RVC': { background: '#f0fff4', color: '#276749' },
      'Retraité': { background: '#f0fff4', color: '#276749' },
      'Réversataire': { background: '#faf5ff', color: '#6b46c1' },
      'Adhérent (institution)': { background: '#fffbeb', color: '#b7791f' },
      'Locataire': { background: '#f7fafc', color: '#718096' },
      'Prospect': { background: '#fffbea', color: '#975a16' },
      'Autres': { background: '#edf2f7', color: '#4a5568' },
    }
    return map[profil] || { background: '#f7fafc', color: '#718096' }
  }

  return (
    <div>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        marginBottom: '1rem'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap'}}>
          <div>
            <h2 style={{margin:0, color:'#1a365d', fontSize:'1.5rem', fontWeight:'700'}}>📋 Suivi des demandes</h2>
            <div style={{marginTop:'0.35rem', color:'#718096', fontSize:'0.92rem'}}>
              Pilotage opérationnel des interactions usagers
            </div>
          </div>

          <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap'}}>
            <button
              style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem', background:'#276749'}}
              onClick={exportExcel}
            >
              📥 Exporter Excel
            </button>

            <label style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem', background:'#6b46c1', cursor:'pointer', display:'inline-block', textAlign:'center'}}>
              📤 Importer Excel
              <input type="file" accept=".xlsx,.xls" style={{display:'none'}} onChange={handleImportExcel} />
            </label>

            <button
              style={{...styles.button, width:'auto', padding:'0.75rem 1.25rem'}}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '✕ Annuler' : '+ Nouvelle demande'}
            </button>
          </div>
        </div>
      </div>

      {/* Modale prévisualisation import Excel */}
      {importData && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
          <div style={{background:'white',borderRadius:'16px',padding:'2rem',width:'100%',maxWidth:'800px',maxHeight:'85vh',overflowY:'auto',boxShadow:'0 8px 40px rgba(0,0,0,0.2)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.25rem'}}>
              <h3 style={{margin:0,color:'#1a365d'}}>📤 Prévisualisation de l'import</h3>
              <button onClick={() => setImportData(null)} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer',color:'#718096'}}>✕</button>
            </div>
            <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
              <div style={{background:'#f0fff4',border:'1px solid #9ae6b4',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.9rem',color:'#276749'}}>
                ✅ {importData.lignes.filter(l=>!l._doublon).length} à importer
              </div>
              <div style={{background:'#fff5f5',border:'1px solid #feb2b2',borderRadius:'8px',padding:'0.5rem 1rem',fontSize:'0.9rem',color:'#c53030'}}>
                ⚠ {importData.doublons} doublon(s) ignoré(s)
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.82rem',marginBottom:'1.25rem'}}>
              <thead>
                <tr style={{background:'#f7fafc'}}>
                  {['Statut','Nom','Téléphone','Objet','Date réception','Statut demande'].map(h => (
                    <th key={h} style={{padding:'0.5rem 0.75rem',textAlign:'left',borderBottom:'2px solid #e2e8f0',color:'#4a5568'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importData.lignes.map((l, i) => (
                  <tr key={i} style={{background: l._doublon ? '#fff5f5' : 'white', opacity: l._doublon ? 0.7 : 1}}>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>
                      {l._doublon
                        ? <span style={{color:'#c53030',fontWeight:'600'}}>⚠ Doublon</span>
                        : <span style={{color:'#276749',fontWeight:'600'}}>✅ Nouveau</span>}
                    </td>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>{l.nomPrenom}</td>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>{l.telephone}</td>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>{l.objetDemande}</td>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>{l.dateReception}</td>
                    <td style={{padding:'0.4rem 0.75rem',borderBottom:'1px solid #e2e8f0'}}>{l.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end'}}>
              <button onClick={() => setImportData(null)} style={{...styles.button,width:'auto',padding:'0.75rem 1.5rem',background:'#718096'}}>
                Annuler
              </button>
              <button onClick={handleConfirmerImport} disabled={importData.lignes.filter(l=>!l._doublon).length === 0}
                style={{...styles.button,width:'auto',padding:'0.75rem 1.5rem',background: importData.lignes.filter(l=>!l._doublon).length === 0 ? '#cbd5e0' : '#2b6cb0',cursor: importData.lignes.filter(l=>!l._doublon).length === 0 ? 'not-allowed' : 'pointer'}}>
                Importer {importData.lignes.filter(l=>!l._doublon).length} demande(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {critiques.length > 0 && (
        <div style={{
          background:'#fff5f5',
          border:'1px solid #fed7d7',
          borderRadius:'14px',
          padding:'1rem 1.25rem',
          marginBottom:'1rem',
          boxShadow:'0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
            <strong style={{color:'#c53030', fontSize:'1rem'}}>🔥 Demandes critiques</strong>
            <span style={{fontSize:'0.8rem', color:'#9b2c2c', background:'#fff', padding:'0.2rem 0.55rem', borderRadius:'999px'}}>
              {critiques.length} à surveiller
            </span>
          </div>

          <div style={{marginTop:'0.75rem', display:'grid', gap:'0.5rem'}}>
            {critiques.slice(0,5).map(d => (
              <div
                key={d.id}
                onClick={() => setTicketOuvert(d)}
                style={{
                  background:'white',
                  borderRadius:'10px',
                  padding:'0.65rem 0.8rem',
                  display:'flex',
                  justifyContent:'space-between',
                  gap:'0.75rem',
                  flexWrap:'wrap',
                  border:'1px solid #fed7d7',
                  cursor:'pointer'
                }}
              >
                <span style={{fontWeight:'600', color:'#c53030'}}>{d.numDemande}</span>
                <span style={{color:'#2d3748'}}>{d.nomPrenom}</span>
                <span style={{color:'#718096'}}>{d.objetDemande || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {horsSLA.length > 0 && (
        <div style={{
          background:'#fffbea',
          border:'1px solid #f6e05e',
          borderRadius:'14px',
          padding:'1rem 1.25rem',
          marginBottom:'1rem',
          boxShadow:'0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap'}}>
            <strong style={{color:'#b7791f', fontSize:'1rem'}}>⚠ Demandes hors délai</strong>
            <span style={{fontSize:'0.8rem', color:'#975a16', background:'#fff', padding:'0.2rem 0.55rem', borderRadius:'999px'}}>
              {horsSLA.length} en retard
            </span>
          </div>

          <div style={{marginTop:'0.75rem', display:'grid', gap:'0.5rem'}}>
            {horsSLA.slice(0,5).map(d => (
              <div
                key={d.id}
                onClick={() => setTicketOuvert(d)}
                style={{
                  background:'white',
                  borderRadius:'10px',
                  padding:'0.65rem 0.8rem',
                  display:'flex',
                  justifyContent:'space-between',
                  gap:'0.75rem',
                  flexWrap:'wrap',
                  border:'1px solid #f6e05e',
                  cursor:'pointer'
                }}
              >
                <span style={{fontWeight:'600', color:'#b7791f'}}>{d.numDemande}</span>
                <span style={{color:'#2d3748'}}>{d.nomPrenom}</span>
                <span style={{color:'#718096'}}>{d.service || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:'0.9rem', marginBottom:'1rem'}}>
        {[
          {label:'Total',val:demandes.length,bg:'#ebf8ff',col:'#2b6cb0', icon:'📌'},
          {label:'Traitées',val:demandes.filter(d=>d.statut==='Traité').length,bg:'#f0fff4',col:'#276749', icon:'✅'},
          {label:'En cours',val:demandes.filter(d=>d.statut==='En cours').length,bg:'#fffbeb',col:'#b7791f', icon:'⏳'},
          {label:'Délai OK',val:demandes.filter(d=>d.respectDelai==='OUI').length,bg:'#faf5ff',col:'#6b46c1', icon:'📊'}
        ].map(s => (
          <div key={s.label} style={{
            background:'white',
            borderRadius:'14px',
            padding:'1rem',
            boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
            borderTop:`4px solid ${s.col}`
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'0.82rem', color:'#718096'}}>{s.label}</div>
              <div style={{fontSize:'1.1rem'}}>{s.icon}</div>
            </div>
            <div style={{fontSize:'1.9rem', fontWeight:'700', color:s.col, marginTop:'0.4rem'}}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:'14px',padding:'1rem',boxShadow:'0 2px 10px rgba(0,0,0,0.06)',marginBottom:'1rem'}}>
        {/* Barre principale */}
        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center'}}>
          <input
            style={{...styles.input,marginBottom:0,flex:1,minWidth:'220px'}}
            placeholder="🔍 Nom, N° demande, téléphone, matricule..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          <select style={{...styles.input,marginBottom:0,width:'160px'}} value={filterStatut} onChange={e=>setFilterStatut(e.target.value)}>
            <option value="">Tous statuts</option>
            <option>Traité</option><option>En cours</option><option>En attente</option>
          </select>
          <button
            onClick={() => setShowFiltres(f => !f)}
            style={{padding:'0.6rem 1rem',borderRadius:'8px',border:'1px solid #e2e8f0',background: showFiltres ? '#ebf8ff' : 'white',color: showFiltres ? '#2b6cb0' : '#4a5568',cursor:'pointer',fontWeight:'500',fontSize:'0.9rem',whiteSpace:'nowrap'}}
          >
            {showFiltres ? '▲' : '▼'} Filtres avancés
            {(filterCanal||filterService||filterTypeClient||filterObjet||filterDateDebut||filterDateFin) && (
              <span style={{marginLeft:'0.4rem',background:'#2b6cb0',color:'white',borderRadius:'999px',padding:'0 0.4rem',fontSize:'0.75rem'}}>
                {[filterCanal,filterService,filterTypeClient,filterObjet,filterDateDebut,filterDateFin].filter(Boolean).length}
              </span>
            )}
          </button>
          {(filterCanal||filterService||filterTypeClient||filterObjet||filterDateDebut||filterDateFin||filterStatut||search) && (
            <button onClick={() => { setSearch('');setFilterStatut('');setFilterCanal('');setFilterService('');setFilterTypeClient('');setFilterObjet('');setFilterDateDebut('');setFilterDateFin('');setFiltresColonnes({}) }}
              style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'1px solid #fed7d7',background:'#fff5f5',color:'#c53030',cursor:'pointer',fontSize:'0.85rem',whiteSpace:'nowrap'}}>
              ✕ Réinitialiser
            </button>
          )}
        </div>

        {/* Filtres avancés */}
        {showFiltres && (
          <div style={{marginTop:'0.75rem',paddingTop:'0.75rem',borderTop:'1px solid #e2e8f0',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:'0.6rem'}}>
            <select style={{...styles.input,marginBottom:0}} value={filterCanal} onChange={e=>setFilterCanal(e.target.value)}>
              <option value="">Tous canaux</option>
              <option>WhatsApp</option><option>Appel</option><option>Email</option><option>Courrier</option>
            </select>
            <select style={{...styles.input,marginBottom:0}} value={filterService} onChange={e=>setFilterService(e.target.value)}>
              <option value="">Tous services</option>
              {['DPM','DPR','DSI','DCR','PATRIMOINE','REGISSEUR'].map(s=><option key={s}>{s}</option>)}
            </select>
            <select style={{...styles.input,marginBottom:0}} value={filterTypeClient} onChange={e=>setFilterTypeClient(e.target.value)}>
              <option value="">Tous types</option>
              <option>Actif</option><option>Retraité</option><option>Ayant droit</option>
            </select>
            <select style={{...styles.input,marginBottom:0}} value={filterObjet} onChange={e=>setFilterObjet(e.target.value)}>
              <option value="">Tous objets</option>
              {['Information','Réclamation','Demande de document','Information générale','Liquidation pension','Pension réversion','Prestations santé / FAAM','Cotisations','Affiliation','Autre'].map(o=><option key={o}>{o}</option>)}
            </select>
            <div>
              <label style={{fontSize:'0.75rem',color:'#718096',display:'block',marginBottom:'0.2rem'}}>Date début</label>
              <input type="date" style={{...styles.input,marginBottom:0}} value={filterDateDebut} onChange={e=>setFilterDateDebut(e.target.value)} />
            </div>
            <div>
              <label style={{fontSize:'0.75rem',color:'#718096',display:'block',marginBottom:'0.2rem'}}>Date fin</label>
              <input type="date" style={{...styles.input,marginBottom:0}} value={filterDateFin} onChange={e=>setFilterDateFin(e.target.value)} />
            </div>
          </div>
        )}

        {/* Résumé résultats */}
        <div style={{marginTop:'0.6rem',fontSize:'0.82rem',color:'#718096'}}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''} sur {demandes.length} demandes
        </div>
      </div>

      {showForm && (
        <>
          <div
            onClick={() => setShowForm(false)}
            style={{
              position:'fixed',
              top:0,
              left:0,
              width:'100vw',
              height:'100vh',
              background:'rgba(0,0,0,0.45)',
              zIndex:9998
            }}
          />

          <div
            style={{
              position:'fixed',
              top:'50%',
              left:'50%',
              transform:'translate(-50%,-50%)',
              width:'min(1000px, 92vw)',
              maxHeight:'88vh',
              overflowY:'auto',
              background:'white',
              borderRadius:'16px',
              boxShadow:'0 24px 70px rgba(0,0,0,0.25)',
              zIndex:9999,
              padding:'1.25rem'
            }}
          >
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{margin:0, color:'#1a365d'}}>
                {editId ? '✏️ Modifier la demande' : '➕ Nouvelle demande'}
              </h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  background:'transparent',
                  border:'none',
                  fontSize:'1.5rem',
                  cursor:'pointer',
                  color:'#718096'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdd} style={{...styles.form, marginBottom:0, boxShadow:'none', padding:0}}>
          {showFiche && <FicheClient
            telephone={ficheSearch.telephone}
            matricule={ficheSearch.matricule}
            email={ficheSearch.email}
            onClose={() => setShowFiche(false)}
          />}
          <h3 style={{color:'#1a365d',marginBottom:'1rem',fontSize:'1rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'0.5rem'}}>👤 Informations client</h3>
          <div style={col2}>
            <input style={inp} placeholder="Nom et prénom *" value={form.nomPrenom} onChange={e=>setForm({...form,nomPrenom:e.target.value})} required />
            <input style={inp} placeholder="Matricule" value={form.matricule} 
              onChange={e=>setForm({...form,matricule:e.target.value})}
              onBlur={e=>{ if(e.target.value.length >= 4) { setFicheSearch({telephone:'', matricule:e.target.value}); setShowFiche(true) }}} />
            <input style={inp} placeholder="Adhérent (BOAD, BCEAO...)" value={form.adherent} onChange={e=>setForm({...form,adherent:e.target.value})} />
            <select style={inp} value={form.typeClient} onChange={e => setForm({ ...form, typeClient: e.target.value })}>
              <option value="">Profil client</option>
              {PROFILS_CLIENTS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select style={inp} value={form.pays} onChange={e=>{ const p=e.target.value; setForm({...form,pays:p,telephone:INDICATIFS[p]||form.telephone})}}>
              <option value="">-- Pays --</option>
              {["Bénin","Burkina Faso","Côte d'Ivoire","Guinée Bissau","Mali","Niger","Sénégal","Togo","France"].map(p=><option key={p}>{p}</option>)}
            </select>
            <input style={inp} placeholder="Téléphone" value={form.telephone}
              onChange={e=>setForm({...form,telephone:e.target.value})}
              onBlur={e=>{ if(e.target.value.replace(/[^0-9]/g,'').length >= 6) { setFicheSearch({telephone:e.target.value, matricule:''}); setShowFiche(true) }}} onFocus={e=>{ if(!form.telephone && form.pays && INDICATIFS[form.pays]) setForm(f=>({...f,telephone:INDICATIFS[form.pays]}))}} />
            <input style={inp} type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
              onBlur={e=>{
                if(e.target.value.length >= 6){
                  setFicheSearch({
                    telephone:'',
                    matricule:'',
                    email:e.target.value
                  })
                  setShowFiche(true)
                }
              }}
            />
            <input style={inp} placeholder="Heure appel (ex: 09h00)" value={form.heureAppel} onChange={e=>setForm({...form,heureAppel:e.target.value})} />
          </div>
          <h3 style={{color:'#1a365d',margin:'0.25rem 0 1rem',fontSize:'1rem',borderBottom:'1px solid #e2e8f0',paddingBottom:'0.5rem'}}>📨 Demande</h3>
          <div style={col2}>
            <select style={inp} value={form.objetDemande} onChange={e=>setForm({...form,objetDemande:e.target.value})}>
              <option>Information générale</option>
              <option>Liquidation pension</option>
              <option>Pension réversion</option>
              <option>Prestations santé / FAAM</option>
              <option>Cotisations</option>
              <option>Affiliation</option>
              <option>Réclamation</option>
              <option>Support services en ligne</option>
              <option>Autre</option>
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
          </div>
        </>
      )}
      <div style={{
        background:'white',
        borderRadius:'14px',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        overflow:'visible'
      }}>
        <div style={{overflowX:'auto', overflowY:'visible'}}>
          <table style={{...styles.table, boxShadow:'none', borderRadius:0}}>
            <thead>
              <tr>
                <th style={styles.th}>N°</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Nom</th>
                {renderHeaderFiltrable('Type', 'typeClient')}
                {renderHeaderFiltrable('Pays', 'pays')}
                {renderHeaderFiltrable('Objet', 'objetDemande')}
                {renderHeaderFiltrable('Canal', 'canal')}
                {renderHeaderFiltrable('Agent N1', 'agentN1')}
                {renderHeaderFiltrable('Service', 'service')}
                {renderHeaderFiltrable('Statut', 'statut')}
                {renderHeaderFiltrable('Priorité', 'priorite')}
                <th style={styles.th}>Délai</th>
                <th style={styles.th}>Note</th>
                <th style={styles.th}>Enquête</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? <tr><td colSpan={15} style={{...styles.td,textAlign:'center',color:'#718096',padding:'3rem'}}>Aucune demande — cliquez sur "+ Nouvelle demande"</td></tr>
              : filtered.map(d=>(
                <tr
                  key={d.id}
                  style={{
                    ...styles.tr,
                    background: d.priorite === 'Urgent' ? '#fffaf0' : 'white',
                    cursor: 'pointer'
                  }}
                  onClick={() => setTicketOuvert(d)}
                >
                  <td style={{...styles.td,color:'#2b6cb0',fontWeight:'600'}}>{f(d.numDemande)}</td>
                  <td style={styles.td}>{d.dateReception?new Date(d.dateReception).toLocaleDateString('fr-FR'):'—'}</td>
                  <td style={styles.td}>{f(d.nomPrenom)}</td>
                  <td style={styles.td}><span style={{ ...styles.badge, ...profilClientColor(d.typeClient) }}>{d.typeClient || '—'}</span></td>
                  <td style={styles.td}>{f(d.pays)}</td>
                  <td style={styles.td}><span style={{...styles.badge,...(d.objetDemande==='Réclamation'?{background:'#fff5f5',color:'#c53030'}:{background:'#ebf8ff',color:'#2b6cb0'})}}>{f(d.objetDemande)}</span></td>
                  <td style={styles.td}>{f(d.canal)}</td>
                  <td style={styles.td}>{f(d.agentN1)}</td>
                  <td style={styles.td}>{f(d.service)}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge,...sColor(d.statut)}}>{f(d.statut)}</span>
                    {getSlaBadge(d)}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding:'0.2rem 0.5rem',
                      borderRadius:'20px',
                      fontSize:'0.75rem',
                      background:
                        d.priorite === 'Urgent' ? '#fff5f5' :
                        d.priorite === 'Élevé' ? '#fffbeb' :
                        d.priorite === 'Moyen' ? '#ebf8ff' :
                        '#f0fff4',
                      color:
                        d.priorite === 'Urgent' ? '#c53030' :
                        d.priorite === 'Élevé' ? '#b7791f' :
                        d.priorite === 'Moyen' ? '#2b6cb0' :
                        '#276749'
                    }}>
                      {d.priorite || 'Moyen'}
                    </span>
                  </td>
                  <td style={styles.td}>{d.delaiTraitement?`${d.delaiTraitement}j`:'—'}</td>
                  <td style={styles.td}>{d.noteSatisfaction?`⭐${d.noteSatisfaction}/5`:'—'}</td>
                  <td style={styles.td}>
                    {d.enqueteEnvoyee ?
                      <span style={{color:'#276749'}}>✔ envoyée</span> :
                      <span style={{color:'#b7791f'}}>—</span>
                    }
                  </td>
                  <td style={{...styles.td, whiteSpace:'nowrap'}}>
                    <button
                      title="Modifier"
                      onClick={()=>handleEdit(d)}
                      style={{background:'#ebf8ff',color:'#2b6cb0',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',marginRight:'0.35rem',fontSize:'0.8rem'}}
                    >
                      ✏️
                    </button>

                    <button
                      title="Supprimer"
                      onClick={()=>handleDelete(d.id)}
                      style={{background:'#fff5f5',color:'#c53030',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',marginRight:'0.35rem',fontSize:'0.8rem'}}
                    >
                      🗑️
                    </button>

                    <button
                      title="Notes et timeline"
                      onClick={()=> onOpenCommentaires(d)}
                      style={{background:'#fffbeb',color:'#b7791f',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',marginRight:'0.35rem',fontSize:'0.8rem'}}
                    >
                      💬
                    </button>

                    <button
                      title="Assigner"
                      onClick={()=> onAssigner(d)}
                      style={{background:'#f0fff4',color:'#276749',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',marginRight:'0.35rem',fontSize:'0.8rem'}}
                    >
                      📤
                    </button>

                    <button
                      title="Voir fiche client"
                      onClick={() => {
                        setClientActif(d)
                        setShowClient(true)
                      }}
                      style={{background:'#edf2f7',color:'#4a5568',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',marginRight:'0.35rem',fontSize:'0.8rem'}}
                    >
                      🪪
                    </button>

                    {d.statut === 'Traité' && (
                      <button
                        title="Envoyer enquête satisfaction"
                        onClick={()=> envoyerEnquete(d)}
                        style={{background:'#faf5ff',color:'#6b46c1',border:'none',borderRadius:'8px',padding:'0.35rem 0.6rem',cursor:'pointer',fontSize:'0.8rem'}}
                      >
                        ⭐
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showClient && (
        <FicheClient360
          client={clientActif}
          demandes={demandes}
          onClose={() => setShowClient(false)}
        />
      )}

      {ticketOuvert && (
        <div style={{ position:'fixed', top:'0', right:'0', width:'420px', height:'100vh', background:'#fff', boxShadow:'-4px 0 24px rgba(0,0,0,0.13)', zIndex:10000, overflowY:'auto', padding:'2rem 1.5rem' }}>
          <button onClick={() => setTicketOuvert(null)} style={{ float:'right', background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color:'#888' }}>✕</button>
          <h2 style={{ marginTop:0, fontSize:'1.15rem', color:'#1e3a5f' }}>📋 Détail de la demande</h2>
          <p style={{ color:'#666', fontSize:'0.85rem', marginBottom:'1rem' }}>{ticketOuvert.numDemande}</p>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem 1rem', marginBottom:'1.5rem' }}>
            {[
              ['Client', ticketOuvert.nomPrenom],
              ['Téléphone', ticketOuvert.telephone],
              ['Type', ticketOuvert.typeClient],
              ['Canal', ticketOuvert.canal],
              ['Objet', ticketOuvert.objetDemande],
              ['Service', ticketOuvert.service],
              ['Agent N1', ticketOuvert.agentN1],
              ['Agent N2', ticketOuvert.agentN2],
              ['Statut', ticketOuvert.statut],
              ['Priorité', ticketOuvert.priorite],
              ['Date réception', ticketOuvert.dateReception ? new Date(ticketOuvert.dateReception).toLocaleDateString('fr-FR') : '—'],
              ['Date traitement', ticketOuvert.dateTraitement ? new Date(ticketOuvert.dateTraitement).toLocaleDateString('fr-FR') : '—'],
              ['Délai (j)', ticketOuvert.delaiTraitement ?? '—'],
              ['Respect délai', ticketOuvert.respectDelai ?? '—'],
              ['Note satisfaction', ticketOuvert.noteSatisfaction ?? '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize:'0.72rem', color:'#999', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                <div style={{ fontSize:'0.9rem', fontWeight:600, color:'#1e3a5f' }}>{val || '—'}</div>
              </div>
            ))}
          </div>

          {ticketOuvert.commentaire && (
            <div style={{ background:'#f8fafc', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.72rem', color:'#999', textTransform:'uppercase', marginBottom:'0.25rem' }}>Commentaire</div>
              <div style={{ fontSize:'0.88rem', color:'#333' }}>{ticketOuvert.commentaire}</div>
            </div>
          )}

          <div style={{ marginBottom:'1rem' }}>
            <strong>Timeline :</strong>
            <div style={{ marginTop:'0.6rem', display:'grid', gap:'0.55rem' }}>
              {timelineTicket.length === 0 ? (
                <div style={{ color:'#718096', fontSize:'0.9rem' }}>Aucun événement</div>
              ) : (
                timelineTicket.map(t => (
                  <div key={t.id} style={{ border:'1px solid #e2e8f0', borderRadius:'10px', padding:'0.65rem 0.75rem', background:'#f8fafc' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:'0.75rem' }}>
                      <span style={{ fontWeight:'600', color:'#2d3748' }}>{t.action}</span>
                      <span style={{ fontSize:'0.75rem', color:'#718096' }}>
                        {new Date(t.createdAt).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <div style={{ marginTop:'0.25rem', color:'#4a5568', fontSize:'0.85rem' }}>{t.detail || '—'}</div>
                    <div style={{ marginTop:'0.2rem', color:'#718096', fontSize:'0.75rem' }}>par {t.auteur}{t.canal ? ` • ${t.canal}` : ''}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {ticketOuvert.actionMenee && (
            <div style={{ background:'#f0fdf4', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.72rem', color:'#999', textTransform:'uppercase', marginBottom:'0.25rem' }}>Action menée</div>
              <div style={{ fontSize:'0.88rem', color:'#333' }}>{ticketOuvert.actionMenee}</div>
            </div>
          )}

          <div style={{ marginTop:'1.5rem', display:'flex', gap:'0.5rem' }}>
            <button onClick={() => { setSelected(ticketOuvert); setModalOpen(true); setTicketOuvert(null); }} style={{ flex:1, padding:'0.6rem', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:600 }}>✏️ Modifier</button>
            <button onClick={() => setTicketOuvert(null)} style={{ flex:1, padding:'0.6rem', background:'#f1f5f9', color:'#555', border:'none', borderRadius:'8px', cursor:'pointer' }}>Fermer</button>
          </div>
        </div>
      )}

    </div>
  )
}



function FicheClient360({ client, demandes, onClose }) {

  const historique = demandes.filter(d =>
    d.telephone === client.telephone ||
    d.email === client.email ||
    d.matricule === client.matricule
  )

  return (
    <div style={{
      position:'fixed',
      top:0,
      right:0,
      width:'420px',
      height:'100%',
      background:'white',
      boxShadow:'-5px 0 20px rgba(0,0,0,0.1)',
      padding:'1.5rem',
      zIndex:9999
    }}>

      <h3>👤 Fiche client</h3>

      <p><strong>{client.nomPrenom}</strong></p>
      <p>📞 {client.telephone}</p>
      <p>📧 {client.email || '—'}</p>
      <p>🪪 {client.matricule || '—'}</p>

      <hr style={{margin:'1rem 0'}} />

      <h4>Historique des demandes</h4>

      {historique.map(d => (
        <div key={d.id} style={{
          padding:'0.5rem',
          borderBottom:'1px solid #eee'
        }}>
          {d.numDemande} — {d.objetDemande} — {d.statut}
        </div>
      ))}

      <button
        onClick={onClose}
        style={{
          marginTop:'1rem',
          padding:'0.5rem 1rem',
          border:'none',
          background:'#2b6cb0',
          color:'white',
          borderRadius:'6px'
        }}
      >
        Fermer
      </button>

    </div>
  )
}

function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const emptyForm = { name: '', email: '', password: '', role: 'agent' }
  const [form, setForm] = useState(emptyForm)
  const isAdmin = localStorage.getItem('userRole') === 'admin'
  const [changePwdUser, setChangePwdUser] = useState(null)
  const [pwdForm, setPwdForm] = useState({ password: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => { API.get('/users').then(r => setUsers(r.data)).catch(() => {}) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editUser) {
        const data = { ...form }

        if (!data.password) {
          delete data.password
        }

        const res = await API.put(`/users/${editUser.id}`, data)
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

  const handleChangePwd = async (e) => {
    e.preventDefault()
    if (pwdForm.password !== pwdForm.confirm) {
      alert('Les mots de passe ne correspondent pas')
      return
    }
    if (pwdForm.password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    try {
      setSavingPwd(true)
      await API.put(`/users/${changePwdUser.id}`, { password: pwdForm.password })
      setChangePwdUser(null)
      setPwdForm({ password: '', confirm: '' })
    } catch {
      alert('Erreur lors du changement de mot de passe')
    } finally {
      setSavingPwd(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return

    try {
      await API.delete(`/users/${id}`)
      setUsers(users.filter(u => u.id !== id))
    } catch {
      alert("Erreur lors de la suppression")
    }
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
                <button
                  onClick={() => handleEdit(u)}
                  style={{background:'#ebf8ff',color:'#2b6cb0',border:'none',borderRadius:'6px',padding:'0.3rem 0.75rem',cursor:'pointer',marginRight:'0.5rem'}}
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={() => { setChangePwdUser(u); setPwdForm({ password: '', confirm: '' }) }}
                  style={{background:'#faf5ff',color:'#6b46c1',border:'none',borderRadius:'6px',padding:'0.3rem 0.75rem',cursor:'pointer',marginRight:'0.5rem'}}
                >
                  🔑 Mot de passe
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{background:'#fff5f5',color:'#c53030',border:'none',borderRadius:'6px',padding:'0.3rem 0.75rem',cursor:'pointer'}}
                >
                  🗑️ Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {changePwdUser && (
        <>
          <div onClick={() => setChangePwdUser(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', background: 'white', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.28)', zIndex: 9999, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#1e4a7a' }}>🔑 Changer le mot de passe</h3>
              <button onClick={() => setChangePwdUser(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#718096' }}>✕</button>
            </div>
            <div style={{ color: '#4a5568', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Utilisateur : <strong>{changePwdUser.name}</strong>
            </div>
            <form onSubmit={handleChangePwd}>
              <input type="password" style={{ ...styles.input, marginBottom: '0.75rem' }}
                placeholder="Nouveau mot de passe (min. 6 caractères)"
                value={pwdForm.password}
                onChange={e => setPwdForm({ ...pwdForm, password: e.target.value })}
                required
              />
              <input type="password" style={{ ...styles.input, marginBottom: '1rem' }}
                placeholder="Confirmer le mot de passe"
                value={pwdForm.confirm}
                onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                required
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setChangePwdUser(null)}
                  style={{ ...styles.button, background: '#718096' }}>Annuler</button>
                <button type="submit" disabled={savingPwd}
                  style={{ ...styles.button, opacity: savingPwd ? 0.7 : 1 }}>
                  {savingPwd ? 'Enregistrement...' : '💾 Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
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

  const demandesCritiques = filtered.filter(d =>
    ['En cours', 'En attente'].includes(d.statut) && (d.priorite === 'Urgent' || d.respectDelai === 'NON' || d.objetDemande === 'Réclamation')
  )

  const activiteRecente = [...filtered].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5)

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

  const enqueteEnvoyees = filtered.filter(d => d.enqueteEnvoyee).length
  const enqueteRepondues = filtered.filter(d => d.noteSatisfaction).length

  const tauxReponse = enqueteEnvoyees > 0
    ? Math.round((enqueteRepondues / enqueteEnvoyees) * 100)
    : 0
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

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:'0.9rem', marginBottom:'1rem'}}>
        {[
          {label:'Demandes', val:filtered.length, bg:'#ebf8ff', col:'#2b6cb0', icon:'📥'},
          {label:'En cours', val:filtered.filter(d => d.statut === 'En cours').length, bg:'#fffbeb', col:'#b7791f', icon:'⏳'},
          {label:'Traitées', val:filtered.filter(d => d.statut === 'Traité').length, bg:'#f0fff4', col:'#276749', icon:'✅'},
          {label:'Hors SLA', val:filtered.filter(d => d.statut !== 'Traité' && d.respectDelai === 'NON').length, bg:'#fff5f5', col:'#c53030', icon:'⚠️'},
        ].map(card => (
          <div key={card.label} style={{
            background:'white',
            borderRadius:'14px',
            padding:'1rem',
            boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
            borderTop:`4px solid ${card.col}`
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'0.82rem', color:'#718096'}}>{card.label}</div>
              <div style={{fontSize:'1.05rem'}}>{card.icon}</div>
            </div>
            <div style={{fontSize:'1.9rem', fontWeight:'700', color:card.col, marginTop:'0.4rem'}}>
              {card.val}
            </div>
          </div>
        ))}
      </div>

      {demandesCritiques.length > 0 && (
        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1rem 1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
          marginBottom:'1rem',
          borderLeft:'5px solid #c53030'
        }}>
          <div style={{fontWeight:'700', color:'#1a365d', marginBottom:'0.6rem'}}>
            🚨 Points de vigilance
          </div>

          {filtered.filter(d => ['En cours', 'En attente'].includes(d.statut) && d.priorite === 'Urgent').length > 0 && (
            <div style={{color:'#c53030', marginBottom:'0.35rem'}}>
              {filtered.filter(d => ['En cours', 'En attente'].includes(d.statut) && d.priorite === 'Urgent').length} demande(s) critique(s)
            </div>
          )}

          {filtered.filter(d => ['En cours', 'En attente'].includes(d.statut) && d.respectDelai === 'NON').length > 0 && (
            <div style={{color:'#b7791f'}}>
              {filtered.filter(d => ['En cours', 'En attente'].includes(d.statut) && d.respectDelai === 'NON').length} demande(s) hors SLA
            </div>
          )}
        </div>
      )}

      {demandesCritiques.length > 0 && (
        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1rem 1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
          marginBottom:'1rem'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'}}>
            <div style={{fontWeight:'700', color:'#1a365d'}}>🔥 Demandes critiques</div>
            <div style={{fontSize:'0.8rem', color:'#718096'}}>
              {demandesCritiques.length} au total
            </div>
          </div>

          <div style={{display:'grid', gap:'0.55rem'}}>
            {demandesCritiques.slice(0,5).map(d => (
              <div key={d.id} style={{
                border:'1px solid #edf2f7',
                borderRadius:'10px',
                padding:'0.75rem 0.85rem',
                display:'flex',
                justifyContent:'space-between',
                gap:'0.75rem',
                flexWrap:'wrap',
                background: d.priorite === 'Urgent' ? '#fffaf0' : '#fafafa'
              }}>
                <div style={{fontWeight:'600', color:'#2b6cb0'}}>{d.numDemande}</div>
                <div style={{color:'#2d3748'}}>{d.nomPrenom}</div>
                <div style={{color:'#718096'}}>{d.objetDemande || '—'}</div>
                <div style={{color:'#4a5568'}}>{d.service || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem'}}>
        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
          marginBottom:'1rem'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
            <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>👤 Performance par agent</h3>
            <span style={{fontSize:'0.8rem', color:'#718096'}}>Suivi du traitement</span>
          </div>
          <table style={{...styles.table, boxShadow:'none', borderRadius:0}}>
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

        <div style={{
          background:'white',
          borderRadius:'14px',
          padding:'1.25rem',
          boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
          marginBottom:'1rem'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
            <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>🏢 Respect des délais par service</h3>
            <span style={{fontSize:'0.8rem', color:'#718096'}}>Qualité de traitement</span>
          </div>
          <table style={{...styles.table, boxShadow:'none', borderRadius:0}}>
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

      <div style={{
        background:'white',
        borderRadius:'14px',
        padding:'1.25rem',
        boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
        marginBottom:'1rem'
      }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.9rem'}}>
          <h3 style={{color:'#1a365d', margin:0, fontSize:'1rem'}}>🕒 Activité récente</h3>
          <span style={{fontSize:'0.8rem', color:'#718096'}}>Dernières mises à jour</span>
        </div>

        <div style={{display:'grid', gap:'0.55rem'}}>
          {activiteRecente.map(d => (
            <div key={d.id} style={{
              border:'1px solid #edf2f7',
              borderRadius:'10px',
              padding:'0.75rem 0.85rem',
              display:'flex',
              justifyContent:'space-between',
              gap:'0.75rem',
              flexWrap:'wrap'
            }}>
              <span style={{fontWeight:'600', color:'#2b6cb0'}}>{d.numDemande}</span>
              <span style={{color:'#2d3748'}}>{d.nomPrenom}</span>
              <span style={{color:'#718096'}}>{d.statut}</span>
              <span style={{color:'#4a5568'}}>
                {d.updatedAt ? new Date(d.updatedAt).toLocaleString('fr-FR', {
                  day:'2-digit',
                  month:'2-digit',
                  hour:'2-digit',
                  minute:'2-digit'
                }) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}






function ModalAssignation({ demande, onClose, onAssigned }) {
  const [agentN1, setAgentN1] = useState(demande.agentN1 || '')
  const [agentN2, setAgentN2] = useState(demande.agentN2 || '')
  const [service, setService] = useState(demande.service || '')
  const [priorite, setPriorite] = useState(demande.priorite || 'Moyen')
  const [users, setUsers] = useState([])
  const auteur = localStorage.getItem('userName') || 'Agent'

  useEffect(() => {
    API.get('/users').then(r => setUsers(r.data.filter(u => u.active !== false))).catch(() => {})
  }, [])

  const agentsN1 = users.filter(u => u.role === 'agent').map(u => u.name)
  const agentsN2 = users.filter(u => u.role === 'manager' || u.role === 'admin').map(u => u.name)

  const priorites = [
    { value: 'Faible', label: 'Faible', color: '#276749', bg: '#f0fff4' },
    { value: 'Moyen', label: 'Moyen', color: '#2b6cb0', bg: '#ebf8ff' },
    { value: 'Élevé', label: 'Élevé', color: '#b7791f', bg: '#fffbeb' },
    { value: 'Urgent', label: 'Urgent', color: '#c53030', bg: '#fff5f5' },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await API.put(`/demandes/${demande.id}`, {
        ...demande,
        agentN1, agentN2, service, priorite,
        dateReception: demande.dateReception,
        dateTraitement: demande.dateTraitement,
      })
      await API.post('/timeline', {
        demandeId: demande.id,
        auteur,
        action: 'Assignation',
        detail: `Réassigné à ${agentN1} (N1) / ${agentN2 || '—'} (N2) — Service: ${service || '—'} — Priorité: ${priorite}`,
      }).catch(() => {})
      onAssigned(res.data)
      onClose()
    } catch { alert("Erreur lors de l'assignation") }
  }

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.5)',zIndex:9998}} />
      <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:'420px',background:'white',borderRadius:'12px',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',zIndex:9999,overflow:'hidden'}}>
        <div style={{background:'#1e4a7a',padding:'1.25rem',color:'white',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h3 style={{margin:0,fontSize:'1rem'}}>👤 Réassigner la demande</h3>
            <div style={{opacity:0.8,fontSize:'0.8rem',marginTop:'0.25rem'}}>{demande.numDemande} — {demande.nomPrenom}</div>
          </div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'white',fontSize:'1.5rem',cursor:'pointer'}}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{padding:'1.5rem'}}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',color:'#4a5568',marginBottom:'0.4rem',fontWeight:'600'}}>Agent N1 (Front Office)</label>
            <select style={{...styles.input, marginBottom:0}} value={agentN1} onChange={e=>setAgentN1(e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {agentsN1.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',color:'#4a5568',marginBottom:'0.4rem',fontWeight:'600'}}>Service</label>
            <select style={{...styles.input, marginBottom:0}} value={service} onChange={e=>setService(e.target.value)}>
              <option value="">-- Service --</option>
              {["DPM","DPR","DSI","DCR","PATRIMOINE","REGISSEUR"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',color:'#4a5568',marginBottom:'0.4rem',fontWeight:'600'}}>Agent N2 (Middle Office)</label>
            <select style={{...styles.input, marginBottom:0}} value={agentN2} onChange={e=>setAgentN2(e.target.value)}>
              <option value="">-- Sélectionner --</option>
              {agentsN2.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'0.85rem',color:'#4a5568',marginBottom:'0.4rem',fontWeight:'600'}}>Niveau de priorité</label>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
              {priorites.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriorite(p.value)}
                  style={{
                    padding:'0.5rem 0.75rem',
                    border: priorite === p.value ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                    borderRadius:'8px',
                    background: priorite === p.value ? p.bg : 'white',
                    color: priorite === p.value ? p.color : '#718096',
                    fontWeight: priorite === p.value ? '700' : '500',
                    fontSize:'0.85rem',
                    cursor:'pointer',
                    transition:'all 0.15s',
                  }}
                >
                  {p.value === 'Faible' && '🟢 '}
                  {p.value === 'Moyen' && '🔵 '}
                  {p.value === 'Élevé' && '🟡 '}
                  {p.value === 'Urgent' && '🔴 '}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <button style={styles.button} type="submit">✅ Confirmer l'assignation</button>
        </form>
      </div>
    </>
  )
}


function RechercheGlobale({ onClose }) {
  const [query, setQuery] = useState('')
  const [resultats, setResultats] = useState({ demandes: [], contacts: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.length < 2) { setResultats({ demandes: [], contacts: [] }); return }
    setLoading(true)
    const q = query.toLowerCase()
    Promise.all([
      API.get('/demandes'),
      API.get('/contacts'),
    ]).then(([d, c]) => {
      setResultats({
        demandes: d.data.filter(x =>
          (x.nomPrenom||'').toLowerCase().includes(q) ||
          (x.numDemande||'').toLowerCase().includes(q) ||
          (x.telephone||'').includes(q) ||
          (x.matricule||'').toLowerCase().includes(q) ||
          (x.email||'').toLowerCase().includes(q) ||
          (x.pays||'').toLowerCase().includes(q) ||
          (x.service||'').toLowerCase().includes(q) ||
          (x.commentaire||'').toLowerCase().includes(q)
        ).slice(0, 5),
        contacts: c.data.filter(x =>
          (x.name||'').toLowerCase().includes(q) ||
          (x.email||'').toLowerCase().includes(q) ||
          (x.phone||'').includes(q)
        ).slice(0, 3),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [query])

  const total = resultats.demandes.length + resultats.contacts.length

  const ouvrirDemande = (demande) => {
    localStorage.setItem('demandeRechercheeId', demande.id)
    onClose()
    window.location.href = '/demandes'
  }

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',zIndex:9997}} />
      <div style={{position:'fixed',top:'80px',left:'50%',transform:'translateX(-50%)',width:'600px',background:'white',borderRadius:'12px',boxShadow:'0 20px 60px rgba(0,0,0,0.2)',zIndex:9998,overflow:'hidden'}}>
        <div style={{padding:'1rem',borderBottom:'1px solid #e2e8f0',display:'flex',alignItems:'center',gap:'0.75rem'}}>
          <span style={{fontSize:'1.2rem'}}>🔍</span>
          <input
            autoFocus
            style={{flex:1,border:'none',outline:'none',fontSize:'1rem',color:'#2d3748'}}
            placeholder="Rechercher une demande, un contact, un matricule..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} style={{background:'transparent',border:'none',cursor:'pointer',color:'#718096',fontSize:'1.2rem'}}>✕</button>
        </div>
        <div style={{maxHeight:'400px',overflowY:'auto',padding:'0.5rem'}}>
          {loading && <div style={{padding:'1rem',textAlign:'center',color:'#718096'}}>Recherche...</div>}
          {!loading && query.length >= 2 && total === 0 && (
            <div style={{padding:'1rem',textAlign:'center',color:'#718096'}}>Aucun résultat pour "{query}"</div>
          )}
          {resultats.demandes.length > 0 && (
            <div>
              <div style={{padding:'0.5rem 0.75rem',fontSize:'0.75rem',fontWeight:'600',color:'#718096',textTransform:'uppercase'}}>📋 Demandes</div>
              {resultats.demandes.map(d => (
                <div
                  key={d.id}
                  onClick={() => ouvrirDemande(d)}
                  style={{padding:'0.65rem 0.75rem',borderRadius:'8px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f7fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div>
                    <span style={{fontWeight:'600',color:'#2b6cb0',fontSize:'0.85rem'}}>{d.numDemande}</span>
                    <span style={{color:'#4a5568',fontSize:'0.85rem',margin:'0 0.5rem'}}>—</span>
                    <span style={{color:'#2d3748',fontSize:'0.85rem'}}>{d.nomPrenom}</span>
                  </div>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <span style={{background:'#ebf8ff',color:'#2b6cb0',padding:'0.15rem 0.5rem',borderRadius:'20px',fontSize:'0.75rem'}}>{d.objetDemande}</span>
                    <span style={{background: d.statut==='Traité'?'#f0fff4':'#fffbeb',color: d.statut==='Traité'?'#276749':'#b7791f',padding:'0.15rem 0.5rem',borderRadius:'20px',fontSize:'0.75rem'}}>{d.statut}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {resultats.contacts.length > 0 && (
            <div>
              <div style={{padding:'0.5rem 0.75rem',fontSize:'0.75rem',fontWeight:'600',color:'#718096',textTransform:'uppercase'}}>👥 Contacts</div>
              {resultats.contacts.map(c => (
                <div key={c.id} style={{padding:'0.65rem 0.75rem',borderRadius:'8px',cursor:'pointer'}}
                  onMouseEnter={e=>e.currentTarget.style.background='#f7fafc'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontWeight:'600',color:'#2d3748',fontSize:'0.85rem'}}>{c.name}</span>
                  <span style={{color:'#718096',fontSize:'0.85rem',margin:'0 0.5rem'}}>—</span>
                  <span style={{color:'#718096',fontSize:'0.85rem'}}>{c.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {!loading && query.length < 2 && (
          <div style={{padding:'1rem',textAlign:'center',color:'#a0aec0',fontSize:'0.85rem'}}>
            Tapez au moins 2 caractères pour rechercher
          </div>
        )}
      </div>
    </>
  )
}


function PageEnquete() {
  const numDemande = window.location.pathname.split('/enquete/')[1]
  const [demande, setDemande] = useState(null)
  const [note, setNote] = useState(0)
  const [avis, setAvis] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (numDemande) {
      API.get(`/enquetes/${numDemande}`)
        .then(r => { setDemande(r.data); setLoading(false) })
        .catch(() => { setError('Demande introuvable'); setLoading(false) })
    }
  }, [numDemande])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!note) return alert('Veuillez sélectionner une note')
    try {
      await API.post(`/enquetes/${numDemande}`, { note, avis })
      setSubmitted(true)
    } catch { alert('Erreur lors de la soumission') }
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{color:'#718096'}}>Chargement...</div>
    </div>
  )

  if (error) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',textAlign:'center',color:'#c53030'}}>{error}</div>
    </div>
  )

  if (submitted) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f0f4f8'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',textAlign:'center',maxWidth:'400px'}}>
        <div style={{fontSize:'3rem',marginBottom:'1rem'}}>🎉</div>
        <h2 style={{color:'#276749',marginBottom:'0.5rem'}}>Merci pour votre retour !</h2>
        <p style={{color:'#718096'}}>Votre avis nous aide à améliorer notre service client.</p>
        <p style={{color:'#4a5568',fontWeight:'600'}}>CRRAE-UMOA — Service Client</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f0f4f8',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{background:'white',borderRadius:'16px',boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:'100%',maxWidth:'480px',overflow:'hidden'}}>
        <div style={{background:'#1e4a7a',padding:'2rem',textAlign:'center'}}>
          <img src="/Logo-crrae.png" alt="CRRAE-UMOA" style={{width:'100px',marginBottom:'1rem'}} />
          <h2 style={{color:'white',margin:0,fontSize:'1.2rem'}}>Enquête de satisfaction</h2>
          <p style={{color:'rgba(255,255,255,0.8)',margin:'0.5rem 0 0',fontSize:'0.9rem'}}>Demande {numDemande}</p>
        </div>
        <div style={{padding:'2rem'}}>
          {demande && (
            <div style={{background:'#f7fafc',borderRadius:'8px',padding:'1rem',marginBottom:'1.5rem'}}>
              <p style={{margin:0,color:'#4a5568',fontSize:'0.9rem'}}>Bonjour <strong>{demande.nomPrenom}</strong>,</p>
              <p style={{margin:'0.5rem 0 0',color:'#718096',fontSize:'0.85rem'}}>
                Votre demande concernant <strong>{demande.objetDemande}</strong> a été traitée. Comment évaluez-vous notre service ?
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <p style={{fontWeight:'600',color:'#2d3748',marginBottom:'1rem'}}>Votre note :</p>
            <div style={{display:'flex',justifyContent:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setNote(n)}
                  style={{width:'52px',height:'52px',borderRadius:'50%',border:`2px solid ${note>=n?'#f6ad55':'#e2e8f0'}`,
                    background: note>=n?'#fbd38d':'white',fontSize:'1.5rem',cursor:'pointer',
                    transition:'all 0.2s'}}>
                  ⭐
                </button>
              ))}
            </div>
            {note > 0 && (
              <p style={{textAlign:'center',color:'#b7791f',marginBottom:'1rem',fontWeight:'600'}}>
                {['','Très insatisfait','Insatisfait','Satisfait','Très satisfait','Excellent !'][note]}
              </p>
            )}
            <textarea
              style={{width:'100%',padding:'0.75rem',border:'1px solid #ddd',borderRadius:'8px',fontSize:'0.95rem',resize:'none',height:'100px',boxSizing:'border-box',marginBottom:'1rem'}}
              placeholder="Commentaire (optionnel) — Avez-vous des suggestions d'amélioration ?"
              value={avis}
              onChange={e => setAvis(e.target.value)}
            />
            <button type="submit"
              style={{width:'100%',padding:'0.85rem',background:'#1e4a7a',color:'white',border:'none',borderRadius:'8px',fontSize:'1rem',cursor:'pointer',fontWeight:'600'}}>
              ✅ Envoyer mon avis
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Layout
function Layout({ onLogout, children, alertes, onRecherche, onNouvelleDemande, demandes = [] }) {
  const navigate = useNavigate()
  const userRole = localStorage.getItem('userRole') || 'agent'
  const isAdmin = userRole === 'admin'
  const isManagerOrAdmin = userRole === 'admin' || userRole === 'manager'

  const critiques = demandes.filter(d =>
    ['En cours', 'En attente'].includes(d.statut) && (d.priorite === 'Urgent' || d.respectDelai === 'NON')
  ).length

  const enCours = demandes.filter(d =>
    d.statut === 'En cours'
  ).length

  return (
    <div style={styles.layout}>
      <nav style={styles.nav}>
        <div style={{textAlign:'center', marginBottom:'1.25rem'}}>
          <img
            src="/Logo-crrae.png"
            alt="CRRAE"
            style={{
              width:'140px',
              background:'white',
              padding:'10px',
              borderRadius:'14px',
              boxShadow:'0 4px 12px rgba(0,0,0,0.15)'
            }}
          />
          <div style={{color:'rgba(255,255,255,0.75)', fontSize:'0.78rem', marginTop:'0.75rem'}}>
            CRM Service Client
          </div>
        </div>

        <button
          onClick={onRecherche}
          style={{
            background:'rgba(255,255,255,0.14)',
            border:'1px solid rgba(255,255,255,0.12)',
            color:'white',
            borderRadius:'10px',
            padding:'0.65rem 0.8rem',
            cursor:'pointer',
            width:'100%',
            textAlign:'left',
            fontSize:'0.88rem',
            marginBottom:'1rem'
          }}
        >
          🔍 Rechercher...
        </button>

        <div style={{fontSize:'0.72rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', margin:'0.5rem 0 0.35rem 0.35rem', letterSpacing:'0.05em'}}>
          Exploitation
        </div>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/dashboard"><span style={styles.sidebarIcon}>📊</span>Dashboard</NavLink>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/demandes">
          <span style={styles.sidebarIcon}>📋</span>Demandes
          {enCours > 0 && (
            <span style={styles.sidebarBadge}>{enCours}</span>
          )}
        </NavLink>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/critiques">
          <span style={styles.sidebarIcon}>🔥</span>File critique
          {critiques > 0 && (
            <span style={{...styles.sidebarBadge, background:'#e53e3e'}}>{critiques}</span>
          )}
        </NavLink>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/contacts"><span style={styles.sidebarIcon}>👥</span>Contacts</NavLink>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/deals"><span style={styles.sidebarIcon}>💼</span>Deals</NavLink>
        {isManagerOrAdmin && (
          <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/campagnes"><span style={styles.sidebarIcon}>📣</span>Campagnes</NavLink>
        )}

        <div style={{height:'1px', background:'rgba(255,255,255,0.12)', margin:'0.9rem 0'}} />

        <div style={{fontSize:'0.72rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', margin:'0.5rem 0 0.35rem 0.35rem', letterSpacing:'0.05em'}}>
          Pilotage
        </div>
        <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/rapports"><span style={styles.sidebarIcon}>📈</span>Rapports</NavLink>

        <div style={{height:'1px', background:'rgba(255,255,255,0.12)', margin:'0.9rem 0'}} />

        <div style={{fontSize:'0.72rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', margin:'0.5rem 0 0.35rem 0.35rem', letterSpacing:'0.05em'}}>
          Administration
        </div>
        {isAdmin && (
          <NavLink style={({ isActive }) => ({ ...styles.navLink, background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' })} to="/users"><span style={styles.sidebarIcon}>👤</span>Utilisateurs</NavLink>
        )}

        <button style={styles.logoutBtn} onClick={onLogout}>🚪 Déconnexion</button>
      </nav>
      <main style={styles.main}>
        <div style={{
          display:'flex',
          justifyContent:'flex-end',
          marginBottom:'1rem'
        }}>
          <button
            onClick={() => {
              if (onNouvelleDemande) onNouvelleDemande()
              navigate('/demandes')
            }}
            style={{
              background:'#2b6cb0',
              color:'white',
              border:'none',
              borderRadius:'10px',
              padding:'0.8rem 1rem',
              fontSize:'0.92rem',
              fontWeight:'600',
              cursor:'pointer',
              boxShadow:'0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            ➕ Nouvelle demande
          </button>
        </div>
        {children}
      </main>
    </div>
  )
}

// App
export default function App() {
  const [auth, setAuth] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setAuth(!!token)
    }

    window.addEventListener('storage', checkAuth)
    window.addEventListener('focus', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('focus', checkAuth)
    }
  }, [])

  const [alertes, setAlertes] = useState([])
  const [demandesApp, setDemandesApp] = useState([])
  const [demandeActive, setDemandeActive] = useState(null)
  const [demandeAssignation, setDemandeAssignation] = useState(null)
  const [showRecherche, setShowRecherche] = useState(false)
  const [ouvrirNouvelleDemande, setOuvrirNouvelleDemande] = useState(false)

  useEffect(() => {
    if (auth) {
      const delaisMax = { DPM:3, DPR:5, DSI:6, PATRIMOINE:7, DCR:5, REGISSEUR:5 }
      API.get('/demandes').then(r => {
        const retard = r.data.filter(d => {
          if (!['En cours', 'En attente'].includes(d.statut)) return false
          if (!d.dateReception) return false
          const jours = Math.ceil((new Date() - new Date(d.dateReception)) / (1000*60*60*24))
          return jours > (delaisMax[d.service] || 3)
        })
        setAlertes(retard)
        setDemandesApp(r.data)
      }).catch(() => {})
    }
  }, [auth])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
    setAuth(false)
  }

  if (window.location.pathname.startsWith('/enquete/')) return <PageEnquete />
  if (window.location.pathname === '/forgot-password') return <ForgotPassword />
  if (window.location.pathname === '/reset-password') return <ResetPassword />
  if (!auth) return <Login onLogin={() => setAuth(true)} />

  return (
    <BrowserRouter>
      <Layout
        onLogout={logout}
        alertes={alertes}
        demandes={demandesApp}
        onRecherche={() => setShowRecherche(true)}
        onNouvelleDemande={() => {
          setOuvrirNouvelleDemande(true)
        }}
      >
        {showRecherche && <RechercheGlobale onClose={() => setShowRecherche(false)} />}
        {demandeActive && <PanneauCommentaires demande={demandeActive} onClose={() => setDemandeActive(null)} />}
        {demandeAssignation && <ModalAssignation demande={demandeAssignation} onClose={() => setDemandeAssignation(null)} onAssigned={(d) => { setDemandeAssignation(null) }} />}
        <Routes>
          <Route path="/dashboard" element={<Dashboard alertes={alertes} />} />
          <Route path="/critiques" element={<FileCritique />} />
          <Route
            path="/demandes"
            element={
              <Demandes
                onOpenCommentaires={setDemandeActive}
                onAssigner={setDemandeAssignation}
                ouvrirNouvelleDemande={ouvrirNouvelleDemande}
                onNouvelleDemandeOuverte={() => setOuvrirNouvelleDemande(false)}
              />
            }
          />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/campagnes" element={(['admin','manager'].includes(localStorage.getItem('userRole'))) ? <Campagnes /> : <Navigate to="/dashboard" />} />
          <Route path="/rapports" element={<Rapports />} />
          <Route path="/users" element={localStorage.getItem('userRole') === 'admin' ? <Users /> : <Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

const styles = {
  loginContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' },
  loginBox: { background: 'white', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', width: '380px' },
  loginTitle: { textAlign: 'center', color: '#1a365d', marginBottom: '0.5rem' },
  loginSubtitle: { textAlign: 'center', color: '#666', marginBottom: '1.5rem' },
  input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' },
  error: { color: 'red', textAlign: 'center', marginBottom: '1rem' },
  layout: { display: 'flex', minHeight: '100vh' },
  nav: {
    width: '250px',
    background: 'linear-gradient(180deg, #163a63 0%, #1e4a7a 100%)',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem'
  },
  navTitle: { color: 'white', marginBottom: '1rem', fontSize: '1rem' },
  navLink: {
    color: '#e6f0fb',
    textDecoration: 'none',
    padding: '0.72rem 0.8rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.92rem',
    transition: 'all 0.2s ease',
  },
  logoutBtn: { marginTop: 'auto', background: 'transparent', color: '#fc8181', border: '1px solid #fc8181', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer' },
  sidebarIcon: { width: '20px', textAlign: 'center', fontSize: '0.95rem' },
  sidebarLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0.65rem 0.9rem',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.9rem',
    marginBottom: '0.35rem'
  },
  sidebarBadge: {
    marginLeft: 'auto',
    background: '#2b6cb0',
    color: 'white',
    fontSize: '0.75rem',
    padding: '2px 7px',
    borderRadius: '12px',
    fontWeight: '600'
  },
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
  badge: { background: '#ebf8ff', color: '#2b6cb0', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', whiteSpace: 'nowrap' },
}
