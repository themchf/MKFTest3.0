document.addEventListener('DOMContentLoaded', () => {
    const rxForm = document.getElementById('rxForm');
    const pdfBtn = document.getElementById('downloadPDF');

    // Gather form data into a clean object
    const getFormData = () => {
        return {
            name: document.getElementById('pName').value,
            age: document.getElementById('pAge').value,
            gender: document.getElementById('pGender').value,
            phone: document.getElementById('pPhone').value,
            rx: document.getElementById('pRx').value,
            pharmacy: document.getElementById('pharmaNum').value.replace(/\D/g, '')
        };
    };

    // --- WHATSAPP LOGIC ---
    rxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getFormData();
        
        const text = `*MKF CONNECT - PRESCRIPTION* ⚕️%0A%0A` +
                     `👤 *Patient:* ${data.name}%0A` +
                     `📅 *Age/Gender:* ${data.age} / ${data.gender}%0A` +
                     `📞 *Contact:* ${data.phone}%0A%0A` +
                     `💊 *Prescription:*%0A${data.rx}%0A%0A` +
                     `_Generated via MKF Connect Portal_`;

        window.open(`https://wa.me/${data.pharmacy}?text=${text}`, '_blank');
    });

    // --- PDF GENERATION LOGIC ---
    pdfBtn.addEventListener('click', () => {
        const data = getFormData();
        
        // Basic Validation
        if(!data.name || !data.rx) {
            alert("Please fill in the Patient Name and Prescription details first.");
            return;
        }

        // Map data to the PDF Template
        document.getElementById('pdf-pName').innerText = data.name;
        document.getElementById('pdf-pAgeGender').innerText = `${data.age} / ${data.gender}`;
        document.getElementById('pdf-pPhone').innerText = data.phone;
        document.getElementById('pdf-pRx').innerText = data.rx;
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();
        document.getElementById('pdf-id').innerText = "RX-" + Math.floor(100000 + Math.random() * 900000);

        const element = document.getElementById('pdf-content');
        
        // Make visible for the snapshot
        element.style.visibility = 'visible';

        const opt = {
            margin:       0, 
            filename:     `MKF_Rx_${data.name.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                scrollY: 0  // This forces the capture to start from the top of the element
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Generate and Save
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.visibility = 'hidden'; // Hide it back
        });
    });
});
