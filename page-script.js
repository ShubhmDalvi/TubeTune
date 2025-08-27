// page-script.js (BASED ON WORKING TAMPERMONKEY VERSION)
(function() {
  'use strict';
  
  // CONFIG - will be updated by extension
  let config = {
    enabled: true,
    quality: "1080p",
    attemptIntervalMs: 500,
    maxAttempts: 60,
    debug: true
  };

  // Quality mapping
  const qualityMap = {
    "144p": "tiny",
    "240p": "small", 
    "360p": "medium",
    "480p": "large",
    "720p": "hd720",
    "1080p": "hd1080",
    "1440p": "hd1440", 
    "2160p": "hd2160",
    "2880p": "hd2880",
    "4320p": "hd4320",
    "highres": "highres"
  };

  // Quality ranking for fallback
  const RANK = {
    highres: 100,
    hd2880: 95,
    hd2160: 90,
    hd1440: 85,
    hd1080: 80,
    hd720: 70,
    large: 60,
    medium: 50,
    small: 40,
    tiny: 30,
    auto: 20
  };

  // State tracking
  let manualQualityOverrides = new Map();
  let currentVideoId = null;
  let lastKnownQuality = null;
  let isScriptSetting = false;
  let qualityMonitorInterval = null;
  let hasSetInitialQuality = false;

  function log(...args) {
    if (config.debug) console.log('[TubeTune]', ...args);
  }

  function rankOf(q) { 
    return RANK[q] || 0; 
  }

  function getCurrentVideoId() {
    const url = new URL(window.location.href);
    
    // Regular YouTube URLs
    if (url.pathname === '/watch') {
      return url.searchParams.get('v');
    } else if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    } else if (url.pathname.startsWith('/embed/')) {
      return url.pathname.split('/')[2];
    } else if (url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2];
    }
    
    return null;
  }

  function chooseQuality(available, videoId) {
    if (!available || available.length === 0) return null;

    // Check if user has manually set quality for this video
    if (videoId && manualQualityOverrides.has(videoId)) {
      const manualQuality = manualQualityOverrides.get(videoId);
      if (available.includes(manualQuality)) {
        log(`Using manual override for video ${videoId}: ${manualQuality}`);
        return manualQuality;
      } else {
        // Manual quality no longer available, remove override
        manualQualityOverrides.delete(videoId);
        log(`Manual quality ${manualQuality} no longer available for video ${videoId}, removed override`);
      }
    }

    // Get target quality from config
    const targetQuality = qualityMap[config.quality] || 'hd1080';
    
    // If target is present, use it
    if (available.includes(targetQuality)) return targetQuality;
    
    // Otherwise pick the highest ranked available
    const sorted = available.slice().sort((a, b) => rankOf(b) - rankOf(a));
    return sorted[0] || null;
  }

  function setPlayerQuality(player, quality) {
    try {
      if (!player || !quality) return false;

      log('Attempting to set quality on player to:', quality);
      isScriptSetting = true;

      let success = false;

      if (typeof player.setPlaybackQualityRange === 'function') {
        try {
          player.setPlaybackQualityRange(quality, quality);
          success = true;
          log('setPlaybackQualityRange succeeded');
        } catch (e) {
          log('setPlaybackQualityRange failed', e);
        }
      }

      if (typeof player.setPlaybackQuality === 'function') {
        try {
          player.setPlaybackQuality(quality);
          success = true;
          log('setPlaybackQuality succeeded');
        } catch (e) {
          log('setPlaybackQuality failed', e);
        }
      }

      if (success) {
        lastKnownQuality = quality;
        // Reset flag after delay to allow YouTube to process the change
        setTimeout(() => {
          isScriptSetting = false;
        }, 2000);
      } else {
        isScriptSetting = false;
      }

      return success;
    } catch (e) {
      log('setPlayerQuality exception', e);
      isScriptSetting = false;
      return false;
    }
  }

  function getCurrentQuality(player) {
    if (!player) return null;

    try {
      if (typeof player.getPlaybackQuality === 'function') {
        return player.getPlaybackQuality();
      }
    } catch (e) {
      log('Error getting current quality:', e);
    }

    return null;
  }

  function findPlayer() {
    // Try multiple selectors for different YouTube versions
    const selectors = [
      '#movie_player',
      '.html5-video-player',
      '#player',
      '.ytd-player'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && typeof element.getAvailableQualityLevels === 'function') {
        log('Found player element with selector:', selector);
        return element;
      }
    }

    // Also try to find video element and work backwards
    const video = document.querySelector('video');
    if (video) {
      let parent = video.parentElement;
      while (parent && parent !== document.body) {
        if (typeof parent.getAvailableQualityLevels === 'function') {
          log('Found player with quality methods via video parent');
          return parent;
        }
        parent = parent.parentElement;
      }
    }

    return null;
  }

  // Enhanced quality monitoring
  function startQualityMonitoring() {
    if (qualityMonitorInterval) {
      clearInterval(qualityMonitorInterval);
    }

    qualityMonitorInterval = setInterval(() => {
      if (isScriptSetting) return; // Skip if we're currently setting quality

      const player = findPlayer();
      const videoId = getCurrentVideoId();

      if (!player || !videoId) return;

      const currentQuality = getCurrentQuality(player);

      if (currentQuality && currentQuality !== lastKnownQuality) {
        log(`Quality change detected: ${lastKnownQuality} -> ${currentQuality}`);

        // If we've already set the initial quality for this video,
        // and the quality changed, it's likely a manual change
        if (hasSetInitialQuality && lastKnownQuality !== null) {
          log(`Manual quality change detected for video ${videoId}: ${currentQuality}`);
          manualQualityOverrides.set(videoId, currentQuality);
        }

        lastKnownQuality = currentQuality;
      }
    }, 1000); // Check every second
  }

  function tryApplyQuality() {
    if (!config.enabled) {
      log('Extension disabled, skipping quality setting');
      return null;
    }

    const player = findPlayer();
    if (!player) {
      log('no player element found');
      return null;
    }

    const videoId = getCurrentVideoId();
    log('Current video ID:', videoId);

    // Get available qualities
    let available = null;
    if (typeof player.getAvailableQualityLevels === 'function') {
      try {
        available = player.getAvailableQualityLevels();
        log('getAvailableQualityLevels returned:', available);
      } catch (e) {
        log('getAvailableQualityLevels failed:', e);
      }
    }

    if (!available || available.length === 0) {
      log('No available qualities found or empty array');
      return null;
    }

    const chosen = chooseQuality(available, videoId);
    if (!chosen) {
      log('No suitable quality chosen from available:', available);
      return null;
    }

    // Check if this video already has a manual override
    if (videoId && manualQualityOverrides.has(videoId)) {
      log(`Skipping auto-quality for video ${videoId} - has manual override: ${manualQualityOverrides.get(videoId)}`);
      return chosen; // Return the chosen quality but don't set it
    }

    log('attempting to set quality to', chosen);
    const success = setPlayerQuality(player, chosen);

    if (success) {
      hasSetInitialQuality = true;
      return chosen;
    } else {
      log('Failed to set quality');
      return null;
    }
  }

  async function waitAndSetQuality() {
    return new Promise((resolve) => {
      let attempts = 0;
      const id = setInterval(() => {
        attempts++;
        log(`Attempt ${attempts}/${config.maxAttempts}`);
        try {
          const result = tryApplyQuality();
          if (result) {
            log('quality set ->', result);
            clearInterval(id);
            resolve({ ok: true, quality: result });
          } else if (attempts >= config.maxAttempts) {
            log('max attempts reached, giving up for now');
            clearInterval(id);
            resolve({ ok: false });
          }
        } catch (e) {
          log('error in wait loop', e);
        }
      }, config.attemptIntervalMs);
    });
  }

  // Called when a navigation / new video is detected
  async function handleNavigation() {
    log('navigation detected, trying to set quality');

    // Update current video ID
    const newVideoId = getCurrentVideoId();
    if (newVideoId !== currentVideoId) {
      currentVideoId = newVideoId;
      lastKnownQuality = null;
      hasSetInitialQuality = false;
      log('New video detected:', currentVideoId);

      // Check if this video has a manual override
      if (manualQualityOverrides.has(currentVideoId)) {
        log(`Video ${currentVideoId} has manual override: ${manualQualityOverrides.get(currentVideoId)}`);
      }
    }

    // Start monitoring quality changes for this video
    startQualityMonitoring();

    // Slight delay to let YouTube attach player internals
    setTimeout(() => waitAndSetQuality().then(r => {
      if (!r.ok) log('initial attempts failed — will keep trying on video events');
    }), 150);
  }

  // Hook pushState/replaceState so SPA navigations fire an event
  (function patchHistoryEvents() {
    const _push = history.pushState;
    history.pushState = function () {
      const res = _push.apply(this, arguments);
      window.dispatchEvent(new Event('yt-navigate'));
      return res;
    };
    
    const _replace = history.replaceState;
    history.replaceState = function () {
      const res = _replace.apply(this, arguments);
      window.dispatchEvent(new Event('yt-navigate'));
      return res;
    };
    
    window.addEventListener('yt-navigate', () => {
      log('yt-navigate event');
      handleNavigation();
    });
    
    window.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('popstate', () => { 
      handleNavigation(); 
    });
  })();

  // Detect URL changes as fallback
  (function observeUrlChange() {
    let last = location.href;
    setInterval(() => {
      if (location.href !== last) {
        last = location.href;
        log('URL changed (poll):', location.href);
        handleNavigation();
      }
    }, 400);
  })();

  // Watch for video element insertion
  (function observeVideoInsertion() {
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          try {
            if (node && node.nodeType === 1) {
              if (node.tagName === 'VIDEO' || (node.querySelector && node.querySelector('video'))) {
                log('video element inserted');
                handleNavigation();
                return;
              }
            }
          } catch (e) { /* ignore */ }
        }
      }
    });
    mo.observe(document.documentElement || document.body, { 
      childList: true, 
      subtree: true 
    });
  })();

  // Attach to video events
  (function attachVideoEvents() {
    const tryAttach = () => {
      const v = document.querySelector('video');
      if (v && !v.hasAttribute('data-tunetune-attached')) {
        v.setAttribute('data-tunetune-attached', 'true');
        
        v.addEventListener('loadedmetadata', () => {
          log('video loadedmetadata event fired');
          setTimeout(() => waitAndSetQuality(), 300);
        });

        v.addEventListener('canplay', () => {
          log('video canplay event fired');
          setTimeout(() => waitAndSetQuality(), 100);
        });
      }
    };
    // Try every second to attach
    setInterval(tryAttach, 1000);
  })();

  // Listen for extension config updates
  window.addEventListener("message", (event) => {
    if (!event.data || event.source !== window) return;
    
    if (event.data.source === "yt-quality-extension" && event.data.action === "init") {
      const oldEnabled = config.enabled;
      const oldQuality = config.quality;
      
      config = Object.assign(config, event.data.config || {});
      log('Config updated:', config);
      
      // If extension was enabled or quality changed, restart process
      if (config.enabled && (!oldEnabled || oldQuality !== config.quality)) {
        // Clear manual overrides when quality setting changes
        if (oldQuality !== config.quality) {
          manualQualityOverrides.clear();
          log('Quality setting changed, cleared manual overrides');
        }
        setTimeout(handleNavigation, 500);
      }
    }
  });

  // Initialize
  log('TubeTune script initialized');
  handleNavigation();

})();