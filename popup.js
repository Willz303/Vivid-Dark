// Popup controller for Vivid Dark

let currentTheme = 'ember';
let isEnabled = true;

// DOM elements
const toggleSwitch = document.getElementById('vividToggle');
const themeCards = document.querySelectorAll('.theme-card');
const statValues = document.querySelectorAll('.stat-value');

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
  // Update toggle
  toggleSwitch.checked = isEnabled;
  
  // Update active theme card
  themeCards.forEach(card => {
    const theme = card.getAttribute('data-theme');
    if (theme === currentTheme) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  
  // Update stat colors based on theme
  const themeColors = {
    ember: '#FF4500',
    gold: '#FFD700',
    pulse: '#DC143C',
    neon: '#9B59B6',
    frost: '#00BFFF'
  };
  
  statValues.forEach(stat => {
    stat.style.background = `linear-gradient(135deg, ${themeColors[currentTheme]}, ${themeColors[currentTheme]}CC)`;
    stat.style.webkitBackgroundClip = 'text';
    stat.style.backgroundClip = 'text';
    stat.style.color = 'transparent';
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
  
  // Get current tab info for stats
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url) {
    const url = new URL(tab.url);
    const domain = url.hostname;
    document.querySelector('.stat-value:last-child').textContent = domain.split('.')[0];
  }
}

init();