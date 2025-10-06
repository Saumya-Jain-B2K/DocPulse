import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import 'dotenv/config';
import connectCloudinary from './config/cloudinary.js';
import adminRouter from './routes/adminRoute.js';
import doctorRouter from './routes/doctorRoute.js';


// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors()); 

//api endpoints
app.use('/api/admin', adminRouter);
// localhost:4000/api/admin/add-doctor

app.use('/api/doctor', doctorRouter)
//used to get the data of all doctors for the frontend code

app.get('/', (req, res) => {
    res.send("API is working")
});

app.listen(port, () => console.log("Server Started", port))