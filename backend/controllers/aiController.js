
const Lead = require("../models/leadModel")

// Generate a follow-up email for a lead using AI
exports.suggestFollowUpEmail = async (req, res) => {
    try {
        console.log("1. Follow-up email controller reached")
        const lead = await Lead.findOne({
            _id: req.params.leadId,
            createdBy: req.user._id
        })
        console.log("2. Lead lookup completed:", !!lead)

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            })
        }

        const prompt =
            "Write a short, friendly and professional follow-up email for a sales lead.\n" +
            "Lead name: " + lead.name + "\n" +
            "Company: " + (lead.company || "not given") + "\n" +
            "Lead Status: " + lead.status + "\n" +
            "Lead Source: " + lead.source + "\n" +
            "Notes: " + (lead.notes || "none") + "\n" +
            "Sender name: " + req.user.name + "\n" +
            "Rules: Include the subject line, keep it under 120 words, and end with a clear next step."

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL}:generateContent`

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": process.env.GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        })

        const rawResponse = await response.text()

        console.log("Gemini Status:", response.status)
    

        let data

        try {
            data = JSON.parse(rawResponse)
        } catch (error) {
            console.log("Gemini JSON parsing failed:", error.message)

            return res.status(500).json({
                success: false,
                message: "Gemini returned an empty or invalid response"
            })
        }

        if (!response.ok) {
            const message = data.error?.message || "AI request failed"

            return res.status(500).json({
                success: false,
                message
            })
        }

        if (!data.candidates || data.candidates.length === 0) {
            return res.status(500).json({
                success: false,
                message: "AI returned no answer. Try again."
            })
        }

        const generatedEmail =
            data.candidates[0].content?.parts?.[0]?.text

        if (!generatedEmail) {
            return res.status(500).json({
                success: false,
                message: "AI response did not contain email text"
            })
        }

        return res.json({
            success: true,
            email: generatedEmail
        })

    } catch (error) {
        console.error("Follow-up email error:", error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
