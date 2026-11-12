const express = require('express');
const cors = require('cors')
const dotenv=require('dotenv')
const mongoose = require('mongoose')
require("node:dns").setServers(["8.8.8.8","1.1.1.1"])

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
    res.status(200).json({
        success:true,
        message:"Hello from ventrix backend"
    })
})

// mongoose connection
const connectDB = async () =>{
    try {
        
        await mongoose.connect(process.env.MONGO_URL)

        console.log("MongoDB connected")
    } catch(error){
        console.log("Mongoose connection failed:" ,error.message)
    }
} 
const PORT = process.env.PORT || 5000
const startServer = async () => {
    await connectDB()

    app.listen(PORT,()=>{
        console.log(`Server is running on port ${PORT}`)
    })
}

startServer();