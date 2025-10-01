import { db } from './firebase';
import { addDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

export async function firestoreSmokeTest() {
  const ref = await addDoc(collection(db, 'smoke_tests'), {
    ok: true,
    when: serverTimestamp(),
    note: 'hello-firestore'
  });
  const snap = await getDocs(collection(db, 'smoke_tests'));
  return { writtenId: ref.id, count: snap.size };
}
