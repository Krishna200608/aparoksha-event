import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import ResetPassword from './pages/ResetPassword'
import EmailVerify from './pages/EmailVerify'
import {ToastContainer} from 'react-toastify'
import CreateEventForm from './pages/CreateEventForm'
import Events from './pages/Events'
import About from './pages/About'
import Contact from './pages/Contact'
import EventPage from './pages/EventPage'
import Member from './pages/Member'

const App = () => {
  return (
    <div>
      <ToastContainer/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/events' element={<Events/>}/>
        <Route path='/events/:eventId' element={<EventPage/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/email-verify' element={<EmailVerify/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>
        <Route path='/create-event' element={<CreateEventForm/>}/>
        <Route path='/member' element={<Member/>}/>
      </Routes>
    </div>
  )
}

export default App