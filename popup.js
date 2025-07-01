document.addEventListener('DOMContentLoaded', function () {
    const blockingToggle = document.getElementById('blocking-toggle');
    const darkmodeToggle = document.getElementById('darkmode-toggle');

    chrome.storage.sync.get(['blockingEnabled', 'darkModeEnabled'], function (result) {
        const isEnabled = result.blockingEnabled !== false;
        blockingToggle.checked = isEnabled;
        const isDark = result.darkModeEnabled !== false;
        darkmodeToggle.checked = isDark;
    });

    blockingToggle.addEventListener('change', function () {
        const isEnabled = blockingToggle.checked;
        chrome.storage.sync.set({ blockingEnabled: isEnabled }, function () {
            notifyContentScript(isEnabled, null);
        });
    });

    darkmodeToggle.addEventListener('change', function () {
        const isDark = darkmodeToggle.checked;
        chrome.storage.sync.set({ darkModeEnabled: isDark }, function () {
            notifyContentScript(null, isDark);
        });
    });
});

function notifyContentScript(isEnabled, isDark) {
    chrome.tabs.query({ active: true, url: '*://*.youtube.com/*' }, function (tabs) {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            const message = {};
            if (isEnabled !== null) message.blockingEnabled = isEnabled;
            if (isDark !== null) message.darkModeEnabled = isDark;
            chrome.tabs.sendMessage(activeTab.id, message, function (response) {
                if (chrome.runtime.lastError) {
                    console.warn('No content script in this tab:', chrome.runtime.lastError.message);
                }
            });
        }
    });
}