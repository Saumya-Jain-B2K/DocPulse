import React, { useContext, useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import { AdminContext } from '../context/AdminContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DoctosContext } from '../context/DoctorContext'
import { useNavigate, useLocation } from 'react-router-dom'

const login = () => {
    const [state, setState] = useState('Admin')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const {setAToken, backendUrl} = useContext(AdminContext)
    const {setDToken} = useContext(DoctosContext)

    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const role = params.get('role')
        const error = params.get('error')

        if (role) {
            if (role === 'admin') {
                setAToken(true)
                toast.success('Admin login successful')
            } else if (role === 'doctor') {
                setDToken(true)
                toast.success('Doctor login successful')
            }
            // Clear URL parameters and navigate to home
            navigate('/', { replace: true })
        }

        if (error === 'unauthorized') {
            toast.error('Invalid Email or Unauthorized account')
            navigate('/', { replace: true })
        }
    }, [location, setAToken, setDToken, navigate])

    const onSubmitHandler = async (event) => {
        event.preventDefault()

        try {
            if (state === 'Admin') {
                const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
                if (data.success) {
                    setAToken(true)
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
                if (data.success) {
                    setDToken(true)
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const googleAuthHandler = () => {
        window.location.href = `${backendUrl}/api/user/google?origin=admin`
    }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
        <div className='flex flex-col gap-3 m-auto items-start p-8 min-h-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
            <p className='text-2xl font-semibold m-auto'><span className='text-[#000B6D]'> {state} </span> Login</p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
            </div>
            <button className='bg-[#000B6D] text-white w-full py-2 rounded-md text-base hover:bg-[#000b6dee] transition-all'>Login</button>
            
            <div className='w-full flex items-center gap-2 my-2'>
                <hr className='flex-1 border-gray-300' />
                <span className='text-gray-400'>OR</span>
                <hr className='flex-1 border-gray-300' />
            </div>

            <button 
                type="button" 
                onClick={googleAuthHandler}
                className='w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-md text-base hover:bg-gray-50 transition-all'
            >
                <img className='w-5' src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                Login with Google
            </button>

            {
                state === 'Admin'
                ? <p>Doctor Login? <span className='text-[#000B6D] underline cursor-pointer' onClick={() => setState('Doctor')}>Click here</span></p>
                : <p>Admin Login? <span className='text-[#000B6D] underline cursor-pointer' onClick={() => setState('Admin')}>Click here</span></p>
            }
        </div>
    </form>
  )
}

export default login
