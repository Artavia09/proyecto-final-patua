import {
  collection, getDocs, addDoc, setDoc, doc, deleteDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore'
import { db } from './firebase'

const COLL = 'dictionary'
const colRef = collection(db, COLL)

export async function getAll() {
  const snap = await getDocs(query(colRef, orderBy('patua')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addEntry(entry) {
  const payload = {
    patua: (entry.patua || '').trim(),
    es: (entry.es || '').trim(),
    audioUrl: entry.audioUrl || '',
    tags: Array.isArray(entry.tags) ? entry.tags : (entry.tags ? [entry.tags] : []),
    createdAt: serverTimestamp(),
  }
  if (!payload.patua && !payload.es) throw new Error('Entrada vacía')
  const ref = await addDoc(colRef, payload)
  return { id: ref.id, ...payload }
}

export async function updateEntry(id, patch) {
  const payload = { ...patch, updatedAt: serverTimestamp() }
  await setDoc(doc(db, COLL, id), payload, { merge: true })
  return { id, ...payload }
}

export async function deleteEntry(id) {
  await deleteDoc(doc(db, COLL, id))
  return true
}
