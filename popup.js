(function () {
  'use strict';

  const QUALITY_OPTIONS = [
    { value: '144p', label: '144p' },
    { value: '240p', label: '240p' },
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p', hint: 'HD' },
    { value: '1080p', label: '1080p', hint: 'Full HD' },
    { value: '1440p', label: '1440p', hint: '2K' },
    { value: '2160p', label: '2160p', hint: '4K' },
    { value: '2880p', label: '2880p', hint: '5K' },
    { value: '4320p', label: '4320p', hint: '8K' },
    { value: 'highres', label: 'Highest Available', hint: 'Auto' }
  ];

  const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'];

  const toggle = document.getElementById('extension-toggle');
  const trigger = document.getElementById('quality-trigger');
  const qualityValue = document.getElementById('quality-value');
  const menu = document.getElementById('quality-menu');
  const dropdown = document.getElementById('dropdown');
  const statusToast = document.getElementById('status-message');

  let currentQuality = '1080p';
  let toastTimer = null;

  function isYouTubeUrl(url) {
    if (!url || typeof url !== 'string') return false;
    try {
      const host = new URL(url).hostname.toLowerCase();
      return YOUTUBE_HOSTS.includes(host);
    } catch (e) {
      return false;
    }
  }

  function notifyContentScript(action, payload) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0] || !isYouTubeUrl(tabs[0].url)) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: action, ...payload });
    });
  }

  function renderMenu() {
    menu.innerHTML = '';

    QUALITY_OPTIONS.forEach(function (opt) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'option';
      button.dataset.value = opt.value;
      button.setAttribute('role', 'option');
      button.setAttribute('aria-selected', String(opt.value === currentQuality));

      const name = document.createElement('span');
      name.className = 'option-name';
      const label = document.createElement('span');
      label.textContent = opt.label;
      name.appendChild(label);
      if (opt.hint) {
        const hint = document.createElement('span');
        hint.className = 'option-hint';
        hint.textContent = opt.hint;
        name.appendChild(hint);
      }

      const check = document.createElement('svg');
      check.className = 'check';
      check.setAttribute('viewBox', '0 0 24 24');
      check.setAttribute('fill', 'none');
      check.setAttribute('stroke', 'currentColor');
      check.setAttribute('stroke-width', '2.4');
      check.setAttribute('stroke-linecap', 'round');
      check.setAttribute('stroke-linejoin', 'round');
      check.setAttribute('aria-hidden', 'true');
      const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      polyline.setAttribute('points', '20 6 9 17 4 12');
      check.appendChild(polyline);

      button.appendChild(name);
      button.appendChild(check);

      if (opt.value === currentQuality) button.classList.add('selected');

      button.addEventListener('click', function () {
        selectQuality(opt.value);
      });

      menu.appendChild(button);
    });
  }

  function setDropdownOpen(open) {
    dropdown.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }

  function renderSelection(value) {
    currentQuality = value;
    qualityValue.textContent = value === 'highres' ? 'Highest Available' : value;

    QUALITY_OPTIONS.forEach(function (opt) {
      const el = menu.querySelector('[data-value="' + opt.value + '"]');
      if (el) {
        el.classList.toggle('selected', opt.value === value);
        el.setAttribute('aria-selected', String(opt.value === value));
      }
    });
  }

  function selectQuality(value) {
    renderSelection(value);
    setDropdownOpen(false);

    chrome.storage.sync.set({ quality: value }, function () {
      showToast('Quality set to ' + (value === 'highres' ? 'highest available' : value));
      notifyContentScript('updateQuality', { quality: value });
    });
  }

  function showToast(message) {
    statusToast.textContent = message;
    statusToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      statusToast.classList.remove('show');
    }, 2000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderMenu();

    // Determine whether the active tab is YouTube / YouTube Music.
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const valid = isYouTubeUrl(tab && tab.url);
      document.body.classList.toggle('site-valid', valid);
      document.body.classList.toggle('site-invalid', !valid);
    });

    // Load saved settings.
    chrome.storage.sync.get(['enabled', 'quality'], function (data) {
      toggle.checked = data.enabled !== false;
      if (data.quality && QUALITY_OPTIONS.some(function (o) { return o.value === data.quality; })) {
        renderSelection(data.quality);
      }
    });

    // Toggle extension on/off.
    toggle.addEventListener('change', function () {
      const enabled = toggle.checked;
      chrome.storage.sync.set({ enabled: enabled }, function () {
        showToast(enabled ? 'Extension enabled' : 'Extension disabled');
        notifyContentScript('toggleExtension', { enabled: enabled });
      });
    });

    // Dropdown open/close.
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      setDropdownOpen(!dropdown.classList.contains('open'));
    });

    document.addEventListener('click', function (e) {
      if (!dropdown.contains(e.target)) setDropdownOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    });
  });
})();
