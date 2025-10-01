import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  listMyContribs,
  listMySearches,
  deleteMySearch,
  clearMySearches,
  updateMyContribution,
  deleteMyContribution,
  clearMyContribs
} from '../services/userService'
import { useI18n } from '../i18n/i18n.jsx'
import { containsBlocked } from '../utils/blockedWords'

export default function UserSpace() {
  const { user } = useAuth()
  const { t } = useI18n()

  const [contribs, setContribs] = useState([])
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ patua: '', es: '', tags: '', audioUrl: '' })

  useEffect(() => {
    if (!user) return
    setLoading(true)
    setError('')
    Promise.all([
      listMyContribs(user.uid).catch(e => {
        console.error('[UserSpace] contribs error', e)
        return []
      }),
      listMySearches(user.uid).catch(e => {
        console.error('[UserSpace] searches error', e)
        return []
      })
    ])
      .then(([c, s]) => {
        setContribs(c || [])
        setSearches(s || [])
      })
      .catch(e => setError(e?.message || 'Error cargando datos'))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <main className="container">
        <div className="card">
          <p>Inicia sesión para ver tu espacio.</p>
        </div>
      </main>
    )
  }

  const startEdit = (c) => {
    setEditId(c.id)
    setForm({
      patua: c.patua || '',
      es: c.es || '',
      tags: (c.tags || []).join(', '),
      audioUrl: c.audioUrl || ''
    })
  }

  const cancelEdit = () => {
    setEditId(null)
    setForm({ patua: '', es: '', tags: '', audioUrl: '' })
  }

  const saveEdit = async () => {
    const patua = form.patua.trim()
    const es = form.es.trim()
    if (!patua || !es) return alert('Completa Patuá y Español.')
    if (containsBlocked(patua) || containsBlocked(es)) {
      return alert('⚠️ Contenido no permitido (odio/insultos).')
    }
    const values = {
      patua,
      es,
      tags: (form.tags || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      audioUrl: (() => {
        const u = (form.audioUrl || '').trim()
        if (!u) return ''
        return (/^https?:\/\//i.test(u) || u.startsWith('/')) ? u : `/${u}`
      })()
    }
    try {
      await updateMyContribution(user.uid, editId, values)
      setContribs(arr => arr.map(x => (x.id === editId ? { ...x, ...values } : x)))
      cancelEdit()
      alert('✅ Aporte actualizado')
    } catch (e) {
      console.error(e)
      alert('❌ No se pudo actualizar')
    }
  }

  const removeOneContrib = async (id) => {
    if (!confirm('¿Eliminar este aporte?')) return
    try {
      await deleteMyContribution(user.uid, id)
      setContribs(arr => arr.filter(x => x.id !== id))
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar el aporte.')
    }
  }

  const removeAllContribs = async () => {
    if (!confirm('¿Eliminar TODOS tus aportes? Esta acción no se puede deshacer.')) return
    try {
      const { deleted } = await clearMyContribs(user.uid)
      setContribs([])
      alert(`✅ Borrados: ${deleted}`)
    } catch (e) {
      console.error(e)
      alert('No se pudieron eliminar tus aportes.')
    }
  }

  const onDeleteOne = async (id) => {
    if (!confirm('¿Eliminar esta búsqueda?')) return
    try {
      await deleteMySearch(user.uid, id)
      setSearches(arr => arr.filter(s => s.id !== id))
    } catch (e) {
      console.error(e)
      alert('No se pudo eliminar la búsqueda.')
    }
  }

  const onClearAll = async () => {
    if (!confirm('¿Eliminar TODAS tus búsquedas?')) return
    try {
      const { deleted } = await clearMySearches(user.uid)
      setSearches([])
      alert(`✅ Borradas ${deleted} búsquedas`)
    } catch (e) {
      console.error(e)
      alert('No se pudieron eliminar las búsquedas.')
    }
  }

  return (
    <main className="container">
      <div className="card">
        <div className="title">{t('space.title')}</div>

        {loading && <p>Cargando tus datos…</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <h3>{t('space.your_additions')}</h3>

        {contribs.length === 0 ? (
          <p>No has agregado frases todavía.</p>
        ) : (
          <>
            <button className="btn alt" onClick={removeAllContribs} style={{ marginBottom: 8 }}>
              Eliminar todos mis aportes
            </button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {contribs.map(c => (
                <li key={c.id} className="card" style={{ marginBottom: 8 }}>
                  {editId === c.id ? (
                    <>
                      <div style={{ display: 'grid', gap: 6 }}>
                        <label>Patuá</label>
                        <input
                          className="input"
                          value={form.patua}
                          onChange={e => setForm(f => ({ ...f, patua: e.target.value }))}
                        />
                        <label>Español</label>
                        <input
                          className="input"
                          value={form.es}
                          onChange={e => setForm(f => ({ ...f, es: e.target.value }))}
                        />
                        <label>Tags (coma)</label>
                        <input
                          className="input"
                          value={form.tags}
                          onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                        />
                        <label>Audio URL</label>
                        <input
                          className="input"
                          value={form.audioUrl}
                          onChange={e => setForm(f => ({ ...f, audioUrl: e.target.value }))}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={saveEdit}>Guardar</button>
                        <button className="btn alt" onClick={cancelEdit}>Cancelar</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <strong>{c.patua}</strong> → {c.es}{' '}
                      {(c.tags || []).length ? `(${(c.tags || []).join(', ')})` : ''}
                      {c.audioUrl ? (
                        <div style={{ marginTop: 6 }}>
                          <small><code>{c.audioUrl}</code></small>
                        </div>
                      ) : null}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={() => startEdit(c)}>Editar</button>
                        <button className="btn alt" onClick={() => removeOneContrib(c.id)}>Eliminar</button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card">
        <h3>{t('space.your_searches')}</h3>
        {searches.length === 0 ? (
          <p>No has hecho búsquedas todavía.</p>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn alt" onClick={onClearAll}>Eliminar todas</button>
            </div>
            <ul style={{ marginTop: 8 }}>
              {searches.map(s => (
                <li
                  key={s.id}
                  style={{
                    padding: '6px 0',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <div>
                    <code>{s.q}</code> [{s.direction}] {s.exact ? '✔' : '~'}
                  </div>
                  <button className="btn" onClick={() => onDeleteOne(s.id)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  )
}
