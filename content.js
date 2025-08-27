// content.js
(function() {
  'use strict';

  // Prevent running inside iframes or sandboxed docs
  if (window.location.protocol === 'about:' || window.location.protocol === 'data:' || window !== window.top) {
    return;
  }

  // Inject the page-context script (page-script.js)
  const scriptUrl = chrome.runtime.getURL('page-script.js');
  const injected = document.createElement('script');
  injected.src = scriptUrl;
  injected.async = false;
  (document.head || document.documentElement).appendChild(injected);
  injected.onload = () => injected.remove();

  // Forward config to page script
  function sendConfigToPage(config) {
    window.postMessage({ source: 'yt-quality-extension', action: 'init', config }, '*');
  }

  // Load settings from storage and send to page
  chrome.storage.sync.get(['enabled', 'quality', 'debug', 'attemptIntervalMs', 'maxAttempts'], function(data) {
    const cfg = {
      enabled: data.enabled !== undefined ? data.enabled : true,
      quality: data.quality || '1080p',
      debug: data.debug !== undefined ? data.debug : true,
      attemptIntervalMs: data.attemptIntervalMs || 500,
      maxAttempts: data.maxAttempts || 60
    };
    sendConfigToPage(cfg);
  });

  // When popup updates settings, reload config and send to page script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleExtension' || request.action === 'updateQuality') {
      chrome.storage.sync.get(['enabled', 'quality', 'debug', 'attemptIntervalMs', 'maxAttempts'], function(data) {
        const cfg = {
          enabled: data.enabled !== undefined ? data.enabled : true,
          quality: data.quality || '1080p',
          debug: data.debug !== undefined ? data.debug : true,
          attemptIntervalMs: data.attemptIntervalMs || 500,
          maxAttempts: data.maxAttempts || 60
        };
        sendConfigToPage(cfg);
      });
    }
    sendResponse({ status: 'ok' });
  });

})();
