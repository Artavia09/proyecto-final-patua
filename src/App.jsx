import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Translator from './components/Translator.jsx'
import Learning from './components/Learning.jsx'
import Culture from './pages/Culture.jsx'
import AddWord from './components/AddWord.jsx'
import Navbar from './components/Navbar.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import UserSpace from './pages/UserSpace.jsx'

import { firestoreSmokeTest } from './services/firestoresmoketest.js' 

export default function App() {
  useEffect(() => {
    firestoreSmokeTest()
      .then(r => console.log('✅ Firestore OK:', r))
      .catch(e => console.error('❌ Firestore FAIL:', e))
  }, [])

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/traductor" element={<Translator />} />
        <Route path="/aprender" element={<Learning />} />
        <Route path="/cultura" element={<Culture />} />
        <Route path="/agregar" element={<AddWord />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mi-espacio" element={<UserSpace />} />
      </Routes>
    </>
  )
}
