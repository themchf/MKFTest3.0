document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileMeta = document.getElementById('fileMeta');
    
    const processingSteps = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3')
    ];
    const reportContainer = document.getElementById('reportContainer');

    let currentFile = null;

    // --- Mock Medical Data Banks ---
    const modalities = ["Radiograph (X-Ray)", "Computed Tomography (CT)", "Magnetic Resonance (MRI)", "Ultrasound"];
    const findingsBank = [
        "Visualized osseous structures are intact. No acute fracture or malalignment.",
        "Mild degenerative changes noted in the visualized joints.",
        "Slight loss of volume noted, consistent with age-related changes.",
        "Soft tissue planes are unremarkable. No abnormal radiopacities.",
        "Vascular structures appear within normal limits for the non-contrast modality.",
        "Scattered nonspecific benign calcifications noted."
    ];
    const impressionsBank = [
        "Unremarkable study. No acute cardiopulmonary or osseous abnormalities.",
        "Mild age-indeterminate degenerative changes. No acute findings.",
        "Negative for acute pathology.",
        "Stable appearance compared to simulated prior studies."
    ];

    // --- Deterministic Hashing Function ---
    // This turns the file name/size into a specific number so the same image always gets the same result.
    function generateHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Handle Upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = function(event) {
            // Create an image object to get real dimensions
            const img = new Image();
            img.onload = function() {
                fileMeta.innerHTML = `
                    File: ${file.name}<br>
                    Size: ${(file.size / 1024 / 1024).toFixed(2)} MB<br>
                    Dimensions: ${img.width} x ${img.height} px<br>
                    Format: ${file.type}
                `;
            };
            img.src = event.target.result;
            
            imagePreview.src = event.target.result;
            analyzeBtn.disabled = false;
            
            // Reset UI
            reportContainer.style.display = 'none';
            processingSteps.forEach(step => step.style.display = 'none');
            analyzeBtn.innerText = "Initialize AI Analysis";
        }
        reader.readAsDataURL(file);
    });

    // Handle Analysis Simulation
    analyzeBtn.addEventListener('click', async function() {
        if (!currentFile) return;

        analyzeBtn.disabled = true;
        reportContainer.style.display = 'none';
        
        // Generate deterministic results based on the specific file
        const fileHash = generateHash(currentFile.name + currentFile.size);
        const confidence = 85 + (fileHash % 14); // Generates a number between 85 and 98
        const modality = modalities[fileHash % modalities.length];
        
        // Pick 2 random findings based on the hash
        const finding1 = findingsBank[fileHash % findingsBank.length];
        const finding2 = findingsBank[(fileHash + 1) % findingsBank.length];
        const impression = impressionsBank[fileHash % impressionsBank.length];

        // Simulate processing timeline
        for (let i = 0; i < processingSteps.length; i++) {
            processingSteps[i].style.display = 'block';
            analyzeBtn.innerText = `Processing Step ${i + 1}/3...`;
            await new Promise(r => setTimeout(r, 800)); // 800ms delay per step
            processingSteps[i].style.color = "var(--text-muted)";
            processingSteps[i].innerText = processingSteps[i].innerText.replace('⧖', '✓');
        }

        // Show Results
        analyzeBtn.innerText = "Analysis Complete";
        
        document.getElementById('confidenceBadge').innerText = `Confidence: ${confidence.toFixed(1)}%`;
        document.getElementById('modalityBadge').innerText = `Detected: ${modality}`;
        document.getElementById('findingsText').innerText = `${finding1} ${finding2}`;
        document.getElementById('impressionText').innerText = impression;
        
        reportContainer.style.display = 'block';
    });
});
