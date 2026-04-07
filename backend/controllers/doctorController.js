import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import sendEmail from "../config/emailConfig.js"
import { completionTemplate } from "../utils/emailTemplates.js"
import doctorModel from "../models/doctorModel.js"
import userModel from "../models/userModel.js"

const changeAvailablity = async (req, res) => {
    try {
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available})
        res.json({success: true, message: "Availability changed"})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select(['-password', '-email'])

        res.json({success: true, doctors})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api for doctor login
const loginDoctor = async (req, res) => {
    try {
        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        if (!doctor) {
            return res.json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '2d' })
            
            res.cookie('dToken', token, {
                httpOnly: true,
                secure: false, // set to true in production
                sameSite: 'lax',
                maxAge: 2 * 24 * 60 * 60 * 1000
            });

            res.json({ success: true, token, message: "Login Successful" })
        } else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// api to verify doctor auth
const verifyDoctor = async (req, res) => {
    try {
        res.json({ success: true, message: "Authorized" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// api for doctor logout
const logoutDoctor = async (req, res) => {
    try {
        res.clearCookie('dToken');
        res.json({ success: true, message: "Logged Out" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// api to get app the appointmnets for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const docId = req.docId
        const appointments = await appointmentModel.find({docId})

        res.json({success: true, appointments})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
    try {
        const {appointmentId} = req.body
        const docId = req.docId
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})

            // Send Consultation Completion Email to User
            const userData = await userModel.findById(appointmentData.userId)
            const docData = await doctorModel.findById(docId)
            const emailSubject = 'Consultation Completed - DocPulse'
            const emailHTML = completionTemplate(userData.name, docData.name)
            await sendEmail(userData.email, emailSubject, emailHTML)

            return res.json({success: true, message: "Appointment completed"})
        } else {
            return res.json({success: false, message: "Mark Failed"})
        }
    } catch (error) {
         console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const {appointmentId} = req.body
        const docId = req.docId
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})
            return res.json({success: true, message: "Appointment Cancelled"})
        } else {
            return res.json({success: false, message: "Cancellation Failed"})
        }
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const docId = req.docId
        const appointments = await appointmentModel.find({docId})

        let earnings = 0
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []

        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0,5)
        }

        res.json({success: true, dashData})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api to get the doctor profile for doctor panel
const doctorProfile = async (req, res) => {
    try {
        const docId = req.docId
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({success: true, profileData})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// api to update the doctor profile data from doctor panel
const updateDoctorProfile = async (req, res) => {
    try {
        const {fees, address, available} = req.body
        const docId = req.docId
        await doctorModel.findByIdAndUpdate(docId, {fees, address, available})
        res.json({success: true, message: 'Profile Updated'})
    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message})
    }
}


export { changeAvailablity, doctorList, loginDoctor, appointmentsDoctor, appointmentCancel, appointmentComplete, doctorDashboard, doctorProfile, updateDoctorProfile, logoutDoctor, verifyDoctor }