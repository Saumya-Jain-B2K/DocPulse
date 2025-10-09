import { useState } from "react";
import { createContext } from "react";

export const DoctosContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken'): '')
    const value = {
        dToken,
        setDToken,
        backendUrl
    }

    return (
        <DoctosContext.Provider value={value}>
            {props.children}
        </DoctosContext.Provider>
    )
}

export default DoctorContextProvider
