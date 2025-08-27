document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('extension-toggle');
  const qualitySelect = document.getElementById('quality-select');
  const statusMessage = document.getElementById('status-message');

  // Load saved settings
  chrome.storage.sync.get(['enabled', 'quality'], function(data) {
    toggle.checked = data.enabled !== false; // default to enabled
    qualitySelect.value = data.quality || '1080p';
  });

  // Save enabled/disabled state
  toggle.addEventListener('change', function() {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ enabled }, function() {
      showStatus(enabled ? 'Extension enabled' : 'Extension disabled');
      
      // Send message to content script to update its state
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggleExtension',
            enabled: enabled
          });
        }
      });
    });
  });

  // Save quality preference
  qualitySelect.addEventListener('change', function() {
    const quality = qualitySelect.value;
    chrome.storage.sync.set({ quality }, function() {
      showStatus(`Quality set to ${quality}`);
      
      // Send message to content script to update quality
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateQuality',
            quality: quality
          });
        }
      });
    });
  });

  function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.classList.toggle('error', isError);
    statusMessage.classList.add('show');
    
    setTimeout(() => {
      statusMessage.classList.remove('show');
    }, 2000);
  }
});