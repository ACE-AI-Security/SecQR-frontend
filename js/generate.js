document.addEventListener('DOMContentLoaded', function() {
    // 뒤로가기 버튼 클릭 이벤트
    document.querySelector('.Topnav-left-arrow').addEventListener('click', function() {
        window.location.href = 'main.html';
    });

    // URL 열기 버튼 클릭 이벤트
    document.querySelector('.Topnav-open-url').addEventListener('click', function() {
        const url = document.querySelector('.url-input').value;
        if (url) {
            window.open(url, '_blank');
        } else {
            alert('Please enter a valid URL.');
        }
    });

    // QR 코드 생성 및 다운로드 함수
    function generateQRCode() {
        const url = document.querySelector('.url-input').value;
        if (url) {
            const qrCodeContainer = document.createElement('div');
            const qrCode = new QRCode(qrCodeContainer, {
                text: url,
                width: 128,
                height: 128
            });

            // QR 코드 이미지 생성 후 다운로드
            setTimeout(() => {
                const qrImage = qrCodeContainer.querySelector('img').src;
                document.querySelector('.Image-placeholder').src = qrImage; // QR 코드 이미지를 이미지 플레이스홀더에 표시
                
                // QR 코드 다운로드
                downloadQRCode(qrImage);
            }, 500);
        } else {
            alert('Please enter a valid URL.');
        }
    }

    // QR 코드 다운로드 함수
    function downloadQRCode(qrImage) {
        const link = document.createElement('a');
        link.href = qrImage; // QR 코드 이미지의 URL
        link.download = 'QRCode.png'; // 다운로드할 파일 이름
        document.body.appendChild(link);
        link.click(); // 링크 클릭
        document.body.removeChild(link); // 링크 제거
    }

    // 다운로드 버튼 클릭 이벤트
    document.querySelector('.Download-button').addEventListener('click', generateQRCode);

    // URL 입력 시 Enter 키 이벤트
    document.querySelector('.url-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            generateQRCode();
        }
    });
});
