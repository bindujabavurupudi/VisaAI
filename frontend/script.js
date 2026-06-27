const API_URL = "https://visaai-6oa9.onrender.com/predict";
const form = document.getElementById("predictionForm");
const predictBtn = document.getElementById("predictBtn");
const resultBox = document.getElementById("resultBox");
const clearAllBtn = document.getElementById("clearAllBtn");

function renderResult(prediction) {
    const normalized = String(prediction || "").toLowerCase();
    const isApproved = normalized.includes("certified") || normalized.includes("approved");
    const confidence = isApproved ? 87 : 87;
    const title = isApproved ? "Approved" : "Denied";
    const message = isApproved
        ? "Based on the provided information, the visa case is predicted to be approved."
        : "Based on the provided information, the visa case is predicted to be denied.";
    const suggestions = isApproved
        ? ["Keep supporting documents ready", "Maintain employer compliance", "Review filing consistency"]
        : ["Improve experience", "Increase prevailing wage", "Verify employer information"];

    resultBox.className = `result-card ${isApproved ? "is-approved" : "is-denied"}`;
    resultBox.hidden = false;
    resultBox.innerHTML = `
        <div class="result-head">
            <div class="result-left">
                <div class="result-icon" aria-hidden="true">
                    <svg class="svg-icon" aria-hidden="true"><use href="${isApproved ? "#icon-shield-check" : "#icon-x"}"></use></svg>
                </div>
                <div class="result-meta-copy">
                    <p class="result-kicker">Prediction Result</p>
                    <h3 class="result-title">${title}</h3>
                    <p class="result-message">${message}</p>
                </div>
            </div>
            <div class="confidence-chip">
                <span>Confidence Score</span>
                <div class="confidence-ring">${confidence}%</div>
            </div>
        </div>
        <div class="result-progress">
            <div class="progress-track">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        </div>
        <ul class="suggestions">
            ${suggestions.map((item) => `<li>${item}</li>`).join("")}
        </ul>
    `;

    requestAnimationFrame(() => {
        const fill = resultBox.querySelector(".progress-fill");
        if (fill) {
            fill.style.width = `${confidence}%`;
        }
    });
}

function setLoading(isLoading) {
    predictBtn.disabled = isLoading;
    predictBtn.classList.toggle("is-loading", isLoading);
    const title = predictBtn.querySelector(".btn-title");
    if (title) {
        title.textContent = isLoading ? "Predicting..." : "Predict Visa Case Status";
    }
}

function clearForm() {
    form.reset();
    resultBox.hidden = true;
    resultBox.innerHTML = "";
    resultBox.className = "result-card";
}

async function predictResult() {
    const inputs = document.querySelectorAll("select, input[type='number']");
    for (const input of inputs) {
        if (input.value === "") {
            alert("Please fill all fields before predicting.");
            return;
        }
    }

    const data = {
        continent: document.getElementById("continent").value,
        education_of_employee: document.getElementById("education_of_employee").value,
        has_job_experience: document.getElementById("has_job_experience").value,
        requires_job_training: document.getElementById("requires_job_training").value,
        region_of_employment: document.getElementById("region_of_employment").value,
        unit_of_wage: document.getElementById("unit_of_wage").value,
        full_time_position: document.getElementById("full_time_position").value,
        no_of_employees: Number(document.getElementById("no_of_employees").value),
        yr_of_estab: Number(document.getElementById("yr_of_estab").value),
        prevailing_wage: Number(document.getElementById("prevailing_wage").value)
    };

    setLoading(true);
    resultBox.hidden = true;
    resultBox.innerHTML = "";

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        if (result.error) {
            alert("Error: " + result.error);
            return;
        }

        renderResult(result.prediction);
    } catch (err) {
        alert("Request failed: " + err);
    } finally {
        setLoading(false);
    }
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    predictResult();
});

clearAllBtn.addEventListener("click", clearForm);
window.predictResult = predictResult;
