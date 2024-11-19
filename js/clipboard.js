document.addEventListener("DOMContentLoaded", () => {
  const uploadContainer = document.querySelector(".Upload");
  const imageContainer = document.querySelector(".Image");
  const placeholderImage = document.querySelector(".Image-placeholder");
  let uploadedImage = null;

  const urlInput = document.querySelector(".url-input");
  urlInput.disabled = true;

  const addWhiteBackground = (img) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height);

    return canvas;
  };

  const decodeQRFromImage = (img) => {
    const processedCanvas = addWhiteBackground(img);
    const ctx = processedCanvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, processedCanvas.width, processedCanvas.height);

    const code = jsQR(imageData.data, processedCanvas.width, processedCanvas.height);

    if (code) {
      console.log("Decoded Data:", code.data);
      urlInput.value = code.data;
      toggleBlockURLImage(code.data);
      fetchURLInfo(code.data);
    } else {
      console.error("QR Code decoding failed.");
      urlInput.value = "";
      toggleBlockURLImage("");
    }
  };

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

  const fetchURLInfo = async (url) => {
    const alertIcon = document.querySelector(".clipboard-alert-icon");

    try {
      const response = await fetch('https://testback-367846152084.asia-northeast3.run.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ url: url }),
      });
      const data = await response.json();

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

      alertIcon.style.visibility = "visible";
    } catch (error) {
      console.error("Error fetching URL info:", error);
    }
  };

  document.querySelector(".Block-URL-button").addEventListener("click", toggleBlockURL);

  document.querySelector(".Topnav-left-arrow").addEventListener("click", () => {
    window.location.href = "main.html";
  });

  const topnavRightContainer = document.querySelector(".Topnav-right-container");
  topnavRightContainer.addEventListener("click", () => {
    const decodedURL = urlInput.value;
    if (decodedURL) {
      window.open(decodedURL, "_blank");
    } else {
      alert("Please enter a URL.");
    }
  });

  document.querySelector(".Nav-non-select:nth-child(1)").addEventListener("click", () => {
    window.location.href = "image-upload.html";
  });

  document.querySelector(".Nav-non-select:nth-child(3)").addEventListener("click", () => {
    window.location.href = "capture.html";
  });

  document.addEventListener("paste", handleClipboardPaste);

  urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    toggleBlockURLImage(url);
  });

  toggleBlockURLImage(urlInput.value);
});
