import { useLocalStore } from './useLocalStore'
export const useProgress = () => {
  const [seen, setSeen] = useLocalStore('seen_phrases', [])
  const markSeen = (k) => setSeen((p) => (p.includes(k) ? p : [...p, k]))
  return { seen, markSeen }
}
