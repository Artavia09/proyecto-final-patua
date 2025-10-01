import { db } from './firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  deleteDoc,
  writeBatch,
  limit,
  updateDoc,  
} from 'firebase/firestore'

export const logSearch = async (uid, payload) => {
  if (!uid) return
  try {
    await addDoc(collection(db, 'searches'), { uid, ...payload, ts: serverTimestamp() })
  } catch (err) {
    console.error('[userService] logSearch error:', err)
  }
}

export const listMySearches = async (uid) => {
  if (!uid) return []
  const q = query(collection(db, 'searches'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const deleteMySearch = async (uid, id) => {
  if (!uid || !id) throw new Error('Faltan uid o id')
  await deleteDoc(doc(db, 'searches', id))
  return true
}

export const clearMySearches = async (uid, batchSize = 400) => {
  if (!uid) throw new Error('Falta uid')

  let deleted = 0
  while (true) {
    const qy = query(
      collection(db, 'searches'),
      where('uid', '==', uid),
      limit(batchSize)
    )
    const snap = await getDocs(qy)
    if (snap.empty) break

    const batch = writeBatch(db)
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    deleted += snap.size

    if (snap.size < batchSize) break
  }
  return { deleted }
}

export const saveMyContribution = async (uid, payload) => {
  if (!uid) return
  try {
    await addDoc(collection(db, 'contribs'), { uid, ...payload, ts: serverTimestamp() })
  } catch (err) {
    console.error('[userService] saveMyContribution error:', err)
  }
}

export const listMyContribs = async (uid) => {
  if (!uid) return []
  const q = query(collection(db, 'contribs'), where('uid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateMyContribution = async (uid, id, values) => {
  if (!uid || !id) throw new Error('Faltan uid o id')
  const patch = {
    ...(values.patua != null ? { patua: String(values.patua) } : {}),
    ...(values.es != null ? { es: String(values.es) } : {}),
    ...(Array.isArray(values.tags) ? { tags: values.tags } : {}),
    ...(values.audioUrl != null ? { audioUrl: String(values.audioUrl) } : {}),
    ts: serverTimestamp(),
  }
  await updateDoc(doc(db, 'contribs', id), patch)
  return true
}

export const deleteMyContribution = async (uid, id) => {
  if (!uid || !id) throw new Error('Faltan uid o id')
  await deleteDoc(doc(db, 'contribs', id))
  return true
}

export const clearMyContribs = async (uid, batchSize = 400) => {
  if (!uid) throw new Error('Falta uid')

  let deleted = 0
  while (true) {
    const qy = query(
      collection(db, 'contribs'),
      where('uid', '==', uid),
      limit(batchSize)
    )
    const snap = await getDocs(qy)
    if (snap.empty) break

    const batch = writeBatch(db)
    snap.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
    deleted += snap.size

    if (snap.size < batchSize) break
  }
  return { deleted }
}
