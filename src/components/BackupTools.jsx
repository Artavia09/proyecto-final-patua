import { exportData, importData } from '../utils/exportImport'
import { useI18n } from '../i18n/i18n.jsx'
import { useRef, useState } from 'react'

export default function BackupTools() {
  const { t } = useI18n()
  const fileRef = useRef()
  const [status, setStatus] = useState('')
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn" onClick={exportData}>
          {t('settings.export')}
        </button>
        <button className="btn alt" onClick={() => fileRef.current.click()}>
          {t('settings.import')}
        </button>
        <input
          type="file"
          accept="application/json"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            try {
              await importData(file)
              setStatus(t('settings.import_ok'))
            } catch {
              setStatus(t('settings.import_err'))
            }
          }}
        />
      </div>
      {status && <p style={{ marginTop: '.6rem' }}>{status}</p>}
    </div>
  )
}
