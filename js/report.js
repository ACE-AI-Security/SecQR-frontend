document.getElementById('report-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const description = document.getElementById('description').value;
    const screenshots = document.getElementById('screenshot').files;
    const clipboardFiles = document.getElementById('clipboard-images').files;

    const formData = new FormData();
    formData.append('email', email);
    formData.append('description', description);

    // 스크린샷 파일들 추가
    if (screenshots.length > 0) {
        for (let i = 0; i < screenshots.length; i++) {
            formData.append('screenshots', screenshots[i]);
        }
    }

    // 클립보드 파일들 추가
    if (clipboardFiles.length > 0) {
        for (let i = 0; i < clipboardFiles.length; i++) {
            formData.append('clipboard-images', clipboardFiles[i]);
        }
    }

    const response = await fetch('https://secqr-backend-326060264822.asia-northeast1.run.app/report', {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        alert('Report sent successfully!');
    } else {
        alert('Failed to send report.');
    }
});

// 클립보드에서 이미지를 붙여넣는 기능
window.addEventListener('paste', function(event) {
    const clipboardData = event.clipboardData || window.clipboardData;
    const items = clipboardData.items;
    const preview = document.getElementById('clipboard-preview');
    const clipboardFileInput = document.getElementById('clipboard-images');
    const dataTransfer = new DataTransfer();

    for (let item of items) {
        if (item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img); // 여러 개의 이미지를 미리보기로 추가

            // 파일 이름을 지정 (예: clipboard_image.png)
            const renamedFile = new File([file], `clipboard_image_${Date.now()}.png`, { type: file.type });
            dataTransfer.items.add(renamedFile);
        }
    }

    // 추가된 파일들을 파일 입력 필드에 설정
    clipboardFileInput.files = dataTransfer.files;
});
