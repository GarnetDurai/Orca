console.log("Loaded js");
const refreshButton = document.getElementById("refreshBtn");
refreshButton.addEventListener("click", () => {
    updateUi(" 3 SUM", " Strggled", " 50%");
});


function updateUi(problem, status, confidence) {
    document.getElementById("problem").textContent = problem;
    document.getElementById("status").textContent = status;
    document.getElementById("confidence").innerText = confidence;
}

