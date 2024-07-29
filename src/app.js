import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({
    origin: process.env.CORS_SOURCE,
    credentials: true
}))

app.use(express.json({limit: "16kb"})) //sets the limit of size of json responses 
app.use(express.urlencoded({extended: true, limit: "16kb"})) //allow to access encoded urls for example the ones with % signs
app.use(express.static("public")) //creates static path
app.use(cookieParser()) //allows crud operations on client browser


//importing routes
import userRouter from './routes/user.routes.js'

//routes declarations
app.use('/api/v1/users', userRouter) 
//http://localhost:8000/api/v1/users/register


export default app 