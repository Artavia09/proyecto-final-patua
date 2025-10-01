import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n/i18n.jsx'

export default function Login() {
  const { t } = useI18n()
  const { login, loginGoogle, register } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const doLogin = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      setMsg('✅')
    } catch {
      setMsg('❌ Revisa tus credenciales o configura Firebase')
    }
  }
  const doRegister = async (e) => {
    e.preventDefault()
    try {
      await register(email, password)
      setMsg('✅ Cuenta creada')
    } catch {
      setMsg('❌ No se pudo crear la cuenta')
    }
  }
  const doGoogle = async () => {
    try {
      await loginGoogle()
    } catch {
      setMsg('❌ Error con Google Sign-in')
    }
  }

  return (
    <main className="container">
      <div className="card">
        <div className="title">{t('auth.title')}</div>
        <form onSubmit={doLogin} style={{ display: 'grid', gap: 10 }}>
          <label>{t('auth.email')}</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <label>{t('auth.password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn" type="submit">
              {t('auth.signin')}
            </button>
            <button className="btn alt" onClick={doRegister}>
              {t('auth.register')}
            </button>
            <button className="btn light" type="button" onClick={doGoogle}>
              {t('auth.google')}
            </button>
          </div>
          {msg && <p>{msg}</p>}
        </form>
      </div>
    </main>
  )
}
