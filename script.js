document.addEventListener('DOMContentLoaded', () => {
    const rxForm = document.getElementById('rxForm');

    rxForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Collect Data
        const data = {
            name: document.getElementById('pName').value,
            age: document.getElementById('pAge').value,
            gender: document.getElementById('pGender').value,
            phone: document.getElementById('pPhone').value,
            rx: document.getElementById('pRx').value,
            pharmacy: document.getElementById('pharmaNum').value.replace(/\D/g, '')
        };

        // 2. Format Message (URL Encoded)
        const header = encodeURIComponent("*MKF CONNECT - PRESCRIPTION* ⚕️\n\n");
        const patientInfo = encodeURIComponent(
            `👤 *Patient:* ${data.name}\n` +
            `📅 *Age/Gender:* ${data.age} / ${data.gender}\n` +
            `📞 *Contact:* ${data.phone}\n\n`
        );
        const rxContent = encodeURIComponent(`💊 *Prescription:* \n${data.rx}\n\n`);
        const footer = encodeURIComponent(`_Sent via MKF Connect Portal_`);

        const finalMsg = header + patientInfo + rxContent + footer;

        // 3. Launch WhatsApp
        const waLink = `https://wa.me/${data.pharmacy}?text=${finalMsg}`;
        window.open(waLink, '_blank');
    });
});
