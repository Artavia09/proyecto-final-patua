import { normalize } from './normalize'
const lev = (a, b) => {
  a = normalize(a)
  b = normalize(b)
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) {
    m[0][j] = j
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + c)
    }
  }
  return m[a.length][b.length]
}
export const bestMatches = (q, cands, max = 5) => {
  const s = cands.map((c) => ({ value: c, score: lev(q, c) }))
  s.sort((a, b) => a.score - b.score)
  return s.slice(0, max)
}
