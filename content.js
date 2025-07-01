(function () {
  let isBlockingEnabled = true;

  const selectors = [
    "ytd-reel-shelf-renderer",
    'ytd-video-renderer:has(a[href^="/shorts/"])',
    'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
    'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
    'ytd-guide-entry-renderer:has(a[href="/shorts"])',
    'ytd-mini-guide-entry-renderer:has(a[title="Shorts"])',
  ];

  function hideShorts() {
    if (!isBlockingEnabled) {
      document
        .querySelectorAll(".shorts-hidden-by-focustube")
        .forEach((element) => {
          element.style.display = "";
          element.classList.remove("shorts-hidden-by-focustube");
        });
      return;
    }

    selectors.forEach((selector) => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element) => {
          element.style.display = "none";
          element.classList.add("shorts-hidden-by-focustube");
        });
      } catch (e) {
        console.error("Error processing selector:", selector, e);
      }
    });

    document.querySelectorAll('ytd-rich-shelf-renderer').forEach(el => {
      const title = el.querySelector('#title-text');
      if (title && title.textContent.includes('Shorts')) {
        el.style.display = "none";
        el.classList.add("shorts-hidden-by-focustube");
      }
    });

    document.querySelectorAll('ytd-pivot-bar-item-renderer').forEach(el => {
      const tab = el.querySelector('.tab-title');
      if (tab && tab.textContent.includes('Shorts')) {
        el.style.display = "none";
        el.classList.add("shorts-hidden-by-focustube");
      }
    });
    
    const shortsItems = document.querySelectorAll('ytd-rich-item-renderer');
    shortsItems.forEach(item => {
      const shortsOverlay = item.querySelector('ytd-thumbnail-overlay-time-status-renderer[aria-label="Shorts"]');
      if (shortsOverlay) {
        item.style.display = 'none';
        item.classList.add('shorts-hidden-by-focustube');
      }
    });
    
    const shortsNavLinks = document.querySelectorAll('ytd-guide-entry-renderer a[title="Shorts"]');
    shortsNavLinks.forEach(link => {
      const menuItem = link.closest('ytd-guide-entry-renderer');
      if (menuItem) {
        menuItem.style.display = 'none';
        menuItem.classList.add('shorts-hidden-by-focustube');
      }
    })
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
    subtree: true,
  };

  observer.observe(document.body, observerConfig);

  hideShorts();

  function handleUrlRedirection() {
    if (!isBlockingEnabled) return;

    if (window.location.pathname.startsWith("/shorts/")) {
      const videoId = window.location.pathname.substring("/shorts/".length);
      const newUrl = `/watch?v=${videoId}`;
      if (window.location.pathname !== "/watch") {
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
  }).observe(document, { subtree: true, childList: true });
})();
