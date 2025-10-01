import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../i18n/i18n.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { t } = useI18n()
  const { user, logout } = useAuth()
  return (
    <header>
      <div
        className="container"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Link to="/" className="brand">
          <span style={{ fontSize: '1.5rem' }}>🟢</span> Patuá
        </Link>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <NavLink to="/traductor">{t('nav.translator')}</NavLink>
          <NavLink to="/aprender">{t('nav.learn')}</NavLink>
          <NavLink to="/cultura">{t('nav.culture')}</NavLink>
          <NavLink to="/agregar">{t('nav.add')}</NavLink>
          <NavLink to="/ajustes">{t('nav.settings')}</NavLink>
          {user ? (
            <>
              <NavLink to="/mi-espacio">{t('nav.space')}</NavLink>
              <button className="btn light" onClick={logout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <NavLink to="/login">{t('nav.login')}</NavLink>
          )}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
