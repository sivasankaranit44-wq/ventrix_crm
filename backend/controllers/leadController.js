const Lead = require("../models/leadModel")

// add a lead 
exports.createLead = async(req,res) => {
    try{
        const {name,email} = req.body

        // simple validation
        if(!name || !email){
            return res.status(400).json({success:false, message:"Name and Email are required!"})
        }

        const lead = await Lead.create({
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            company:req.body.company,
            source:req.body.source,
            status:req.body.status,
            notes:req.body.notes,
            followUpDate:req.body.followUpDate,
            createdBy: req.user._id //comes from login token
        }) 
        res.status(201).json({success:true,lead})
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    } 
} 

// getting all leads (with search, filters, sort and pagination)
exports.getLeads=async(req,res)=>{
    try{
        // only specific user's leads
        const filter = {createdBy:req.user._id}

        // filtering by status like new,converted,qualified
        if(req.query.status) {
            filter.status =req.query.status
        }

        //  search by name email or company
        if(req.query.search){
            filter.$or =[
                {name:{$regex: req.query.search, $options:"i"}},
                {email:{$regex:req.query.search, $options:"i"}},
                {company:{$regex:req.query.search, $options:"i"}},
            ];
        }
        // sorting 
        let sortOption = {createdAt:-1}
        if(req.query.sort ==="name"){
            sortOption = {name:1}
        }

        // pagination
        const page = Number(req.query.page) ||1;
        const limit = Number(req.query.limit)||10;
        const skip = (page-1) *limit;

        const leads = await Lead.find(filter).sort(sortOption).skip(skip).limit(limit);
        const total = await Lead.countDocuments(filter);

        res.json({
            success:true,
            leads: leads,
            total:total,
            page:page,
            totalPages: Math.ceil(total/limit),
        })
    } catch(error){
        res.status(500).json({success:false, message: error.message})
    }
}

// get one lead
exports.getLead = async(req,res)=>{
    try{
        const lead =await Lead.findOne({_id:req.params.id, createdBy: req.user._id})

        if(!lead){
            return res.status(404).json({success:false, message:"Lead not found"})
        }
        res.json({success:true, lead})
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    }
}

// editing a lead and changing the status
exports.updateLead = async(req,res)=>{
    try{
        delete req.body.createdBy
        const lead = await Lead.findOneAndUpdate(
            {_id:req.params.id, createdBy:req.user._id},
            req.body,
            {new:true}
        )

        if(!lead){
            return res.status(404).json({success:false, message:"Lead not found"})
        }
        res.json({success:true, lead})
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    }
}

// deleting the lead
exports.deleteLead = async(req,res) =>{
    try{
        const lead = await Lead.findOneAndDelete(
            {_id:req.params.id, createdBy:req.user._id}
        )
        if(!lead){
            return res.status(404).json({success:false, message:"Lead not found"})
        }
        res.json({success:true, message:"Lead Successfully Deleted"})
    } catch(error){
        res.status(500).json({success:false, message:error.message})
    }
}