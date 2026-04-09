document.addEventListener('DOMContentLoaded', () => {
    const rxForm = document.getElementById('rxForm');
    const pdfBtn = document.getElementById('downloadPDF');

    // Helper function to pull all the data from the inputs at once
    const getFormData = () => {
        return {
            name: document.getElementById('pName').value,
            age: document.getElementById('pAge').value,
            gender: document.getElementById('pGender').value,
            phone: document.getElementById('pPhone').value,
            rx: document.getElementById('pRx').value,
            // Strips out any spaces, dashes, or plus signs for the WhatsApp URL
            pharmacy: document.getElementById('pharmaNum').value.replace(/\D/g, '')
        };
    };

    // ==========================================
    // 1. WHATSAPP LOGIC
    // ==========================================
    rxForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Stops the page from refreshing
        const data = getFormData();
        
        // Format the text using %0A for line breaks
        const text = `*MKF CONNECT - PRESCRIPTION* ⚕️%0A%0A` +
                     `👤 *Patient:* ${data.name}%0A` +
                     `📅 *Age/Gender:* ${data.age} / ${data.gender}%0A` +
                     `📞 *Contact:* ${data.phone}%0A%0A` +
                     `💊 *Prescription:*%0A${data.rx}%0A%0A` +
                     `_Generated via MKF Connect Portal_`;

        // Open WhatsApp Web/App
        window.open(`https://wa.me/${data.pharmacy}?text=${text}`, '_blank');
    });

    // ==========================================
    // 2. PDF GENERATION LOGIC
    // ==========================================
    pdfBtn.addEventListener('click', () => {
        const data = getFormData();
        
        // Prevent generating a blank PDF if the doctor hasn't typed anything
        if(!data.name || !data.rx) {
            alert("Please fill in the Patient Name and Prescription details first.");
            return;
        }

        // Push the form data into the hidden PDF template
        document.getElementById('pdf-pName').innerText = data.name;
        document.getElementById('pdf-pAgeGender').innerText = `${data.age} / ${data.gender}`;
        document.getElementById('pdf-pPhone').innerText = data.phone;
        document.getElementById('pdf-pRx').innerText = data.rx;
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();
        
        // Generate a random 6-digit Rx ID
        document.getElementById('pdf-id').innerText = "RX-" + Math.floor(100000 + Math.random() * 900000);

        // Grab the hidden template container
        const element = document.getElementById('pdf-content');
        
        // CRITICAL FIX: Make the template visible just long enough for the library to screenshot it
        element.style.display = 'block';

        // Configure the PDF settings
        const opt = {
            margin:       0, 
            filename:     `MKF_Rx_${data.name.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                scrollY: 0, // Start from absolute top
                windowWidth: 800 // Force desktop width so it doesn't break on mobile
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate the PDF, save it, and immediately hide the template again
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none'; 
        }).catch(err => {
            console.error("Error generating PDF:", err);
            element.style.display = 'none'; // Hide it even if there's an error
        });
    });
});
