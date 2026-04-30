// Popup controller for Vivid Dark
let currentTheme = 'ember';
let isEnabled = true;

// DOM elements
const toggleSwitch = document.getElementById('vividToggle');
const themeCards = document.querySelectorAll('.theme-card');

// Load settings from storage
async function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['vividEnabled', 'vividTheme'], (result) => {
      isEnabled = result.vividEnabled !== false;
      currentTheme = result.vividTheme || 'ember';
      resolve();
    });
  });
}

// Update UI based on settings
function updateUI() {
  toggleSwitch.checked = isEnabled;
  
  themeCards.forEach(card => {
    const theme = card.getAttribute('data-theme');
    if (theme === currentTheme) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

// Apply theme to all tabs
async function applyThemeToAllTabs(theme, enabled) {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.url && !tab.url.startsWith('chrome://')) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_THEME',
          theme: theme,
          enabled: enabled
        });
      } catch (error) {
        // Content script not injected yet, ignore
      }
    }
  }
}

// Save settings to storage
async function saveSettings() {
  chrome.storage.local.set({
    vividEnabled: isEnabled,
    vividTheme: currentTheme
  });
}

// Toggle event handler
toggleSwitch.addEventListener('change', async (e) => {
  isEnabled = e.target.checked;
  await saveSettings();
  await applyThemeToAllTabs(currentTheme, isEnabled);
  updateUI();
});

// Theme selection handler
themeCards.forEach(card => {
  card.addEventListener('click', async () => {
    const theme = card.getAttribute('data-theme');
    if (theme === currentTheme) return;
    
    currentTheme = theme;
    await saveSettings();
    
    if (isEnabled) {
      await applyThemeToAllTabs(currentTheme, true);
    }
    
    updateUI();
    
    // Add haptic feedback animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = '';
    }, 150);
  });
});

// Initialize popup
async function init() {
  await loadSettings();
  updateUI();
}

// Remove the problematic domain code - popup stays open until user closes it
init();
// Add close button functionality
const closeButton = document.getElementById('closePopup');
if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.close();
  });
}