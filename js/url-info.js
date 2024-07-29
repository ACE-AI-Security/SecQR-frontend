
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

const topnavRightContainer = document.querySelector(
    ".Topnav-right-container"
);
topnavRightContainer.addEventListener("click", openDecodedURL);

document
    .querySelector(".Block-URL-button")
    .addEventListener("click", toggleBlockURL);

document
    .querySelector(".Topnav-left-arrow")
    .addEventListener("click", function () {
    window.location.href = "main.html";
    });

const urlInput = document.querySelector(".url-input");
urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    toggleBlockURLImage(url);
});

document.addEventListener('DOMContentLoaded', (event) => {
    const button = document.getElementById('toglebutton');
    const content = document.querySelector('.toggle-content');

    button.addEventListener('click', () => {
        content.classList.toggle('active');
    });
});
