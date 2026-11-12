const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

// make a login token 
const makeToken = (userId)=>{
    return jwt.sign({id:userId}, process.env.JWT_SECRET)
}

// registering the new user
exports.register = async(req,res)=>{
    try{
        const{name,email,password} = req.body

        // check all fields are reqd.
        if(!name || !email || !password) {
            return res.status(400).json({success:false, message:"All the fields are required"})
        }
        if(password.length<6){
            return res.status(400).json({success:false, message:"Password must be atleast 6 characters"})
        }

        // checking email already exists or not
        const existingUser=await User.findOne({email:email.toLowerCase()})
        if(existingUser){
            return res.status(400).json({success:false, message:"Email already exists"})
        }

        // hashing the password
        const hashedPassword = await bcrypt.hash(password,10)

        // save the user
        const user = await User.create({name,email, password:hashedPassword})

        // send back then token and userdetails (w/o password)
        res.status(201).json({
            success:true,
            token:makeToken(user._id),
            user:{id:user._id, name:user.name, email:user.email}
        })
    } catch(error){
        res.status(500).json({success:false, message: error.message})
    }
}

// Login if its a existing user
exports.login = async(req,res) =>  {
    try{
        const {email,password} = req.body

        // checks all the fields are filled
        if(!email || !password){
            return res.status(400).json({success:false, message:"All the fields are required"})
        }

        // finding the user by email
        const user = await User.findOne({email:email.toLowerCase()})
        if(!user){
            return res.status(401).json({success:false, message:"Invalid email or password"})
        }

        // comparing the password typed with hashed password
        const passwordMatches = await bcrypt.compare(password, user.password)
        if(!passwordMatches){
            return res.status(401).json({success:false, message:"Please enter valid credentials"})
        }

        // send back the token
        res.json({
            success:true,
            token: makeToken(user._id),
            user: {id:user._id, name:user.name, email:user.email},
        })
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    }
}