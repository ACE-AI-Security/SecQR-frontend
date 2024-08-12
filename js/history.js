document.addEventListener("DOMContentLoaded", () => {
  const blockedUrlListContainer = document.querySelector(".blocked-url-list-container");
  
  document.querySelector('.Topnav-left-arrow').addEventListener('click', function() {
    window.location.href = 'main.html';
  });

  const renderBlockedUrls = () => {
    chrome.storage.sync.get("blockedURLs", (data) => {
      const blockedURLs = data.blockedURLs || [];
      console.log("Blocked URLs from storage:", blockedURLs);
      blockedUrlListContainer.innerHTML = ""; 

      blockedURLs.forEach((url, index) => {
        const listItem = document.createElement("div");
        listItem.className = "blocked-url-list";
        
        const urlText = document.createElement("span");
        urlText.className = "url-text";
        urlText.textContent = url;

        const removeButton = document.createElement("button");
        removeButton.className = "remove-button";
        
        const closeIcon = document.createElement("img");
        closeIcon.src = "../images/Close.svg";
        closeIcon.alt = "Unblock";
        closeIcon.className = "close-icon";
        closeIcon.addEventListener("click", () => {
          unblockUrl(index);
        });

        removeButton.appendChild(closeIcon);
        listItem.appendChild(urlText);
        listItem.appendChild(removeButton);
        blockedUrlListContainer.appendChild(listItem);
      });
    });
  };

  const unblockUrl = (index) => {
    chrome.storage.sync.get("blockedURLs", (data) => {
      let blockedURLs = data.blockedURLs || [];
      const urlToUnblock = blockedURLs[index];

      if (confirm(`Do you want to unblock this URL: ${urlToUnblock}?`)) {
        blockedURLs.splice(index, 1);
        chrome.storage.sync.set({ blockedURLs: blockedURLs }, () => {
          alert(`Unblocked: ${urlToUnblock}`);
          renderBlockedUrls();
        });
      }
    });
  };

  renderBlockedUrls();
});
