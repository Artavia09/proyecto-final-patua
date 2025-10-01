export const exportData = () => {
  const favs = localStorage.getItem('fav_phrases') || '[]'
  const seen = localStorage.getItem('seen_phrases') || '[]'
  const payload = JSON.stringify({ favs: JSON.parse(favs), seen: JSON.parse(seen) }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'patua_data_backup.json'
  a.click()
  URL.revokeObjectURL(url)
}
export const importData = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const d = JSON.parse(r.result)
        if (!('favs' in d) && !('seen' in d)) throw new Error('bad')
        localStorage.setItem('fav_phrases', JSON.stringify(d.favs || []))
        localStorage.setItem('seen_phrases', JSON.stringify(d.seen || []))
        res(true)
      } catch (e) {
        rej(e)
      }
    }
    r.onerror = rej
    r.readAsText(file)
  })
