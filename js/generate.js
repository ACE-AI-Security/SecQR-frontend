document.addEventListener('DOMContentLoaded', function() {
    // Navigate to main.html when left-arrow is clicked
    document.querySelector('.Topnav-left-arrow').addEventListener('click', function() {
        window.location.href = 'main.html';
    });

    // Open the URL in a new window when open-url icon is clicked
    document.querySelector('.Topnav-open-url').addEventListener('click', function() {
        const url = document.querySelector('.generate-url-input').value;
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Please enter a valid URL.');
        }
    });

    // Function to generate QR code
    function generateQRCode() {
        const url = document.querySelector('.generate-url-input').value;
        if (url) {
            // Generate QR code
            const qrCodeContainer = document.createElement('div');
            const qrCode = new QRCode(qrCodeContainer, {
                text: url,
                width: 128,
                height: 128
            });

            // Wait for QR code to be generated
            setTimeout(() => {
                const qrImage = qrCodeContainer.querySelector('img').src;
                document.querySelector('.Image-placeholder').src = qrImage;
            }, 500);
        } else {
            alert('Please enter a valid URL.');
        }
    }

    // Function to download the QR code image
    function downloadQRCode() {
        const qrImageSrc = document.querySelector('.Image-placeholder').src;
        if (qrImageSrc && qrImageSrc !== '/images/Image-placeholder.svg') {
            // Create a link to download the image
            const downloadLink = document.createElement('a');
            downloadLink.href = qrImageSrc;
            downloadLink.download = 'qr-code.png';
            downloadLink.click();
        } else {
            alert('No QR code to download.');
        }
    }

    // Generate QR code when generate button is clicked
    document.querySelector('.generate-qr-button').addEventListener('click', generateQRCode);

    // Download QR code when Download button is clicked
    document.querySelector('.generate-Download-button').addEventListener('click', downloadQRCode);

    // Generate QR code when Enter key is pressed in the input field
    document.querySelector('.generate-url-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            generateQRCode();
        }
    });
});
