const openDecodedURL = () => {
    const urlInput = document.querySelector(".url-input");
    const decodedURL = urlInput.value;
    if (decodedURL) {
        window.open(decodedURL, "_blank");
    } else {
        alert("Please enter a URL.");
    }
};

const toggleBlockURL = () => {
    const urlInput = document.querySelector(".url-input");
    const urlToBlock = urlInput.value.trim();
    if (!urlToBlock) {
        alert("No URL to block/unblock");
        return;
    }
    chrome.storage.sync.get("blockedURLs", (data) => {
        let blockedURLs = data.blockedURLs || [];
        const urlIndex = blockedURLs.indexOf(urlToBlock);
        if (urlIndex === -1) {
            if (confirm(`Do you want to block this URL: ${urlToBlock}?`)) {
                blockedURLs.push(urlToBlock);
                chrome.storage.sync.set({ blockedURLs }, () => {
                    toggleBlockURLImage(urlToBlock);
                    alert(`Blocked: ${urlToBlock}`);
                });
            }
        } else {
            if (confirm(`Do you want to unblock this URL: ${urlToBlock}?`)) {
                blockedURLs.splice(urlIndex, 1);
                chrome.storage.sync.set({ blockedURLs }, () => {
                    toggleBlockURLImage(urlToBlock);
                    alert(`Unblocked: ${urlToBlock}`);
                });
            }
        }
    });
};

const toggleBlockURLImage = (url) => {
    chrome.storage.sync.get("blockedURLs", (data) => {
        const blockedURLs = data.blockedURLs || [];
        const blockURLButton = document.querySelector(".Block-URL");
        if (blockedURLs.includes(url)) {
            blockURLButton.src = "/images/Block-URL-check.svg";
        } else {
            blockURLButton.src = "/images/Block-URL.svg";
        }
    });
};

document.addEventListener('DOMContentLoaded', (event) => {
    const content = document.querySelector('.toggle-content');
    content.classList.add('active'); 
   
    document.getElementById('parameter-length-value').innerText = ''; 
    document.getElementById('ip-address-icon').src = "/images/check_gray.svg"; 
    document.getElementById('protocol-icon').src = "/images/check_gray.svg";
    document.getElementById('sub-domain-icon').src = "/images/check_gray.svg";
    document.getElementById('abnormal-url-icon').src = "/images/check_gray.svg";

    const fetchURLInfo = async () => {
        const urlInput = document.querySelector(".url-input");
        const urlToCheck = urlInput.value.trim();
        if (!urlToCheck) {
            alert("Please enter a URL.");
            return;
        }

        try {
            const response = await fetch('https://acesecqr1-871288659002.asia-northeast3.run.app/predict', { 
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
                    statusIcon.src = "";
                    statusText.innerText = "Unknown Status";
            }
            iconGroup.style.visibility = "visible"; 
            displayURLInfo(data.url_info);
        } catch (error) {
            console.error("Error fetching URL info:", error);
        }
    };

    document.querySelector(".Search-button").addEventListener("click", fetchURLInfo);
});

const displayURLInfo = (urlInfo) => {
    const { parameter_len, having_ip_address, protocol, sub_domain, abnormal_url } = urlInfo;
    document.getElementById('parameter-length-value').innerText = parameter_len !== undefined ? parameter_len : ''; // 파라미터 길이 업데이트
    document.getElementById('ip-address-icon').src = having_ip_address ? "/images/check_gray.svg" : "/images/Right Button.svg";
    document.getElementById('protocol-icon').src = protocol ? "/images/check_gray.svg" : "/images/Right Button.svg";
    document.getElementById('sub-domain-icon').src = sub_domain ? "/images/check_gray.svg" : "/images/Right Button.svg";
    document.getElementById('abnormal-url-icon').src = abnormal_url ? "/images/check_gray.svg" : "/images/Right Button.svg";
};

const topnavRightContainer = document.querySelector(".Topnav-right-container");
topnavRightContainer.addEventListener("click", openDecodedURL);

document.querySelector(".Block-URL-button").addEventListener("click", toggleBlockURL);

document.querySelector(".Topnav-left-arrow").addEventListener("click", function () {
    window.location.href = "main.html";
});

const urlInput = document.querySelector(".url-input");
urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    toggleBlockURLImage(url);
});
