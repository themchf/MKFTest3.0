document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const previewSection = document.getElementById('previewSection');
    const imagePreview = document.getElementById('imagePreview');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    const loader = document.getElementById('loader');
    const resultText = document.getElementById('resultText');

    // Handle File Upload and Preview
    imageUpload.addEventListener('change', function() {
        const file = this.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewSection.style.display = 'block';
                resultsSection.style.display = 'none'; // Hide old results if uploading a new image
                resultText.style.display = 'none';
            }
            
            reader.readAsDataURL(file);
        }
    });

    // Simulate AI Analysis
    analyzeBtn.addEventListener('click', function() {
        resultsSection.style.display = 'block';
        loader.style.display = 'block';
        resultText.style.display = 'none';
        analyzeBtn.disabled = true;
        analyzeBtn.innerText = "Analyzing...";

        // Simulate a network request / processing time (3 seconds)
        setTimeout(() => {
            loader.style.display = 'none';
            resultText.style.display = 'block';
            
            // MOCK RESULT: In a real app, you would use fetch() here to send the image to your Python/AI server.
            resultText.innerHTML = `
                <h4>Analysis Complete</h4>
                <p><strong>Note:</strong> This is a simulated response.</p>
                <p>No immediate anomalies detected in the provided scan layout. 
                Structures appear within normal simulated parameters.</p>
                <p><em>Confidence Score: 92% (Simulated)</em></p>
            `;
            
            analyzeBtn.disabled = false;
            analyzeBtn.innerText = "Analyze Scan";
        }, 3000);
    });
});
