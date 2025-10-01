import { db } from './firebase'
import {
  collection, doc, writeBatch, getDocs, serverTimestamp
} from 'firebase/firestore'

const CHUNK = 400 

const normalizeKey = (s='') => s
  .toString()
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/\s+/g, ' ')
  .replace(/[^\w\s-]/g, '')
  .replace(/\s/g, '-')

const buildId = (item) => {
  if (item.id != null) return String(item.id)
  const p = normalizeKey(item.patua || '')
  const e = normalizeKey(item.es || '')
  if (p || e) return `${p}|${e}` || `${Date.now()}`
  return `auto-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
}

const mapEntry = (raw) => {
  const patua = (raw.patua ?? '').trim()
  const es = (raw.es ?? '').trim()
  if (!patua && !es) return null
  return {
    patua,
    es,
    tags: Array.isArray(raw.tags) ? raw.tags : (raw.tags ? [raw.tags] : []),
    audioUrl: (raw.audioUrl ?? '').trim(),
  }
}

async function loadExistingIds(collName) {
  const snap = await getDocs(collection(db, collName))
  const set = new Set()
  snap.forEach(d => set.add(d.id))
  return set
}

/**
 * Importa desde una URL que devuelva:
 *   { "dictionary": [ { patua, es, tags?, audioUrl?, id? }, ... ] }
 * @param {string} url           p.ej. '/seed.json'
 * @param {string} collName      p.ej. 'dictionary'
 * @returns {object} stats       { total, inserted, updated, skipped }
 */
export async function importSeedFromUrl(url = '/seed.json', collName = 'dictionary') {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`No pude leer ${url} (${res.status})`)
  const json = await res.json()
  const source = Array.isArray(json) ? json : json.dictionary
  if (!Array.isArray(source)) throw new Error('Formato inválido: se esperaba { "dictionary": [...] }')

  const cleaned = source.map(mapEntry).filter(Boolean)
  const existing = await loadExistingIds(collName)

  let inserted = 0, updated = 0, skipped = 0
  for (let i = 0; i < cleaned.length; i += CHUNK) {
    const slice = cleaned.slice(i, i + CHUNK)
    const batch = writeBatch(db)
    slice.forEach((item) => {
      const id = buildId(item)
      const ref = doc(collection(db, collName), id)
      const isExisting = existing.has(id)
      batch.set(ref, { ...item, [isExisting ? 'updatedAt' : 'createdAt']: serverTimestamp() }, { merge: true })
      if (isExisting) updated++; else inserted++;
      existing.add(id)
    })
    await batch.commit()
  }

  const total = cleaned.length
  return { total, inserted, updated, skipped }
}
