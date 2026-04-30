// Background service worker for Vivid Dark extension
chrome.runtime.onInstalled.addListener(() => {
  // Initialize default settings
  chrome.storage.local.get(['vividEnabled', 'vividTheme'], (result) => {
    if (result.vividEnabled === undefined) {
      chrome.storage.local.set({ 
        vividEnabled: true,
        vividTheme: 'ember'
      });
    }
  });
});

// Listen for tab updates to ensure theme persistence
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
    chrome.storage.local.get(['vividEnabled', 'vividTheme'], (settings) => {
      if (settings.vividEnabled) {
        chrome.tabs.sendMessage(tabId, {
          type: 'UPDATE_THEME',
          theme: settings.vividTheme,
          enabled: true
        }).catch(() => {
          // Content script not ready yet
        });
      }
    });
  }
});