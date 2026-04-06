import React, { useContext } from 'react'
import axios from 'axios'
import { assets } from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import { useNavigate} from 'react-router-dom'
import { DoctosContext } from '../context/DoctorContext'

const Navbar = () => {

    const { aToken, setAToken, backendUrl: adminBackendUrl } = useContext(AdminContext);
    const { dToken, setDToken, backendUrl: doctorBackendUrl } = useContext(DoctosContext)

    const navigate = useNavigate();

    const logout = async () => {
        try {
            if (aToken) {
                await axios.post(adminBackendUrl + '/api/admin/logout')
                setAToken(false)
            }
            if (dToken) {
                await axios.post(doctorBackendUrl + '/api/doctor/logout')
                setDToken(false)
            }
            navigate('/')
        } catch (error) {
            console.log(error)
        }
    }

    
  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>{aToken ? 'Admin' : 'Doctor'}</p>
      </div>
      <button onClick={logout} className='bg-[#000B6D] text-white text-sm px-10 py-2 rounded-full'>Logout</button>
    </div>
  )
}

export default Navbar
