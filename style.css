document.getElementById('prescriptionForm').addEventListener('submit', function(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();

    // Gather all the data from the form
    const patientName = document.getElementById('patientName').value.trim();
    const patientAge = document.getElementById('patientAge').value.trim();
    const patientGender = document.getElementById('patientGender').value;
    const patientPhone = document.getElementById('patientPhone').value.trim();
    const prescription = document.getElementById('prescription').value.trim();
    let pharmacyNumber = document.getElementById('pharmacyNumber').value.trim();

    // Clean up the pharmacy number: remove any +, spaces, dashes, or brackets
    pharmacyNumber = pharmacyNumber.replace(/\D/g, '');

    // Format the message for WhatsApp using markdown (asterisks for bold)
    const message = `*MKF Connect - New Prescription* 🏥

*Patient Details:*
👤 Name: ${patientName}
📅 Age: ${patientAge}
⚧️ Gender: ${patientGender}
📞 Phone: ${patientPhone}

*Prescription / Orders:*
💊 ${prescription}

_Sent securely via MKF Connect portal._`;

    // URL Encode the message so it can be passed safely in a web link
    const encodedMessage = encodeURIComponent(message);

    // Create the WhatsApp API link
    const whatsappURL = `https://wa.me/${pharmacyNumber}?text=${encodedMessage}`;

    // Open WhatsApp in a new tab/window
    window.open(whatsappURL, '_blank');
});
