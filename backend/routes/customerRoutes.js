const express = require("express")
const router = express.Router()

const {
    convertLead,
    getCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer,
    addNote,
} = require("../controllers/customerController")

const {protect} = require("../middleware/authMiddleware")

router.post("/convert/:leadId", protect, convertLead)
router.get("/", protect,getCustomers)
router.get("/:id", protect,getCustomer)
router.put("/:id", protect, updateCustomer)
router.delete("/:id", protect, deleteCustomer)
router.post("/:id/notes", protect, addNote)

module.exports = router
