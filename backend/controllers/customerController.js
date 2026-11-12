const Customer = require("../models/customerModel");
const Lead = require("../models/leadModel");

// CONVERT a qualified lead into a customer
exports.convertLead = async (req, res) => {
  try {
    // Step 1: find the lead (it must belong to this user)
    const lead = await Lead.findOne({ _id: req.params.leadId, createdBy: req.user._id });

    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Step 2: only qualified leads can be converted
    if (lead.status === "converted") {
      return res.status(400).json({ success: false, message: "Lead is already converted" });
    }
    if (lead.status !== "qualified") {
      return res.status(400).json({ success: false, message: "Only qualified leads can be converted" });
    }

    // Step 3: create the customer using the lead's details
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      convertedFrom: lead._id,
      createdBy: req.user._id,
    });

    // Step 4: mark the lead as converted
    lead.status = "converted";
    await lead.save();

    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET all customers (with simple search and pagination)
exports.getCustomers = async (req, res) => {
  try {
    const filter = { createdBy: req.user._id };

    // search by name, email or company, e.g. /api/customers?search=acme
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
        { company: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const customers = await Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Customer.countDocuments(filter);

    res.json({
      success: true,
      customers: customers,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET one customer (includes their notes/history)
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// EDIT customer details
exports.updateCustomer = async (req, res) => {
  try {
    // only these fields can be edited (notes have their own endpoint)
    const updates = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      company: req.body.company,
    };

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updates,
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE a customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD a note to a customer
exports.addNote = async (req, res) => {
  try {
    if (!req.body.text) {
      return res.status(400).json({ success: false, message: "Note text is required" });
    }

    const customer = await Customer.findOne({ _id: req.params.id, createdBy: req.user._id });

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    customer.notes.push({ text: req.body.text });
    await customer.save();

    res.status(201).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};