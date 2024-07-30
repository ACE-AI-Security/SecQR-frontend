const openDecodedURL = () => {
    const urlInput = document.querySelector(".url-input");
    const decodedURL = urlInput.value;
    if (decodedURL) {
        window.open(decodedURL, "_blank");
    } else {
        alert("Please enter a URL.");
    }
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

const displayURLInfo = (urlInfo) => {
    const { parameter_len, having_ip_address, protocol, sub_domain, abnormal_url } = urlInfo;
    document.getElementById('parameter-length-icon').src = parameter_len ? "/images/Close.svg" : "/images/Right Button.svg";
    document.getElementById('ip-address-icon').src = having_ip_address ? "/images/Close.svg" : "/images/Right Button.svg";
    document.getElementById('protocol-icon').src = protocol ? "/images/Close.svg" : "/images/Right Button.svg";
    document.getElementById('sub-domain-icon').src = sub_domain ? "/images/Close.svg" : "/images/Right Button.svg";
    document.getElementById('abnormal-url-icon').src = abnormal_url ? "/images/Close.svg" : "/images/Right Button.svg";
};

const fetchURLInfo = async () => {
    const urlInput = document.querySelector(".url-input");
    const urlToCheck = urlInput.value.trim();

    if (!urlToCheck) {
        alert("Please enter a URL.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/check_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: urlToCheck })
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
    } catch (error) {
        console.error("Error fetching URL info:", error);
    }
};

const topnavRightContainer = document.querySelector(".Topnav-right-container");
topnavRightContainer.addEventListener("click", openDecodedURL);

document.querySelector(".Block-URL-button").addEventListener("click", toggleBlockURL);

document.querySelector(".Search-button").addEventListener("click", fetchURLInfo);

document.querySelector(".Topnav-left-arrow").addEventListener("click", function () {
    window.location.href = "main.html";
});

const urlInput = document.querySelector(".url-input");
urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    toggleBlockURLImage(url);
});

document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('togglebutton');
    const content = document.querySelector('.toggle-content');

    button.addEventListener('click', () => {
        content.classList.toggle('active');
    });
});
