// Setup PDF.js worker (Crucial for GitHub Pages hosting)
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please upload a file first!");
        return;
    }

    toggleLoading(true);

    try {
        let extractedText = "";

        if (file.type.includes("image")) {
            extractedText = await processImage(file);
        } else if (file.type === "application/pdf") {
            extractedText = await processPDF(file);
        } else {
            alert("Unsupported file type. Please upload a PDF or Image.");
            toggleLoading(false);
            return;
        }

        analyzeLabResults(extractedText);
        
    } catch (error) {
        console.error(error);
        alert("An error occurred. Ensure the document is clear and readable.");
    } finally {
        toggleLoading(false);
    }
});

function toggleLoading(isLoading) {
    document.getElementById('loading').classList.toggle('hidden', !isLoading);
    if (isLoading) document.getElementById('results').classList.add('hidden');
}

async function processImage(file) {
    document.getElementById('loadingText').innerText = "Running OCR... analyzing image.";
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
}

async function processPDF(file) {
    document.getElementById('loadingText').innerText = "Extracting text from PDF...";
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

function analyzeLabResults(text) {
    const resultsContainer = document.getElementById('extractedData');
    resultsContainer.innerHTML = "";
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('rawText').textContent = text;

    const ut = text.toUpperCase();

    // COMPREHENSIVE MEDICAL MARKER DATABASE
    const markers = [
        // --- BLOOD COUNT (CBC) ---
        { 
            name: "HGB", regex: /(?:HGB|HEMOGLOBIN)[\s:=]+([\d\.]+)/, min: 13.5, max: 17.5, unit: "g/dL", desc: "Hemoglobin",
            lowInterp: "Low HGB indicates Anemia. Your blood is carrying less oxygen than it should.",
            highInterp: "High HGB can be caused by dehydration, smoking, or living at high altitudes."
        },
        { 
            name: "MCV", regex: /MCV[\s:=]+([\d\.]+)/, min: 80, max: 100, unit: "fL", desc: "Mean Corpuscular Volume",
            lowInterp: "Low MCV suggests 'Microcytic Anemia', commonly caused by Iron Deficiency or Thalassemia.",
            highInterp: "High MCV suggests 'Macrocytic Anemia', often linked to Vitamin B12 or Folate deficiency."
        },
        { 
            name: "WBC", regex: /WBC[\s:=]+([\d\.]+)/, min: 4.5, max: 11.0, unit: "K/uL", desc: "White Blood Cells",
            lowInterp: "Low WBC (Leukopenia) may indicate bone marrow stress or a recent viral infection.",
            highInterp: "High WBC usually indicates the body is fighting an infection or significant inflammation."
        },
        { 
            name: "PLT", regex: /(?:PLT|PLATELET)[\s:=]+([\d\.]+)/, min: 150, max: 450, unit: "K/uL", desc: "Platelets",
            lowInterp: "Low Platelets (Thrombocytopenia) can lead to easy bruising and slow wound healing.",
            highInterp: "High Platelets can be a response to inflammation or iron deficiency."
        },

        // --- HEART & LIPIDS ---
        { 
            name: "LDL", regex: /(?:LDL|CHOL\s+LDL)[\s:=]+([\d\.]+)/, min: 0, max: 100, unit: "mg/dL", desc: "LDL (Bad) Cholesterol",
            lowInterp: "Very low LDL is generally healthy.",
            highInterp: "High LDL levels increase the risk of plaque buildup in the arteries."
        },
        { 
            name: "HDL", regex: /(?:HDL|CHOL\s+HDL)[\s:=]+([\d\.]+)/, min: 40, max: 100, unit: "mg/dL", desc: "HDL (Good) Cholesterol",
            lowInterp: "Low HDL is a risk factor for heart disease. You want this number higher.",
            highInterp: "High HDL is considered protective for the heart."
        },

        // --- SUGAR & KIDNEY ---
        { 
            name: "GLU", regex: /(?:GLU|GLUCOSE)[\s:=]+([\d\.]+)/, min: 70, max: 99, unit: "mg/dL", desc: "Glucose (Fasting)",
            lowInterp: "Low glucose (Hypoglycemia) can cause dizziness and shakiness.",
            highInterp: "High fasting glucose is a key indicator of Prediabetes or Diabetes."
        },
        { 
            name: "CREA", regex: /(?:CREA|CREATININE)[\s:=]+([\d\.]+)/, min: 0.7, max: 1.3, unit: "mg/dL", desc: "Creatinine",
            lowInterp: "Low levels are usually due to low muscle mass.",
            highInterp: "High Creatinine suggests the kidneys may not be filtering waste effectively."
        },

        // --- LIVER & ENZYMES ---
        { 
            name: "ALT", regex: /(?:ALT|SGPT)[\s:=]+([\d\.]+)/, min: 7, max: 55, unit: "U/L", desc: "ALT (Liver Enzyme)",
            lowInterp: "Low ALT is considered normal.",
            highInterp: "High ALT can indicate liver inflammation, fatty liver, or stress from medications."
        },

        // --- VITAMINS ---
        { 
            name: "VITD", regex: /(?:VITAMIN D|25-OH)[\s:=]+([\d\.]+)/, min: 30, max: 100, unit: "ng/mL", desc: "Vitamin D",
            lowInterp: "Low Vitamin D is very common and affects bone strength and immune health.",
            highInterp: "Very high Vitamin D is rare and usually only happens with over-supplementation."
        }
    ];

    let findingsHTML = "";
    let abnormalCount = 0;

    markers.forEach(m => {
        const match = ut.match(m.regex);
        if (match && match[1]) {
            const val = parseFloat(match[1]);
            const isLow = val < m.min;
            const isHigh = val > m.max;
            const isNormal = !isLow && !isHigh;

            let statusClass = "normal";
            let interpretation = "Your result is within the healthy reference range.";

            if (isLow) {
                statusClass = "abnormal";
                interpretation = `🚨 ${m.lowInterp}`;
                abnormalCount++;
            } else if (isHigh) {
                statusClass = "abnormal";
                interpretation = `🚨 ${m.highInterp}`;
                abnormalCount++;
            }

            // Visual Range Bar Math
            const rangeMin = m.min * 0.6;
            const rangeMax = m.max * 1.4;
            const percentage = ((val - rangeMin) / (rangeMax - rangeMin)) * 100;
            const clampedPct = Math.max(5, Math.min(95, percentage));

            const normalStart = ((m.min - rangeMin) / (rangeMax - rangeMin)) * 100;
            const normalWidth = ((m.max - m.min) / (rangeMax - rangeMin)) * 100;

            findingsHTML += `
                <div class="finding ${statusClass}">
                    <strong>${m.desc} (${m.name}):</strong> ${val} ${m.unit}
                    <div style="margin: 8px 0; font-size: 0.9em; line-height: 1.4;">${interpretation}</div>
                    <div class="range-container" style="background: #ddd; height: 8px; border-radius: 4px; position: relative; margin-top: 10px;">
                        <div style="position: absolute; left: ${normalStart}%; width: ${normalWidth}%; height: 100%; background: #4caf50; opacity: 0.3;"></div>
                        <div style="position: absolute; left: ${clampedPct}%; width: 12px; height: 12px; background: #333; border-radius: 50%; top: -2px; transform: translateX(-50%);"></div>
                    </div>
                    <small style="display:block; margin-top:5px; color: #666;">Ref Range: ${m.min} - ${m.max} ${m.unit}</small>
                </div>
            `;
        }
    });

    resultsContainer.innerHTML = findingsHTML || "<p>No standard markers were detected. Please ensure the document is a clear CBC or Metabolic panel.</p>";

    // Summary Card
    const diagCard = document.getElementById('diagnosisCard');
    if (abnormalCount > 0) {
        diagCard.innerHTML = `<div style="background:#fff3f3; padding:15px; border-radius:8px; border:1px solid #ffcccc;">
            <h3>📋 Summary</h3>
            <p>We found <strong>${abnormalCount}</strong> markers outside the reference range. Please consult a doctor to discuss these specific values.</p>
        </div>`;
    } else if (findingsHTML !== "") {
        diagCard.innerHTML = `<div style="background:#f3fff3; padding:15px; border-radius:8px; border:1px solid #ccffcc;">
            <h3>📋 Summary</h3>
            <p>All detected markers are within the normal range. Great news! Keep maintaining your healthy lifestyle.</p>
        </div>`;
    }
}
