import { useEffect, useMemo, useRef, useState } from 'react'
import { getAll } from '../services/dictionaryService'
import { normalize } from '../utils/normalize'
import { bestMatches } from '../utils/fuzzy'
import { useFavorites } from '../hooks/useFavorites'
import { useProgress } from '../hooks/useProgress'
import { useI18n } from '../i18n/i18n.jsx'
import { useAuth } from '../hooks/useAuth'
import { logSearch } from '../services/userService'

export default function Translator() {
  const { t } = useI18n()
  const { user } = useAuth()

  const [direction, setDirection] = useState('patua-es')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('—')
  const [audioUrl, setAudioUrl] = useState('')
  const [list, setList] = useState([])
  const [suggestions, setSuggestions] = useState([])

  const { toggle } = useFavorites()
  const { markSeen } = useProgress()

  const lastSeenKeyRef = useRef(null)
  useEffect(() => {
    getAll(user?.uid).then(setList)
  }, [user])

  const maps = useMemo(() => {
    const forward = {}
    const reverse = {}
    for (const item of list) {
      const p = normalize(item.patua || '')
      const e = normalize(item.es || '')
      if (p) forward[p] = item.es ?? ''
      if (e) reverse[e] = item.patua ?? ''
    }
    return { forward, reverse }
  }, [list])

  useEffect(() => {
    const q = normalize(input)

    if (!q) {
      setOutput('—')
      setSuggestions([])
      setAudioUrl('')
      lastSeenKeyRef.current = null
      return
    }

    const map = direction === 'patua-es' ? maps.forward : maps.reverse

    if (map[q]) {
      setOutput(map[q])
      setSuggestions([])

      if (lastSeenKeyRef.current !== q) {
        lastSeenKeyRef.current = q
        markSeen(q)
      }

      const found = list.find(
        (it) =>
          (direction === 'patua-es' ? it.patua : it.es)?.toLowerCase() === input.toLowerCase(),
      )
      // Si el audio es relativo, nos aseguramos que empiece por '/'
      const url = found?.audioUrl || ''
      setAudioUrl(url && !/^https?:\/\//.test(url) && !url.startsWith('/') ? `/${url}` : url)

      if (user) logSearch(user.uid, { q: input, direction, exact: true })
      return
    }

    const candidates = Object.keys(map)
    const best = bestMatches(q, candidates, 5)

    setOutput(t('translator.no_exact'))
    setAudioUrl('')
    setSuggestions(best.map((b) => ({ key: b.value, value: map[b.value], score: b.score })))

    if (user) {
      logSearch(user.uid, {
        q: input,
        direction,
        exact: false,
        suggestions: best.map((b) => b.value),
      })
    }
  }, [input, direction, maps, list, user])

  const map = direction === 'patua-es' ? maps.forward : maps.reverse

  const saveFav = () => {
    const key = normalize(input)
    if (!key || !map[key]) return
    toggle({ key, value: map[key], dir: direction })
  }

  return (
    <main className="container">
      <div className="card teal leaf-bg">
        <div className="title">{t('translator.title')}</div>

        <div style={{ display: 'grid', gap: '.8rem' }}>
          <label>{t('translator.dir_label')}</label>
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            className="input"
          >
            <option value="patua-es">{t('translator.dir_pe')}</option>
            <option value="es-patua">{t('translator.dir_ep')}</option>
          </select>

          <textarea
            rows="3"
            className="input"
            placeholder={t('translator.input')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <label>{t('translator.output')}</label>
          <input readOnly className="output" value={output} />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn alt" onClick={saveFav}>
              {t('translator.fav')}
            </button>

            <button
              className="playbtn"
              onClick={() => audioUrl && new Audio(audioUrl).play()}
              disabled={!audioUrl}
              title={audioUrl ? '' : 'No hay audio disponible'}
            >
              ▶ {t('translator.play')}
            </button>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="card cream">
          <div className="title">{t('translator.suggestions')}</div>
          {suggestions.map((s, i) => (
            <div
              key={`${s.key}-${i}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '.3rem 0',
              }}
            >
              <span>
                <strong>{s.key}</strong> → {s.value}
              </span>
              <span className="pill" style={{ background: 'rgba(0,0,0,.1)', color: '#1E293B' }}>
                dist: {s.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
