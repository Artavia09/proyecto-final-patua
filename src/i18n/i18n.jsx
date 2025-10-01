import React,{createContext,useContext,useMemo,useState} from 'react'
import { translations } from './translations'
const I18nCtx = createContext()
export function I18nProvider({children}){
  const [lang,setLang] = useState(localStorage.getItem('ui_lang')||'es')
  const t = useMemo(()=>{
    const bundle = translations[lang]||translations.es
    return (path)=> path.split('.').reduce((acc,k)=> acc?.[k], bundle)
  },[lang])
  const change = (l)=>{ setLang(l); localStorage.setItem('ui_lang', l) }
  return <I18nCtx.Provider value={{ lang, t, change }}>{children}</I18nCtx.Provider>
}
export const useI18n = ()=> useContext(I18nCtx)
