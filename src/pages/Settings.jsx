import { useState } from 'react'
import BackupTools from '../components/BackupTools'
import { db } from '../services/firebase'
import { addDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore'
import { importSeedFromUrl } from '../services/bulkImport'

export default function Settings() {
  const [msg, setMsg] = useState('')

  const runSmoke = async () => {
    setMsg('Probando conexión...')
    console.log('[SMOKE] start')

    try {
      const snap = await getDocs(collection(db, '__ping__'))
      console.log('[SMOKE] read count =', snap.size)

      const ref = await addDoc(collection(db, 'smoke_tests'), {
        ok: true,
        when: serverTimestamp(),
        note: 'hello-firestore',
      })
      console.log('[SMOKE] written id =', ref.id)

      setMsg(`Firestore OK ✅ id=${ref.id}, count(read)=${snap.size}`)
      alert(`Firestore OK ✅ id=${ref.id}`)
    } catch (e) {
      console.error('❌ SMOKE FAIL:', e)
      setMsg(`Firestore FAIL ❌ ${e?.code || e?.name || ''} ${e?.message || ''}`)
      alert(`Firestore FAIL ❌ ${e?.code || e?.name || ''} ${e?.message || ''}`)
    }

    console.log('[SMOKE] end')
  }

  const runImport = async () => {
    if (
      !confirm(
        'Importará/actualizará los datos de /seed.json a Firestore (colección: dictionary). ¿Continuar?',
      )
    )
      return
    setMsg('Importando…')
    try {
      const r = await importSeedFromUrl('/seed.json', 'dictionary')
      setMsg(
        `✅ Import listo: total=${r.total}, insertados=${r.inserted}, actualizados=${r.updated}, omitidos=${r.skipped}`,
      )
      alert(
        `✅ Import listo: total=${r.total}, insertados=${r.inserted}, actualizados=${r.updated}`,
      )
    } catch (e) {
      console.error(e)
      setMsg(`❌ Import falló: ${e?.message || e}`)
      alert(`❌ Import falló: ${e?.message || e}`)
    }
  }

  return (
    <main className="container">
      <h2>Ajustes / Settings</h2>
      <BackupTools />

      {/* Prueba de conexión */}
      <div className="card cream" style={{ marginTop: 16 }}>
        <div className="title">Prueba de Firestore</div>
        <button className="btn" onClick={runSmoke}>
          Probar conexión
        </button>
      </div>

      {/* Importar seed.json */}
      <div className="card teal" style={{ marginTop: 16 }}>
        <div className="title">Subir diccionario a Firestore</div>
        <p>
          Usa el archivo <code>/seed.json</code> con la forma{' '}
          <code>{'{ "dictionary": [ ... ] }'}</code>.
        </p>
        <button className="btn alt" onClick={runImport}>
          Importar ahora
        </button>
      </div>

      {msg && <p style={{ marginTop: 16 }}>{msg}</p>}
    </main>
  )
}
