import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import {ToastContainer} from 'react-toastify'
import CreateEventForm from './pages/CreateEventForm'
import RegisterEventForm from './pages/RegisterEventForm'
import Events from './pages/Events'
import About from './pages/About'
import Contact from './pages/Contact'

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/events' element={<Events/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/create-event' element={<CreateEventForm/>}/>
        <Route path='/register-event' element={<RegisterEventForm/>}/>
      </Routes>
    </div>
  )
}

export default App