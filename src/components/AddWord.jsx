import { useState } from 'react'
import { addEntry } from '../services/dictionaryService' 
import { useI18n } from '../i18n/i18n.jsx'
import { containsBlocked } from '../utils/blockedWords'
import { useAuth } from '../hooks/useAuth'
import { saveMyContribution } from '../services/userService'

const parseTags = (s) =>
  Array.isArray(s) ? s :
  (s || '')
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

const normalizeAudio = (url) => {
  if (!url) return ''
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) return `/${url}`
  return url
}

export default function AddWord() {
  const { t } = useI18n()
  const { user } = useAuth()

  const [patua, setPatua] = useState('')
  const [es, setEs] = useState('')
  const [tags, setTags] = useState('')
  const [audio, setAudio] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setMsg('')

    if (!user) {
      setMsg('Debes iniciar sesión para agregar palabras.')
      return
    }

    if (!patua.trim() || !es.trim()) {
      setMsg('Completa Patuá y Español.')
      return
    }
  
    if (containsBlocked(patua) || containsBlocked(es)) {
      setMsg('⚠️ No se permite contenido ofensivo o discriminatorio.')
      return
    }

    const entry = {
      patua: patua.trim(),
      es: es.trim(),
      tags: parseTags(tags),
      audioUrl: normalizeAudio(audio.trim()),
    }

    try {
      setBusy(true)

      const saved = await addEntry(entry)

      await saveMyContribution(user.uid, {
        patua: saved.patua,
        es: saved.es,
        tags: saved.tags || [],
        audioUrl: saved.audioUrl || ''
      }).catch(() => {}) 

      setMsg(`${t('add.saved')}: ${saved.patua} → ${saved.es}`)
      setPatua(''); setEs(''); setTags(''); setAudio('')
    } catch (err) {
      console.error('[AddWord] Error al guardar', err)
      setMsg(`Error al guardar. ${err?.code === 'permission-denied' ? 'Revisa que hayas iniciado sesión y las reglas de Firestore.' : 'Intenta de nuevo.'}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="container">
      <h2>{t('add.title')}</h2>

      <form className="card" onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <label>{t('add.patua')}</label>
        <input
          className="input"
          value={patua}
          onChange={e => setPatua(e.target.value)}
          placeholder="Ej: weh yuh de?"
          autoComplete="off"
        />

        <label>{t('add.spanish')}</label>
        <input
          className="input"
          value={es}
          onChange={e => setEs(e.target.value)}
          placeholder="Ej: ¿Dónde estás?"
          autoComplete="off"
        />

        <label>{t('add.tags')}</label>
        <input
          className="input"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="saludo, dirección, comida"
          autoComplete="off"
        />

        <label>{t('add.audio')}</label>
        <input
          className="input"
          value={audio}
          onChange={e => setAudio(e.target.value)}
          placeholder="/audio/sample_001.mp3 o https://.../audio.mp3"
          autoComplete="off"
        />

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Guardando…' : t('add.save')}
        </button>

        {msg && <p style={{ marginTop: '.6rem' }}>{msg}</p>}
      </form>
    </main>
  )
}
