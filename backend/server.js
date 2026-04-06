import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import 'dotenv/config';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import userRouter from './routes/userRoute.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';


// app config
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

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

app.get('/', (req, res) => {
    res.send("API is working")
});

app.listen(port, () => console.log("Server Started", port))