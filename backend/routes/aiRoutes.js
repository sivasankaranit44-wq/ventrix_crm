const express = require("express")
const router = express.Router()

const{suggestFollowUpEmail} = require("../controllers/aiController")
const {protect} = require("../middleware/authMiddleware")

router.post("/follow-up-email/:leadId", protect, suggestFollowUpEmail)

module.exports = router