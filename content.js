// Content script for Vivid Dark - Fixed to work properly
let currentTheme = 'ember';
let isEnabled = true;
let styleElement = null;
let transitionTimeout = null;

// Color profiles
const themes = {
  ember: {
    accent: '#FF4500',
    accentHover: '#FF6347',
    accentLight: '#FF450033'
  },
  gold: {
    accent: '#FFD700',
    accentHover: '#FFE44D',
    accentLight: '#FFD70033'
  },
  pulse: {
    accent: '#DC143C',
    accentHover: '#FF1744',
    accentLight: '#DC143C33'
  },
  neon: {
    accent: '#9B59B6',
    accentHover: '#BB6BD9',
    accentLight: '#9B59B633'
  },
  frost: {
    accent: '#00BFFF',
    accentHover: '#44D4FF',
    accentLight: '#00BFFF33'
  }
};

// Inject CSS with transition for smooth updates
function injectStyles(theme) {
  const themeColors = themes[theme];
  if (!themeColors) return;
  
  const css = `
    /* Vivid Dark Core Styles */
    :root {
      --vivid-bg: #000000;
      --vivid-bg-secondary: #080808;
      --vivid-bg-tertiary: #111111;
      --vivid-text-primary: #E8E8E8;
      --vivid-text-secondary: #B0B0B0;
      --vivid-text-tertiary: #808080;
      --vivid-accent: ${themeColors.accent};
      --vivid-accent-hover: ${themeColors.accentHover};
      --vivid-accent-light: ${themeColors.accentLight};
      --vivid-border: #1A1A1A;
      --vivid-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Force black background on everything */
    html, body, * {
      background-color: var(--vivid-bg) !important;
    }
    
    /* But allow specific elements to have their own backgrounds */
    div, section, article, aside, header, footer, nav, main,
    .container, .wrapper, .box, .card, .panel {
      background-color: var(--vivid-bg-secondary) !important;
    }

    /* Text colors */
    body, p, span, li, h1, h2, h3, h4, h5, h6, 
    .text, .title, .description, .content, label {
      color: var(--vivid-text-primary) !important;
    }

    /* Secondary text */
    small, .small, .secondary, .subtitle, .meta, .date, .caption {
      color: var(--vivid-text-secondary) !important;
    }

    /* Input fields */
    input, textarea, select, .input, .textarea {
      background-color: var(--vivid-bg-tertiary) !important;
      color: var(--vivid-text-primary) !important;
      border-color: var(--vivid-border) !important;
    }

    input:focus, textarea:focus, select:focus {
      border-color: var(--vivid-accent) !important;
      outline: none !important;
      box-shadow: 0 0 0 2px var(--vivid-accent-light) !important;
    }

    /* Links */
    a, .link {
      color: var(--vivid-accent) !important;
      transition: var(--vivid-transition) !important;
      text-decoration: none !important;
    }

    a:hover, .link:hover {
      color: var(--vivid-accent-hover) !important;
      text-decoration: underline !important;
    }

    /* Buttons */
    button, .button, .btn, [role="button"], input[type="submit"], 
    input[type="button"], .action-button {
      background-color: var(--vivid-accent) !important;
      color: #000000 !important;
      border: none !important;
      transition: var(--vivid-transition) !important;
    }

    button:hover, .button:hover, .btn:hover {
      background-color: var(--vivid-accent-hover) !important;
      transform: translateY(-1px) !important;
    }

    /* Sliders */
    input[type="range"] {
      -webkit-appearance: none !important;
      background: var(--vivid-bg-tertiary) !important;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none !important;
      width: 16px !important;
      height: 16px !important;
      border-radius: 50% !important;
      background: var(--vivid-accent) !important;
      cursor: pointer !important;
    }

    /* Active tabs */
    .tab.active, [role="tab"][aria-selected="true"], .nav-link.active {
      color: var(--vivid-accent) !important;
      border-bottom-color: var(--vivid-accent) !important;
    }

    /* Checkboxes and radio buttons */
    input[type="checkbox"], input[type="radio"] {
      accent-color: var(--vivid-accent) !important;
    }

    /* Selection highlight */
    ::selection {
      background: var(--vivid-accent-light) !important;
      color: var(--vivid-text-primary) !important;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 10px !important;
      height: 10px !important;
    }

    ::-webkit-scrollbar-track {
      background: var(--vivid-bg-tertiary) !important;
    }

    ::-webkit-scrollbar-thumb {
      background: var(--vivid-accent) !important;
      border-radius: 5px !important;
    }

    /* Protect images and videos */
    img, video, canvas, iframe, [data-vivid-protect="true"] {
      background: transparent !important;
      filter: none !important;
    }

    /* Code blocks */
    pre, code, .code {
      background-color: var(--vivid-bg-tertiary) !important;
      color: var(--vivid-accent) !important;
    }

    /* Tables */
    table, .table {
      background-color: var(--vivid-bg-secondary) !important;
    }

    th, td {
      border-color: var(--vivid-border) !important;
      color: var(--vivid-text-primary) !important;
    }
  `;
  
  if (styleElement) {
    // Apply transition for smooth cross-fade
    document.documentElement.classList.add('vivid-transitioning');
    styleElement.textContent = css;
    
    if (transitionTimeout) clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(() => {
      document.documentElement.classList.remove('vivid-transitioning');
    }, 300);
  } else {
    styleElement = document.createElement('style');
    styleElement.id = 'vivid-dark-styles';
    styleElement.textContent = css;
    document.documentElement.appendChild(styleElement);
  }
}

// Remove injected styles
function removeStyles() {
  if (styleElement) {
    document.documentElement.classList.add('vivid-transitioning');
    styleElement.remove();
    styleElement = null;
    
    if (transitionTimeout) clearTimeout(transitionTimeout);
    transitionTimeout = setTimeout(() => {
      document.documentElement.classList.remove('vivid-transitioning');
    }, 300);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'UPDATE_THEME') {
    isEnabled = request.enabled;
    
    if (isEnabled) {
      currentTheme = request.theme;
      injectStyles(currentTheme);
    } else {
      removeStyles();
    }
    
    sendResponse({ success: true });
  }
  return true;
});

// Initialize from storage
chrome.storage.local.get(['vividEnabled', 'vividTheme'], (result) => {
  isEnabled = result.vividEnabled !== false;
  currentTheme = result.vividTheme || 'ember';
  
  if (isEnabled) {
    injectStyles(currentTheme);
  }
});

// Add transition CSS
const transitionStyle = document.createElement('style');
transitionStyle.textContent = `
  .vivid-transitioning * {
    transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease !important;
  }
`;
document.documentElement.appendChild(transitionStyle);