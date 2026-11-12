const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true
    },
    phone:String,
    company:String,

    // Customer history

    notes:[{
        text:String,
        date:{type:Date, default:Date.now}
    }],

    // Lead source
    convertedFrom: {type:mongoose.Schema.Types.ObjectId, ref:"Lead"},

    // which user owns the customer
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},
}, {timestamps:true})

module.exports= mongoose.model("Customer", customerSchema)