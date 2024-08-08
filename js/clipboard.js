document.addEventListener("DOMContentLoaded", () => {
  const uploadContainer = document.querySelector(".Upload");
  const imageContainer = document.querySelector(".Image");
  const placeholderImage = document.querySelector(".Image-placeholder");
  let uploadedImage = null;

  const handleClipboardPaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            replaceImage(img);
            decodeQRFromImage(img);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  };

  const replaceImage = (newImage) => {
    if (uploadedImage) {
      uploadedImage.style.display = "block";
    }
    imageContainer.innerHTML = "";
    imageContainer.appendChild(newImage);
    uploadedImage = newImage;
    placeholderImage.style.display = "none";
  };

  const decodeQRFromImage = (img) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    const urlInput = document.querySelector(".url-input");
    if (code) {
      urlInput.value = code.data;
      toggleBlockURLImage(code.data);
    } else {
      urlInput.value = "";
      toggleBlockURLImage("");
    }
  };

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

  const fetchURLInfo = async () => {
    const urlInput = document.querySelector(".url-input").value.trim();
    const alertIcon = document.querySelector(".clipboard-alert-icon");

    if (!urlInput) {
      alert("Please enter a URL.");
      return;
    }

    try {
      const response = await fetch('https://secqr-backend-jiixy4725q-an.a.run.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: urlInput })
      });
      const data = await response.json();

      // 예측 값에 따라 아이콘 업데이트
      switch (parseInt(data.prediction)) {
        case 0:
          alertIcon.src = "/images/check_circle.svg";
          break;
        case 1:
          alertIcon.src = "/images/warning.svg";
          break;
        case 2:
        case 3:
          alertIcon.src = "/images/dangerous.svg";
          break;
        default:
          alertIcon.src = "";
      }

      alertIcon.style.visibility = "visible"; // 아이콘 표시
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

  document.querySelector(".Nav-non-select:nth-child(1)").addEventListener("click", function () {
    window.location.href = "image-upload.html";
  });

  document.querySelector(".Nav-non-select:nth-child(3)").addEventListener("click", function () {
    window.location.href = "capture.html";
  });

  document.addEventListener("paste", handleClipboardPaste);

  const urlInput = document.querySelector(".url-input");
  urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    toggleBlockURLImage(url);
  });

  toggleBlockURLImage(urlInput.value);
});
