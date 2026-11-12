const express = require('express')
const router = express.Router()

const {
    createLead,
    getLeads,
    getLead,
    updateLead,
    deleteLead,
} = require("../controllers/leadController")

const {protect} = require("../middleware/authMiddleware")

// protect says user must be logged in
router.post("/",protect, createLead);
router.get("/", protect,getLeads);
router.get("/:id", protect,getLead);
router.put("/:id", protect,updateLead);
router.delete("/:id", protect,deleteLead)

module.exports = router