// This is for people who has potential to buy

const mongoose = require('mongoose')

const leadSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:String,
    company:String,
    source:{type:String, default:"other"},
    status:{
        type:String,
        enum:["new","contacted","qualified","converted","dormant"],
        default:"new",
    },
    notes:String,
    followUpDate: Date,

    // which person owns the lead
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},

},{timestamps:true})

module.exports=mongoose.model("Lead",leadSchema)