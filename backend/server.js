const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

const app = express()
// middlewares
app.use(cors())
app.use(express.json())
dotenv.config()
// health meter check
app.get("/",(req,res)=>{
    res.status(200).json({succcess:true, message:"Ventrix backend is running"})
})

// server port 
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})