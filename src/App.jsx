import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login/Login'
import Chat from './Pages/Chat/Chat'
import ProfileUpdate from './Pages/ProfileUpdate/ProfileUpdate'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/Chat' element={<Chat />} ></Route>
        <Route path='/ProfileUpdate' element={<ProfileUpdate />} ></Route>
      </Routes>

    </>
  )
}

export default App
