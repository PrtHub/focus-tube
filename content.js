(function() {
    let isBlockingEnabled = true;
    
    const selectors = [
        'ytd-rich-shelf-renderer:has(#title-text:contains("Shorts"))', // Home/Channel shelf
        'ytd-reel-shelf-renderer', // Alternative Shorts shelf renderer
        'ytd-video-renderer:has(a[href^="/shorts/"])', // Videos in feeds linking to shorts
        'ytd-grid-video-renderer:has(a[href^="/shorts/"])', // Grid videos (trending, search)
        'ytd-rich-item-renderer:has(a[href^="/shorts/"])', // Home feed items
        'ytd-guide-entry-renderer:has(a[href="/shorts"])', // Main sidebar link
        'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])', // Collapsed sidebar link
        'ytd-pivot-bar-item-renderer:has(.tab-title:contains("Shorts"))' // "Shorts" tab on channel pages
    ];

    function hideShorts() {
    if (!isBlockingEnabled) {
    document.querySelectorAll('.shorts-hidden-by-focustube').forEach(element => {
    element.style.display = '';
    element.classList.remove('shorts-hidden-by-focustube');
    });
    return;
    }

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          element.style.display = 'none';
          element.classList.add('shorts-hidden-by-focustube');
        });
      } catch (e) {
        console.error('Error processing selector:', selector, e);
      }
    });
    
    }
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.blockingEnabled !== undefined) {
    isBlockingEnabled = message.blockingEnabled;
    hideShorts();
    }
    });
    
    const observer = new MutationObserver(hideShorts);
    
    const observerConfig = {
    childList: true,
    subtree: true
    };
    
    observer.observe(document.body, observerConfig);
    
    hideShorts();
    
    function handleUrlRedirection() {
        if (!isBlockingEnabled) return;
    
        if (window.location.pathname.startsWith('/shorts/')) {
            const videoId = window.location.pathname.substring('/shorts/'.length);
            const newUrl = `/watch?v=${videoId}`;
            if (window.location.pathname !== '/watch') {
                window.location.replace(newUrl);
            }
        }
    }
    
    handleUrlRedirection();
    
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            handleUrlRedirection();
        }
    }).observe(document, {subtree: true, childList: true});
    
    })();