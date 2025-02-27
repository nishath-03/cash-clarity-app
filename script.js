document.addEventListener("DOMContentLoaded", function() {
    if (!localStorage.getItem("salary")) {
        console.log("No data found. Redirecting to form.");
        window.location.href = "form.html";
        return;
    }

    const salary = parseFloat(localStorage.getItem("salary"));
    const fixedExpenses = parseFloat(localStorage.getItem("fixedExpenses"));
    const variableExpenses = parseFloat(localStorage.getItem("variableExpenses"));
    const savingsGoal = parseFloat(localStorage.getItem("savingsGoal"));
    const debt = parseFloat(localStorage.getItem("debt"));

    fetch("http://localhost:5000/get-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, fixedExpenses, variableExpenses, savingsGoal, debt })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById("result").innerText = "❌ Error: " + data.error;
        } else {
            document.getElementById("result").innerText = data.suggestion;
            document.getElementById("aiSuggestion").innerText = data.aiSuggestion;
        }

        new Chart(document.getElementById("expenseChart").getContext("2d"), {
            type: "pie",
            data: {
                labels: ["Fixed Expenses", "Variable Expenses", "Savings", "Debt"],
                datasets: [{
                    data: [fixedExpenses, variableExpenses, savingsGoal, debt],
                    backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#f44336"]
                }]
            }
        });
    })
    .catch(error => {
        console.error("❌ Fetch Error:", error);
        document.getElementById("result").innerText = "❌ AI service is unavailable.";
        document.getElementById("aiSuggestion").innerText = "⚠️ Unable to fetch AI-generated financial advice.";
    });
});
