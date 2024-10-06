import { Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login/Login'
import Chat from './Pages/Chat/Chat'
import ProfileUpdate from './Pages/ProfileUpdate/ProfileUpdate'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './Config/Firebase'

function App() {

  const navigate = useNavigate ();

  useEffect (()=> {
    onAuthStateChanged(auth, async (user)=> {
      if (user) {
        navigate('/Chat')
      } else {
        navigate('/');
      }
    })
  }, [])

  return (
    <>
    <ToastContainer />
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/Chat' element={<Chat />} ></Route>
        <Route path='/ProfileUpdate' element={<ProfileUpdate />} ></Route>
      </Routes>

    </>
  )
}

export default App
