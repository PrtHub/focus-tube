document.addEventListener('DOMContentLoaded', function () {
    const blockingToggle = document.getElementById('blocking-toggle');

    // 1. Load the saved state and update the toggle
    chrome.storage.sync.get(['blockingEnabled'], function (result) {
        // Default to true if no value is stored
        const isEnabled = result.blockingEnabled !== false;
        blockingToggle.checked = isEnabled;
    });

    // 2. Add a listener for when the toggle is changed
    blockingToggle.addEventListener('change', function () {
        const isEnabled = blockingToggle.checked;

        // 3. Save the new state
        chrome.storage.sync.set({ blockingEnabled: isEnabled }, function () {
            // 4. Send a message to the active content script
            notifyContentScript(isEnabled);
        });
    });
});

/**
 * Finds the active YouTube tab and sends it the current blocking status.
 * @param {boolean} isEnabled - The current state of the blocking toggle.
 */
function notifyContentScript(isEnabled) {
    // Query for the active tab in the current window that is a YouTube page
    chrome.tabs.query({ active: true, url: '*://*.youtube.com/*' }, function (tabs) {
        if (tabs.length > 0) {
            const activeTab = tabs[0];
            chrome.tabs.sendMessage(activeTab.id, { blockingEnabled: isEnabled });
        }
    });
}
