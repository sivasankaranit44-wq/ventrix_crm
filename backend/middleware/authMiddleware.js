const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// checks that user is logged in
exports.protect = async (req,res,next) =>{
    try{
        // getting the token from the header
        const header = req.headers.authorization

        if(!header || !header.startsWith("Bearer ")){
            return res.status(401).json({success:false, message:"Not logged in, No token"})
        }

        const token = header.split(" ")[1]

        // check the token is real and valid
        const decoded = jwt.verify(token, process.env,JWT_SECRET)

        // find the user that token belongs to
        const user = await User.findById(decoded.id)

        if(!user){
            return res.status(401).json({success:false, message:"User not found"})
        }
        // save the user on the request so that controllers can use req.user
        req.user = user

        // let the request continue
        next()
    } catch(error){
        res.status(401).json({success:false, message:"Invalid token"})
    }
}