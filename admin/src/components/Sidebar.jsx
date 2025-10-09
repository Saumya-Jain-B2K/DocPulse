import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext'
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';
import { DoctosContext } from '../context/DoctorContext';

const Sidebar = () => {

    const {aToken} = useContext(AdminContext);
    const {dToken} = useContext(DoctosContext)

  return (
    <div className='min-h-screen bg-white border-r'>
      {
        aToken && <ul className='text-[#515151] mt-5'>
            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/admin-dashboard'}>
                <img src={assets.home_icon} alt="" />
                <p className='hidden md:block'>Dashboard</p>
            </NavLink>

            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/all-appointments'}>
                <img src={assets.appointment_icon} alt="" />
                <p className='hidden md:block'>Appointments</p>
            </NavLink>

            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/add-doctor'}>
                <img src={assets.add_icon} alt="" />
                <p className='hidden md:block'>Add Doctor</p>
            </NavLink>

            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/doctor-list'}>
                <img src={assets.people_icon} alt="" />
                <p className='hidden md:block'>Doctors List</p>
            </NavLink>
        </ul>
      }

      {
        dToken && <ul className='text-[#515151] mt-5'>
            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/doctor-dashboard'}>
                <img src={assets.home_icon} alt="" />
                <p className='hidden md:block'>Dashboard</p>
            </NavLink>

            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/doctor-appointments'}>
                <img src={assets.appointment_icon} alt="" />
                <p className='hidden md:block'>Appointments</p>
            </NavLink>

            <NavLink className={({isActive}) => `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-70 cursor-pointer ${isActive ? 'bg-[#F2F3FF] border-r-4 border-[#000B6D]' : ''}`} to={'/doctor-profile'}>
                <img src={assets.people_icon} alt="" />
                <p className='hidden md:block'>Profile</p>
            </NavLink>
        </ul>
      }
    </div>
  )
}

export default Sidebar
