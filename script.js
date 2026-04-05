document.addEventListener('DOMContentLoaded', () => {
    const rxForm = document.getElementById('rxForm');
    const pdfBtn = document.getElementById('downloadPDF');

    // HELPER: Get Form Data
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

    // 1. WHATSAPP LOGIC
    rxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = getFormData();
        
        const text = `*MKF CONNECT - PRESCRIPTION*%0A%0A` +
                     `👤 *Patient:* ${data.name}%0A` +
                     `📅 *Age/Gender:* ${data.age}/${data.gender}%0A` +
                     `📞 *Phone:* ${data.phone}%0A%0A` +
                     `💊 *Rx:*%0A${data.rx}`;

        window.open(`https://wa.me/${data.pharmacy}?text=${text}`, '_blank');
    });

    // 2. PDF GENERATION LOGIC
   pdfBtn.addEventListener('click', () => {
        const data = getFormData();
        
        if(!data.name || !data.rx) {
            alert("Please fill in Patient Name and Prescription details first.");
            return;
        }

        // Fill the template
        document.getElementById('pdf-pName').innerText = data.name;
        document.getElementById('pdf-pAgeGender').innerText = `${data.age} / ${data.gender}`;
        document.getElementById('pdf-pPhone').innerText = data.phone;
        document.getElementById('pdf-pRx').innerText = data.rx;
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString();
        document.getElementById('pdf-id').innerText = Math.floor(1000 + Math.random() * 9000);

        const element = document.getElementById('pdf-content');
        
        // Show temporarily for the capture
        element.style.visibility = 'visible';

        const opt = {
            margin:       0, // We handle margins in CSS now for better control
            filename:     `Rx_${data.name.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 2, 
                useCORS: true, 
                scrollY: 0 // Forces the capture to start at the very top
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.visibility = 'hidden'; // Hide it again
        });
    });

        // Target the template div
        const element = document.getElementById('pdf-content');
        element.style.display = 'block'; // Temporarily show for capture

        // PDF Options
        const opt = {
            margin:       10,
            filename:     `Rx_${data.name.replace(/\s+/g, '_')}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Run the conversion
        html2pdf().set(opt).from(element).save().then(() => {
            element.style.display = 'none'; // Hide it again
        });
    });
});
