import { useEffect, useState } from 'react'
export const useLocalStore = (key, initial) => {
  const [s, setS] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(s))
  }, [key, s])
  return [s, setS]
}
