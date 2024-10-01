document.addEventListener("DOMContentLoaded", () => {
  const uploadContainer = document.querySelector(".Upload");
  const imageContainer = document.querySelector(".Upload-image-container");
  const textContainer = document.querySelector(".Upload-text-container");
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";

  let uploadedImage = null;
  const alertIcon = document.querySelector(".image-upload-alert-icon"); // alertIcon 요소 선택

  // URL 입력 필드 비활성화
  const urlInput = document.querySelector(".url-input");
  urlInput.disabled = true;

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (uploadedImage) {
        uploadedImage.remove();
      }

      // 이미지 업로드 시 alertIcon 숨기기
      alertIcon.style.visibility = "hidden";

      uploadedImage = document.createElement("img");
      uploadedImage.onload = () => {
        const qrCanvas = document.createElement("canvas");
        const qrContext = qrCanvas.getContext("2d");
        qrCanvas.width = uploadedImage.width;
        qrCanvas.height = uploadedImage.height;
        qrContext.drawImage(
          uploadedImage,
          0,
          0,
          qrCanvas.width,
          qrCanvas.height
        );
        const imageData = qrContext.getImageData(
          0,
          0,
          qrCanvas.width,
          qrCanvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          urlInput.value = code.data;
          toggleBlockURLImage(code.data);
          fetchURLInfo(); // URL 디코딩 후 자동으로 서버에 전송 및 아이콘 업데이트
        } else {
          urlInput.value = "";
          toggleBlockURLImage("");
        }
      };
      uploadedImage.src = event.target.result;
      uploadedImage.style.maxWidth = "100%";
      uploadedImage.style.maxHeight = "100%";
      uploadedImage.style.objectFit = "contain";
      uploadedImage.style.cursor = "pointer";
      uploadContainer.appendChild(uploadedImage);

      // 이미지가 업로드되면 이미지와 텍스트 컨테이너 숨기기
      imageContainer.classList.add("hidden");
      textContainer.classList.add("hidden");
    };
    reader.readAsDataURL(file);
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

  const openDecodedURL = () => {
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
    const urlToFetch = urlInput.value.trim();

    if (!urlToFetch) {
      alert("Please enter a URL.");
      return;
    }

    try {
      const response = await fetch(
        "https://secqr-backend-326060264822.asia-northeast1.run.app/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ url: urlToFetch }),
        }
      );
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

  const topnavRightContainer = document.querySelector(
    ".Topnav-right-container"
  );
  topnavRightContainer.addEventListener("click", openDecodedURL);

  uploadContainer.addEventListener("click", () => {
    if (uploadedImage) {
      uploadedImage.remove();
      uploadedImage = null;

      // 이미지 삭제 후 이미지 및 텍스트 컨테이너 다시 보이게 하기
      imageContainer.classList.remove("hidden");
      textContainer.classList.remove("hidden");

      // 이미지 삭제 시 alertIcon도 숨기기
      alertIcon.style.visibility = "hidden";

      urlInput.value = "";
      toggleBlockURLImage("");
    } else {
      fileInput.value = null;
      fileInput.click();
    }
  });

  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  document
    .querySelector(".Block-URL-button")
    .addEventListener("click", toggleBlockURL);

  addDragAndDropHandlers(uploadContainer);

  document.body.appendChild(fileInput);

  toggleBlockURLImage(urlInput.value);

  document
    .querySelector(".Topnav-left-arrow")
    .addEventListener("click", function () {
      window.location.href = "main.html";
    });

  document
    .querySelector(".Nav-non-select:nth-child(2)")
    .addEventListener("click", function () {
      window.location.href = "clipboard.html";
    });

  document
    .querySelector(".Nav-non-select:nth-child(3)")
    .addEventListener("click", function () {
      window.location.href = "capture.html";
    });
});
