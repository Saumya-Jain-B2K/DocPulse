import { useState, useEffect } from "react";
import { createContext } from "react";
import axios from 'axios'
import { toast } from 'react-toastify'

export const DoctosContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [dToken, setDToken] = useState(false)
    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/appointments')
            if (data.success) {
                setAppointments(data.appointments)
                console.log(data.appointments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const completeAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl + '/api/doctor/complete-appointment', {appointmentId})
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const {data} = await axios.post(backendUrl + '/api/doctor/cancel-appointment', {appointmentId})
            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getDashData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/dashboard')
            if (data.success) {
                setDashData(data.dashData)
                console.log(data.dashData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/profile')
            if (data.success) {
                setProfileData(data.profileData)
                console.log(data.profileData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    
    useEffect(() => {
        const verify = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/doctor/verify')
                if (data.success) {
                    setDToken(true)
                }
            } catch (error) {
                setDToken(false)
            } finally {
                setLoading(false)
            }
        }
        verify()
    }, [backendUrl])


    const value = {
        dToken,
        setDToken,
        loading,
        backendUrl, 
        appointments,
        setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment, 
        dashData,
        setDashData, 
        getDashData,
        profileData,
        setProfileData,
        getProfileData
    }

    return (
        <DoctosContext.Provider value={value}>
            {props.children}
        </DoctosContext.Provider>
    )
}

export default DoctorContextProvider
