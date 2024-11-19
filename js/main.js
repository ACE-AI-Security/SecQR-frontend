document.addEventListener("DOMContentLoaded", function () {
    function openUrlInNewTab() {
        const urlInput = document.querySelector(".main-url-input").value;
        if (urlInput) {
            window.open(urlInput, "_blank");
        } else {
            alert("Please enter a URL.");
        }
    }

    function navigateToPage(elementSelector, targetPage) {
        document
            .querySelector(elementSelector)
            .addEventListener("click", function () {
                window.location.href = targetPage;
            });
    }

    function toggleBlockURLImage(url) {
        chrome.storage.sync.get("blockedURLs", (data) => {
            const blockedURLs = data.blockedURLs || [];
            const blockURLButton = document.querySelector(".main-Block-URL");
            if (blockedURLs.includes(url)) {
                blockURLButton.src = "/images/Block-URL-check.svg";
            } else {
                blockURLButton.src = "/images/Block-URL.svg";
            }
        });
    }

    function toggleBlockURL() {
        const urlInput = document.querySelector(".main-url-input").value;
        if (!urlInput) {
            alert("No URL to block/unblock");
            return;
        }

        chrome.storage.sync.get("blockedURLs", (data) => {
            let blockedURLs = data.blockedURLs || [];
            const urlIndex = blockedURLs.indexOf(urlInput);

            if (urlIndex === -1) {
                if (confirm(`Do you want to block this URL: ${urlInput}?`)) {
                    blockedURLs.push(urlInput);
                    chrome.storage.sync.set({ blockedURLs }, () => {
                        toggleBlockURLImage(urlInput);
                        alert(`Blocked: ${urlInput}`);
                    });
                }
            } else {
                if (confirm(`Do you want to unblock this URL: ${urlInput}?`)) {
                    blockedURLs.splice(urlIndex, 1);
                    chrome.storage.sync.set({ blockedURLs }, () => {
                        toggleBlockURLImage("");
                        alert(`Unblocked: ${urlInput}`);
                    });
                }
            }
        });
    }

    async function fetchURLInfo() {
        const urlInput = document.querySelector(".main-url-input").value.trim();
        const alertIcon = document.querySelector(".main-alert-icon");

        if (!urlInput) {
            alert("Please enter a URL.");
            return;
        }

        try {
            const response = await fetch('https://testback-367846152084.asia-northeast3.run.app/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ url: urlInput })
            });

            const data = await response.json();

            switch (parseInt(data.prediction)) {
                case 0:
                    alertIcon.src = "/images/check_circle.svg";
                    break;
                case 1:
                    alertIcon.src = "/images/dangerous.svg";
                    break;
                case 2:
                    alertIcon.src = "/images/dangerous.svg";
                    break;
                case 3:
                    alertIcon.src = "/images/dangerous.svg";
                    break;
                default:
                    alertIcon.src = "";
                    
            }

            alertIcon.style.visibility = "visible";
        } catch (error) {
            console.error("Error fetching URL info:", error);
        }
    }

    document
        .querySelector(".main-open-url")
        .addEventListener("click", openUrlInNewTab);

    navigateToPage(".main-qr-scan-container", "image-upload.html");
    navigateToPage(".main-qr-generate-container", "generate.html");
    navigateToPage(".main-url-info-container", "url-info.html");
    navigateToPage(".main-history-container", "history.html");

    document
        .querySelector(".main-Block-URL-button")
        .addEventListener("click", toggleBlockURL);

    document
        .querySelector(".main-Search-button")
        .addEventListener("click", fetchURLInfo);

    document
        .querySelector(".main-url-input")
        .addEventListener("input", (event) => {
            toggleBlockURLImage(event.target.value);
        });

    toggleBlockURLImage(document.querySelector(".main-url-input").value);
});


document.addEventListener("DOMContentLoaded", function () {
    // 기존 코드...

    function positionTooltip(button, tooltip) {
        const buttonRect = button.getBoundingClientRect();
        tooltip.style.left = `${buttonRect.left + window.scrollX}px`;
        tooltip.style.top = `${buttonRect.top + buttonRect.height + window.scrollY}px`;
    }

    const searchButton = document.querySelector(".main-Search-button");
    const searchTooltip = document.querySelector(".tooltip-search");

    searchButton.addEventListener("mouseover", () => {
        positionTooltip(searchButton, searchTooltip);
        searchTooltip.style.display = "block";
    });

    searchButton.addEventListener("mouseout", () => {
        searchTooltip.style.display = "none";
    });

    const blockButton = document.querySelector(".main-Block-URL-button");
    const blockTooltip = document.querySelector(".tooltip-block");

    blockButton.addEventListener("mouseover", () => {
        positionTooltip(blockButton, blockTooltip);
        blockTooltip.style.display = "block";
    });

    blockButton.addEventListener("mouseout", () => {
        blockTooltip.style.display = "none";
    });
});