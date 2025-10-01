import { collection, addDoc } from 'firebase/firestore'
import { db } from './firebase'

const normalizeEntry = (e) => ({
  patua: e.patua ?? e.p ?? e.word ?? '',
  es: e.es ?? e.spanish ?? e.translation ?? '',
  audioUrl: e.audioUrl ?? e.audio ?? '',
  tags: Array.isArray(e.tags) ? e.tags : (e.tags ? [e.tags] : []),
})

export async function importFromJsonToFirestore (jsonUrl = '/db.json') {
  const r = await fetch(jsonUrl)
  const raw = await r.json()
  const entries = Array.isArray(raw) ? raw : Array.isArray(raw.entries) ? raw.entries : []

  const coll = collection(db, 'dictionary')
  let ok = 0, fail = 0
  for (const e of entries) {
    const data = normalizeEntry(e)
    if (!data.patua && !data.es) { fail++; continue }
    try {
      await addDoc(coll, data)
      ok++
    } catch {
      fail++
    }
  }
  return { ok, fail, total: entries.length }
}
