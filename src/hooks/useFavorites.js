import { useLocalStore } from './useLocalStore'
export const useFavorites = () => {
  const [favs, setFavs] = useLocalStore('fav_phrases', [])
  const toggle = (item) => {
    setFavs((prev) => {
      const e = prev.find((p) => p.key === item.key)
      return e ? prev.filter((p) => p.key !== item.key) : [...prev, item]
    })
  }
  const isFav = (k) => favs.some((p) => p.key === k)
  return { favs, toggle, isFav }
}
