import { useEffect, useMemo, useState } from 'react'
import { getAll } from '../services/dictionaryService'
import { useProgress } from '../hooks/useProgress'
import { useI18n } from '../i18n/i18n.jsx'

const normalizeAudio = (url) => {
  if (!url) return ''
  return !/^https?:\/\//i.test(url) && !url.startsWith('/') ? `/${url}` : url
}

export default function Learning() {
  const { t } = useI18n()
  const { seen } = useProgress()

  const [items, setItems] = useState([])
  const [topic, setTopic] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    getAll()
      .then((arr) => {
        if (!mounted) return
        // saneamos datos: asegurar arrays y normalizar audio
        const clean = (arr || []).map((it, i) => ({
          id: it.id || `row_${i}`,
          patua: it.patua || '',
          es: it.es || '',
          tags: Array.isArray(it.tags) ? it.tags : it.tags ? [it.tags] : [],
          audioUrl: normalizeAudio(it.audioUrl || ''),
        }))
        setItems(clean)
      })
      .catch((e) => {
        if (!mounted) return
        console.error('[Learning] getAll fail:', e)
        setError('No se pudo cargar el contenido.')
        setItems([])
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  const topics = useMemo(() => {
    const set = new Set()
    items.forEach((i) => (i.tags || []).forEach((tag) => set.add(tag)))
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => {
    if (topic === 'all') return items
    return items.filter((i) => (i.tags || []).includes(topic))
  }, [items, topic])

  const play = (url) => {
    if (!url) return
    try {
      const a = new Audio(url)
      a.play().catch(() => {})
    } catch {}
  }

  return (
    <main className="container">
      <h2>{t('learn.title')}</h2>

      <div className="card">
        <label>{t('learn.filter_label')}</label>
        <select className="input" value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">{t('learn.filter_all')}</option>
          {topics.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="card cream" style={{ marginTop: 12 }}>
          <p>Cargando…</p>
        </div>
      )}

      {error && !loading && (
        <div className="card cream" style={{ marginTop: 12 }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid">
          {filtered.map((p) => (
            <div key={p.id} className="card">
              <h3>{p.patua}</h3>
              <p>{p.es}</p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '.3rem 0' }}>
                {(p.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="pill"
                    style={{ background: 'rgba(0,0,0,.08)', color: '#1E293B' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button className="btn" onClick={() => play(p.audioUrl)} disabled={!p.audioUrl}>
                  ▶ {t('learn.play')}
                </button>
                {seen.includes((p.patua || '').toLowerCase()) && (
                  <small className="pill">{t('learn.seen')}</small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
