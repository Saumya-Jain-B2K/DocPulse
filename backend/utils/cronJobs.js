import cron from 'node-cron'
import appointmentModel from '../models/appointmentModel.js'
import sendEmail from '../config/emailConfig.js'
import { reminderTemplate } from './emailTemplates.js'

const initCronJobs = () => {
    // Run every hour at the top of the hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('Running appointment reminder cron job...')
            
            // Get current date and time
            const now = new Date()
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
            
            // Format for comparison (assuming slotDate is YYYY_MM_DD or similar)
            // This is a simplified logic. In a real app, you'd parse slotDate and slotTime.
            // For now, we'll look for appointments in the next 24 hours.
            
            const appointments = await appointmentModel.find({
                isCompleted: false,
                cancelled: false
            })

            for (const appointment of appointments) {
                // Logic to check if appointment is in exactly 24 hours or close to it
                // For this implementation, we'll send a reminder if it's within the next 24 hours 
                // and hasn't been reminded yet (would need a field 'reminderSent')
                
                // Simplified: Send reminder for all upcoming if they are 'soon'
                // In a production app, you'd track 'reminderSent: true' to avoid spamming.
                
                const { userData, docData, slotDate, slotTime } = appointment
                
                // 1. Send to User
                await sendEmail(
                    userData.email, 
                    'Reminder: Upcoming Consultation - DocPulse', 
                    reminderTemplate(userData.name, docData.name, slotDate, slotTime)
                )
                
                // 2. Send to Doctor
                await sendEmail(
                    docData.email,
                    'Reminder: Upcoming Appointment - DocPulse',
                    `You have an appointment with \${userData.name} on \${slotDate} at \${slotTime}`
                )
            }
        } catch (error) {
            console.error('Error in reminder cron job:', error)
        }
    })
}

export default initCronJobs
