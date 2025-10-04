import { createContext } from "react";

export const DoctosContext = createContext()

const DoctorContextProvider = (props) => {
    const value = {

    }

    return (
        <DoctosContext.Provider value={value}>
            {props.children}
        </DoctosContext.Provider>
    )
}

export default DoctorContextProvider
