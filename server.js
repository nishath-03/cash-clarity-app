import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const AI_API_KEY = process.env.OPENROUTER_API_KEY;
const AI_MODEL = "mistralai/mistral-7b-instruct"; // Change model if needed

app.post("/get-suggestion", async (req, res) => {
    try {
        const { salary, fixedExpenses, variableExpenses, savingsGoal, debt } = req.body;

        if (!salary || !fixedExpenses || !variableExpenses || !savingsGoal || debt === undefined) {
            return res.status(400).json({ error: "❌ Invalid input values. Please enter valid numbers." });
        }

        let extraAmount = salary - (fixedExpenses + variableExpenses + savingsGoal + debt);
        extraAmount = extraAmount > 0 ? extraAmount : 0;

        let investmentAdvice = extraAmount > 0
            ? `Invest ₹${(extraAmount * 0.5).toFixed(2)} in Mutual Funds, ₹${(extraAmount * 0.3).toFixed(2)} in Fixed Deposits, ₹${(extraAmount * 0.2).toFixed(2)} in Stocks.`
            : "No extra funds for investments.";

        // 🔹 Call AI API to get financial advice
        const aiPrompt = `
        I earn ₹${salary} per month. My expenses are:
        - Fixed: ₹${fixedExpenses}
        - Variable: ₹${variableExpenses}
        - Savings Goal: ₹${savingsGoal}
        - Debt: ₹${debt}
        What financial plan do you suggest for me?
        `;

        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [{ role: "user", content: aiPrompt }]
            })
        });

        const aiData = await aiResponse.json();
        const aiSuggestion = aiData.choices?.[0]?.message?.content || "AI could not generate a suggestion.";

        res.json({
            suggestion: `Allocate ₹${fixedExpenses} for fixed expenses, ₹${variableExpenses} for variable expenses, save ₹${savingsGoal}, and clear ₹${debt} in debt.`,
            investmentAdvice,
            aiSuggestion
        });

    } catch (error) {
        console.error("❌ Server Error:", error);
        res.status(500).json({ error: "❌ AI service is unavailable due to a server issue." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
