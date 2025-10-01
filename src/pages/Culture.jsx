import { useI18n } from '../i18n/i18n.jsx'

export default function Culture() {
  const { t } = useI18n()
  return (
    <main className="container">
      <section className="card orange leaf-bg rise">
        <div className="title">{t('culture.title')}</div>
        <p>{t('culture.intro')}</p>
      </section>
      <section className="grid">
        <article className="card rise">
          <h3>{t('culture.sections.origin')}</h3>
          <p>{t('culture.sections.origin_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.language')}</h3>
          <p>{t('culture.sections.language_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.clothes')}</h3>
          <p>{t('culture.sections.clothes_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.food')}</h3>
          <p>{t('culture.sections.food_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.music')}</h3>
          <p>{t('culture.sections.music_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.fest')}</h3>
          <p>{t('culture.sections.fest_txt')}</p>
        </article>
        <article className="card rise">
          <h3>{t('culture.sections.values')}</h3>
          <p>{t('culture.sections.values_txt')}</p>
        </article>
      </section>
    </main>
  )
}
