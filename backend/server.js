import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import eventRouter from './routes/eventRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import registrationRouter from './routes/registrationRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
connectCloudinary();

const allowedOrigins = ['http://localhost:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));


//API endpoints
app.get('/', (req, res) => {
    res.send("API Working fine")
})

app.use('/api/auth', authRouter)
app.use('/api/user', userRouter);
app.use('/api/events',eventRouter);
app.use('/api/register',registrationRouter);

app.listen(port, ()=> console.log("Server started on PORT: "+ port));

