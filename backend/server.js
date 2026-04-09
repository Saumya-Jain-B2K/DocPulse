import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import 'dotenv/config';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import reviewRouter from './routes/reviewRoute.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import initCronJobs from './utils/cronJobs.js';
import sendEmail from './config/emailConfig.js';

// app config
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();
initCronJobs();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

app.use(passport.initialize());

// Configure Passport to use Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/user/google/callback',
}, (accessToken, refreshToken, profile, done) => {

    return done(null, profile);
}));

//api endpoints
app.use('/api/admin', adminRouter);
// localhost:4000/api/admin/add-doctor

app.use('/api/doctor', doctorRouter)
//used to get the data of all doctors for the frontend code

app.use('/api/user', userRouter)
//used to register the user

app.use('/api/review', reviewRouter)
//used for feedback and ratings

app.get('/', (req, res) => {
    res.send("API is working")
});

app.listen(port, () => {
    console.log("Server Started", port);
    // test email on startup
    // sendEmail('editshot13@gmail.com', 'DocPulse - Startup Test', '<h1>Server Started</h1><p>DocPulse backend is now running and email configuration is being tested.</p>')
    //     .then(() => console.log('Startup test email sent successfully to editshot13@gmail.com'))
    //     .catch(err => console.error('Startup test email failed:', err));
});