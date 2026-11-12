const Lead = require("../models/leadModel")
const Customer = require("../models/customerModel")

exports.getStats = async(req,res)=>{
    try{
        const userId = req.user._id

        // total leads and customers
        const totalLeads = await Lead.countDocuments({createdBy:userId})
        const totalCustomers = await Customer.countDocuments({createdBy:userId})

        // Lead by status
        const newLeads = await Lead.countDocuments({createdBy: userId, status:"new"})
        const contactedLeads = await Lead.countDocuments({createdBy: userId, status:"contacted"})
        const qualifiedLeads = await Lead.countDocuments({createdBy: userId, status:"qualified"})
        const convertedLeads = await Lead.countDocuments({createdBy: userId, status:"converted"})
        
        // start and end of today
        const startofToday = new Date()
        startofToday.setHours(0,0,0,0)

        const endOfToday = new Date()
        endOfToday.setHours(23,59,59,999)

        // follow-up date is today
        const todayFollowUps = await Lead.countDocuments({
            createdBy: userId,
            status:{$ne:"converted"},
            followUpDate:{$gte:startofToday,$lte:endOfToday}
        })

        // follow-up date before today(lead not covered yet)
        const overdueFollowUps = await Lead.countDocuments({
            createdBy:userId,
            status:{$ne:"converted"},
            followUpDate:{$lt:startofToday}
        })

        // follow-up date after today
        const upcomingFollowUps = await Lead.countDocuments({
            createdBy:userId,
            status:{$ne:"converted"},
            followUpDate:{$gt:endOfToday}
        })

        res.json({
            success:true,
            stats:{
                totalLeads: totalLeads,
                totalCustomers: totalCustomers,
                leadsByStatus:{
                    new:newLeads,
                    contacted: contactedLeads,
                    qualified:qualifiedLeads,
                    converted: convertedLeads
                },
                followUps:{
                    overdue:overdueFollowUps,
                    today: todayFollowUps,
                    upcoming:upcomingFollowUps
                }
            }
        })
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    }
}