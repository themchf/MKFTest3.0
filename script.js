pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return alert("Please upload a lab report (PDF or Image).");

    toggleLoading(true);
    try {
        let text = file.type.includes("image") ? await processImage(file) : await processPDF(file);
        analyzeLabResults(text);
    } catch (e) {
        alert("Error processing file. Please ensure it is a clear document.");
    } finally {
        toggleLoading(false);
    }
});

function toggleLoading(s) { 
    document.getElementById('loading').classList.toggle('hidden', !s); 
}

async function processImage(f) {
    const r = await Tesseract.recognize(f, 'eng');
    return r.data.text;
}

async function processPDF(f) {
    const ab = await f.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let t = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const p = await pdf.getPage(i);
        const tc = await p.getTextContent();
        t += tc.items.map(item => item.str).join(" ") + "\n";
    }
    return t;
}

function analyzeLabResults(text) {
    const resultsContainer = document.getElementById('extractedData');
    resultsContainer.innerHTML = "";
    document.getElementById('results').classList.remove('hidden');
    const ut = text.toUpperCase();

    // The Master Lab Database
    const markers = [
        { 
            name: "HGB", regex: /(?:HGB|HEMOGLOBIN)[\s:=]+([\d\.]+)/, min: 13.5, max: 17.5, unit: "g/dL", desc: "Hemoglobin",
            lowInterp: "Low HGB (Anemia) suggests your blood is carrying less oxygen than normal.",
            highInterp: "High HGB can be caused by smoking, dehydration, or living at high altitudes."
        },
        { 
            name: "MCV", regex: /MCV[\s:=]+([\d\.]+)/, min: 80, max: 100, unit: "fL", desc: "Mean Corpuscular Volume",
            lowInterp: "Low MCV suggests 'Microcytic Anemia,' often caused by Iron Deficiency or Thalassemia.",
            highInterp: "High MCV suggests 'Macrocytic Anemia,' often linked to Vitamin B12 or Folate deficiency."
        },
        { 
            name: "WBC", regex: /WBC[\s:=]+([\d\.]+)/, min: 4.5, max: 11.0, unit: "K/uL", desc: "White Blood Cells",
            lowInterp: "Low WBC (Leukopenia) may indicate a weakened immune system or bone marrow stress.",
            highInterp: "High WBC (Leukocytosis) usually indicates your body is fighting an infection or inflammation."
        },
        { 
            name: "PLT", regex: /(?:PLT|PLATELET)[\s:=]+([\d\.]+)/, min: 150, max: 450, unit: "K/uL", desc: "Platelets",
            lowInterp: "Low Platelets (Thrombocytopenia) can increase risk of bruising or bleeding.",
            highInterp: "High Platelets (Thrombocytosis) can sometimes increase the risk of blood clots."
        },
        { 
            name: "GLU", regex: /(?:GLU|GLUCOSE|FASTING)[\s:=]+([\d\.]+)/, min: 70, max: 99, unit: "mg/dL", desc: "Glucose (Fasting)",
            lowInterp: "Low Glucose (Hypoglycemia) can cause dizziness and fainting.",
            highInterp: "High Glucose (Hyperglycemia) may indicate Prediabetes or Diabetes if consistently high."
        },
        { 
            name: "CREA", regex: /(?:CREA|CREATININE)[\s:=]+([\d\.]+)/, min: 0.7, max: 1.3, unit: "mg/dL", desc: "Creatinine",
            lowInterp: "Low Creatinine is rare, sometimes seen with low muscle mass.",
            highInterp: "High Creatinine suggests the kidneys may not be filtering waste effectively."
        },
        { 
            name: "ALT", regex: /(?:ALT|SGPT)[\s:=]+([\d\.]+)/, min: 7, max: 55, unit: "U/L", desc: "ALT (Liver Enzyme)",
            lowInterp: "Low ALT is generally normal.",
            highInterp: "High ALT can be a sign of liver inflammation or stress (e.g., from meds or alcohol)."
        }
    ];

    let findingsHTML = "";
    markers.forEach(m => {
        const match = ut.match(m.regex);
        if (match && match[1]) {
            const val = parseFloat(match[1]);
            let status = "normal";
            let interpretation = "Your levels are within the standard reference range.";
            
            if (val < m.min) {
                status = "abnormal";
                interpretation = `⚠️ ${m.lowInterp}`;
            } else if (val > m.max) {
                status = "abnormal";
                interpretation = `⚠️ ${m.highInterp}`;
            }

            findingsHTML += `
                <div class="finding ${status === 'abnormal' ? 'abnormal' : 'normal'}">
                    <strong>${m.desc} (${m.name}):</strong> ${val} ${m.unit}
                    <div style="font-size: 0.85em; margin-top:5px; opacity: 0.9;">
                        ${interpretation}
                    </div>
                </div>
            `;
        }
    });

    resultsContainer.innerHTML = findingsHTML || "<p>No matches found. Ensure the document is high-quality and contains standard CBC or Metabolic markers.</p>";
}
