document.addEventListener('DOMContentLoaded', function () {
    const blockingToggle = document.getElementById('blocking-toggle');

    chrome.storage.sync.get(['blockingEnabled'], function (result) {
        const isEnabled = result.blockingEnabled !== false;
        blockingToggle.checked = isEnabled;
    });

    blockingToggle.addEventListener('change', function () {
        const isEnabled = blockingToggle.checked;

        chrome.storage.sync.set({ blockingEnabled: isEnabled }, function () {
            notifyContentScript(isEnabled);
        });
    });
});

function notifyContentScript(isEnabled) {
    chrome.tabs.query({ active: true, url: '*://*.youtube.com/*' }, function (tabs) {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { blockingEnabled: isEnabled }, function(response) {
                if (chrome.runtime.lastError) {
                    // Suppress harmless error
                    // console.warn('No content script in this tab:', chrome.runtime.lastError.message);
                }
            });
        }
    });
}