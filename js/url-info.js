const fetchURLInfo = async () => {
    const urlInput = document.querySelector(".url-input");
    const urlToCheck = urlInput.value.trim();
    const toggleContent = document.querySelector('.toggle-content');

    if (!urlToCheck) {
        alert("Please enter a URL.");
        toggleContent.classList.remove('active'); // URL이 없으면 토글 콘텐츠를 숨김
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ url: urlToCheck })
        });
        const data = await response.json();

        const statusIcon = document.getElementById("status-icon");
        const statusText = document.getElementById("status-text");
        const iconGroup = document.getElementById("icon-group");
        switch (parseInt(data.prediction)) {
            case 0:
                statusIcon.src = "/images/check_circle.svg";
                statusText.innerText = "Safe URL";
                break;
            case 1:
                statusIcon.src = "/images/dangerous.svg";
                statusText.innerText = "Defacement URL";
                break;
            case 2:
                statusIcon.src = "/images/dangerous.svg";
                statusText.innerText = "Phishing URL";
                break;
            case 3:
                statusIcon.src = "/images/dangerous.svg";
                statusText.innerText = "Malware URL";
                break;
            default:
                statusIcon.src = "/images/unknown.svg";
                statusText.innerText = "Unknown Status";
        }

        iconGroup.style.visibility = "visible";
        displayURLInfo(data.url_info);
        toggleContent.classList.add('active'); // URL이 유효하면 토글 콘텐츠를 표시
    } catch (error) {
        console.error("Error fetching URL info:", error);
        toggleContent.classList.remove('active'); // 에러가 발생하면 토글 콘텐츠를 숨김
    }
};

document.querySelector(".Search-button").addEventListener("click", fetchURLInfo);

// 페이지 로드 시 토글 콘텐츠 숨김
document.addEventListener('DOMContentLoaded', () => {
    const toggleContent = document.querySelector('.toggle-content');
    toggleContent.classList.remove('active');

    const button = document.getElementById('togglebutton');
    button.addEventListener('click', () => {
        // URL이 입력된 경우에만 토글 동작
        if (document.querySelector('.url-input').value.trim()) {
            toggleContent.classList.toggle('active');
        }
    });
});