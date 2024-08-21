function updateDynamicRules(addRules, removeRuleIds = []) {
  return new Promise((resolve, reject) => {
    chrome.declarativeNetRequest.updateDynamicRules(
      { addRules, removeRuleIds },
      () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          resolve("Rules updated successfully.");
        }
      }
    );
  });
}

function updateDynamicRulesFromStorage() {
  chrome.storage.sync.get("blockedURLs", (data) => {
    const blockedURLs = data.blockedURLs || [];

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const existingIds = existingRules.map((rule) => rule.id);
      let maxId = existingIds.length ? Math.max(...existingIds) : 0;

      const addRules = blockedURLs.map((url) => ({
        id: ++maxId,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: `*://${new URL(url).hostname}/*`, resourceTypes: ["main_frame"] },
      }));

      const removeRuleIds = existingRules.map((rule) => rule.id);

      updateDynamicRules(addRules, removeRuleIds)
        .then((message) => {
          console.log(message);
        })
        .catch((error) => {
          console.error("Error updating rules:", error);
        });
    });
  });
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "sync" && changes.blockedURLs) {
    updateDynamicRulesFromStorage();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  updateDynamicRulesFromStorage();
});

chrome.runtime.onStartup.addListener(() => {
  updateDynamicRulesFromStorage();
});
