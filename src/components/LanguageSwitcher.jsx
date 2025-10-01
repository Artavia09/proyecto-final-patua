import { useI18n } from '../i18n/i18n.jsx'

export default function LanguageSwitcher() {
  const { lang, change, t } = useI18n()
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ color: '#fff', opacity: 0.9, fontWeight: 600 }}>
        {t('settings.language')}:
      </span>
      <select
        value={lang}
        onChange={(e) => change(e.target.value)}
        style={{ padding: '6px 10px', borderRadius: 8, border: 'none' }}
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pat">Patuá</option>
      </select>
    </div>
  )
}
