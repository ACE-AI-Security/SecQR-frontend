document.addEventListener("DOMContentLoaded", () => {
  const uploadContainer = document.querySelector(".Upload");
  const imageContainer = document.querySelector(".Image");
  const placeholderImage = document.querySelector(".Image-placeholder");
  const urlInput = document.querySelector(".url-input");
  urlInput.disabled = true; // URL 수정 불가

  const captureScreen = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      const img = new Image();
      img.onload = () => {
        imageContainer.innerHTML = "";
        imageContainer.appendChild(img);
        placeholderImage.style.display = "none";
        decodeQRFromImage(img);
      };
      img.src = dataUrl;
    });
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        imageContainer.innerHTML = "";
        imageContainer.appendChild(img);
        placeholderImage.style.display = "none";
        decodeQRFromImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const decodeQRFromImage = (img) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      const decodedURL = code.data;
      urlInput.value = decodedURL;
      toggleBlockURLImage(decodedURL);
      fetchURLInfo(decodedURL); // 디코딩되면 자동으로 서버에 전송
    } else {
      urlInput.value = "";
      toggleBlockURLImage("");
    }
  };

  const addDragAndDropHandlers = (element) => {
    element.addEventListener("dragover", (event) => {
      event.preventDefault();
      element.classList.add("dragover");
    });

    element.addEventListener("dragleave", () => {
      element.classList.remove("dragover");
    });

    element.addEventListener("drop", (event) => {
      event.preventDefault();
      element.classList.remove("dragover");
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    });
  };

  const fetchURLInfo = async (url) => {
    const alertIcon = document.querySelector(".capture-alert-icon");

    try {
      const response = await fetch('https://secqr-backend-jiixy4725q-an.a.run.app/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ url: url })
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

  const topnavRightContainer = document.querySelector(".Topnav-right-container");
  topnavRightContainer.addEventListener("click", () => {
    const decodedURL = urlInput.value;
    if (decodedURL) {
      window.open(decodedURL, "_blank");
    } else {
      alert("Please enter a URL.");
    }
  });

  uploadContainer.addEventListener("click", () => {
    captureScreen();
  });

  document.querySelector(".Block-URL-button").addEventListener("click", toggleBlockURL);

  addDragAndDropHandlers(uploadContainer);

  document.querySelector(".Topnav-left-arrow").addEventListener("click", function () {
    window.location.href = "main.html";
  });

  document.querySelector(".Nav-non-select:nth-child(1)").addEventListener("click", function () {
    window.location.href = "image-upload.html";
  });

  document.querySelector(".Nav-non-select:nth-child(2)").addEventListener("click", function () {
    window.location.href = "clipboard.html";
  });

  toggleBlockURLImage(urlInput.value);
});
