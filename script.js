pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// Check for saved history on load
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("mkf_last_analysis")) {
        document.getElementById('historySection').classList.remove('hidden');
    }
});

// History Buttons
document.getElementById('loadHistoryBtn').addEventListener('click', () => {
    const savedData = localStorage.getItem("mkf_last_analysis");
    if (savedData) analyzeLabResults(savedData, false);
});

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    localStorage.removeItem("mkf_last_analysis");
    document.getElementById('historySection').classList.add('hidden');
    alert("Memory cleared.");
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) return alert("Please upload a file first!");

    toggleLoading(true);

    try {
        let extractedText = "";
        if (file.type.includes("image")) {
            extractedText = await processImage(file);
        } else if (file.type === "application/pdf") {
            extractedText = await processPDF(file);
        } else {
            alert("Unsupported file type.");
            toggleLoading(false);
            return;
        }

        analyzeLabResults(extractedText, true);
        
    } catch (error) {
        console.error(error);
        alert("An error occurred. Make sure the document is clear and readable.");
    } finally {
        toggleLoading(false);
    }
});

function toggleLoading(isLoading) {
    document.getElementById('loading').classList.toggle('hidden', !isLoading);
    if (isLoading) document.getElementById('results').classList.add('hidden');
}

async function processImage(file) {
    document.getElementById('loadingText').innerText = "Analyzing image...";
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
}

async function processPDF(file) {
    document.getElementById('loadingText').innerText = "Reading PDF document...";
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(" ") + "\n";
    }
    return text;
}

function analyzeLabResults(text, saveToHistory) {
    if (saveToHistory) {
        localStorage.setItem("mkf_last_analysis", text);
        document.getElementById('historySection').classList.remove('hidden');
    }

    const resultsContainer = document.getElementById('extractedData');
    resultsContainer.innerHTML = "";
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('rawText').textContent = text;

    const upperText = text.toUpperCase();

    // Expanded Marker Database
    const markers = [
        { name: "HCT", regex: /HCT[\s:=]+([\d\.]+)/, min: 36, max: 50, unit: "%", desc: "Hematocrit" },
        { name: "MCV", regex: /MCV[\s:=]+([\d\.]+)/, min: 80, max: 100, unit: "fL", desc: "Mean Corpuscular Volume" },
        { name: "HGB", regex: /(?:HGB|HEMOGLOBIN)[\s:=]+([\d\.]+)/, min: 12, max: 17.5, unit: "g/dL", desc: "Hemoglobin" },
        { name: "WBC", regex: /WBC[\s:=]+([\d\.]+)/, min: 4.5, max: 11.0, unit: "x10^9/L", desc: "White Blood Cells" },
        { name: "CHOL", regex: /(?:CHOL|CHOLESTEROL)[\s:=]+([\d\.]+)/, min: 125, max: 200, unit: "mg/dL", desc: "Total Cholesterol" },
        { name: "CREA", regex: /(?:CREA|CREATININE)[\s:=]+([\d\.]+)/, min: 0.7, max: 1.3, unit: "mg/dL", desc: "Creatinine (Kidney)" }
    ];

    let findingsHTML = "";
    let issuesFound = 0;

    markers.forEach(marker => {
        const match = upperText.match(marker.regex);
        if (match && match[1]) {
            const value = parseFloat(match[1]);
            const isNormal = value >= marker.min && value <= marker.max;
            if (!isNormal) issuesFound++;

            const badgeClass = isNormal ? "badge-normal" : "badge-abnormal";
            const badgeText = isNormal ? "Normal" : "Out of Range";

            // Calculate Visual Bar Positions
            const absoluteMin = marker.min * 0.5; // Start bar at 50% of min
            const absoluteMax = marker.max * 1.5; // End bar at 150% of max
            const rangeSpan = absoluteMax - absoluteMin;
            
            // Percentage locations for CSS
            let markerPos = ((value - absoluteMin) / rangeSpan) * 100;
            markerPos = Math.max(0, Math.min(100, markerPos)); // Clamp between 0-100%
            
            const normalStart = ((marker.min - absoluteMin) / rangeSpan) * 100;
            const normalWidth = ((marker.max - marker.min) / rangeSpan) * 100;

            findingsHTML += `
                <div class="finding">
                    <strong>${marker.desc} (${marker.name}):</strong> ${value} ${marker.unit} 
                    <span class="status-badge ${badgeClass}">${badgeText}</span>
                    <br><small>Reference Range: ${marker.min} - ${marker.max} ${marker.unit}</small>
                    
                    <div class="range-container">
                        <div class="range-normal-zone" style="left: ${normalStart}%; width: ${normalWidth}%; title="Normal Range"></div>
                        <div class="range-marker" style="left: ${markerPos}%;" title="Your Result"></div>
                    </div>
                </div>
            `;
        }
    });

    if (findingsHTML === "") {
        resultsContainer.innerHTML = "<p>Could not confidently read specific markers. The document format might be highly unusual or blurry.</p>";
    } else {
        resultsContainer.innerHTML = findingsHTML;
    }

    const diagnosisCard = document.getElementById('diagnosisCard');
    if (issuesFound > 0) {
        diagnosisCard.innerHTML = `<h3>💡 Analysis</h3><p>We noticed <strong>${issuesFound} value(s)</strong> outside the standard reference range. Please share these results with your primary care physician for a professional interpretation.</p>`;
    } else if (findingsHTML !== "") {
        diagnosisCard.innerHTML = `<h3>💡 Analysis</h3><p>Based on the Lab Test, all detected values appear to be within normal limits. Always consult your doctor for a full review!</p>`;
    }
}
