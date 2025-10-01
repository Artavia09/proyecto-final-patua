import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/i18n.jsx'

export default function Home() {
  const { t } = useI18n()
  return (
    <main className="container">
      <section className="hero">
        <div className="card coral leaf-bg rise delay-1">
          <div className="title">{t('home.welcome_title')}</div>
          <p className="subtitle">{t('home.welcome_sub')}</p>
          <Link to="/traductor" className="btn light" style={{ marginTop: '1rem' }}>
            {t('home.get_started')}
          </Link>
        </div>
        <div className="card teal leaf-bg rise delay-2">
          <div className="title">{t('home.translate_title')}</div>
          <p>Patuá ⇄ Español</p>
          <Link to="/traductor" className="btn" style={{ marginTop: '1rem' }}>
            {t('home.translate_title')}
          </Link>
        </div>
      </section>

      <section className="section grid">
        <div className="card teal leaf-bg rise delay-3">
          <div className="title">{t('home.learn_title')}</div>
          <p>Loara Patuá · frases comunes · pronunciación</p>
          <Link to="/aprender" className="btn light" style={{ marginTop: '1rem' }}>
            {t('home.learn_cta')}
          </Link>
        </div>
        <div className="card orange leaf-bg rise delay-4">
          <div className="title">{t('home.culture_title')}</div>
          <p>Learn about the history and identity of the Caribbean province of Limón.</p>
          <Link to="/cultura" className="btn" style={{ background: '#1E293B', marginTop: '1rem' }}>
            {t('home.culture_more')}
          </Link>
        </div>
      </section>
    </main>
  )
}
