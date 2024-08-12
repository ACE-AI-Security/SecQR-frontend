document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.Topnav-left-arrow').addEventListener('click', function() {
        window.location.href = 'main.html';
    });

    document.querySelector('.Topnav-open-url').addEventListener('click', function() {
        const url = document.querySelector('.generate-url-input').value;
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Please enter a valid URL.');
        }
    });

    function generateQRCode() {
        const url = document.querySelector('.generate-url-input').value;
        if (url) {

            const qrCodeContainer = document.createElement('div');
            const qrCode = new QRCode(qrCodeContainer, {
                text: url,
                width: 128,
                height: 128
            });

            setTimeout(() => {
                const qrImage = qrCodeContainer.querySelector('img').src;
                document.querySelector('.Image-placeholder').src = qrImage;
            }, 500);
        } else {
            alert('Please enter a valid URL.');
        }
    }

function downloadQRCode() {
    const qrImage = document.querySelector('.Image-placeholder');
    const qrImageSrc = qrImage.src;

    if (!qrImageSrc || qrImageSrc.includes('Image-placeholder.svg')) {
        alert('No QR code to download.');
        return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = qrImageSrc;
    downloadLink.download = 'qr-code.png';
    downloadLink.click();
}


    document.querySelector('.generate-qr-button').addEventListener('click', generateQRCode);

    document.querySelector('.generate-Download-button').addEventListener('click', downloadQRCode);

    document.querySelector('.generate-url-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            generateQRCode();
        }
    });
});