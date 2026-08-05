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

  function buildConfig(data) {
    return {
      enabled: data.enabled !== undefined ? data.enabled : true,
      quality: data.quality || '1080p',
      debug: data.debug !== undefined ? data.debug : true,
      attemptIntervalMs: data.attemptIntervalMs || 500,
      maxAttempts: data.maxAttempts || 60
    };
  }

  // page-script.js loads asynchronously (it's fetched as an external script),
  // so it may not be listening yet the moment we finish reading storage.
  // postMessage is fire-and-forget — if we send before it's listening, the
  // message is lost and the page script silently keeps its hardcoded 1080p
  // default. So we hold onto the config until the page script tells us it's
  // ready, then deliver it.
  let pendingConfig = null;
  let pageReady = false;

  function trySendPendingConfig() {
    if (pageReady && pendingConfig) {
      sendConfigToPage(pendingConfig);
    }
  }

  window.addEventListener('message', (event) => {
    if (!event.data || event.source !== window) return;
    if (event.data.source === 'yt-quality-page-script' && event.data.action === 'ready') {
      pageReady = true;
      trySendPendingConfig();
    }
  });

  // Load settings from storage; deliver as soon as the page script is ready
  chrome.storage.sync.get(['enabled', 'quality', 'debug', 'attemptIntervalMs', 'maxAttempts'], function(data) {
    pendingConfig = buildConfig(data);
    trySendPendingConfig();
  });

  // When popup updates settings, reload config and send to page script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggleExtension' || request.action === 'updateQuality') {
      chrome.storage.sync.get(['enabled', 'quality', 'debug', 'attemptIntervalMs', 'maxAttempts'], function(data) {
        pendingConfig = buildConfig(data);
        trySendPendingConfig();
      });
    }
    sendResponse({ status: 'ok' });
  });

})();