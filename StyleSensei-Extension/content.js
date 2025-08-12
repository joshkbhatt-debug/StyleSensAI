// StyleSensei Content Script
// Injects the Grammarly-like widget into web pages

let isWidgetInjected = false;
let selectedText = '';
let selectionRange = null;
let widget = null;

// Initialize the extension on page load
function init() {
  console.log('StyleSensei content script loaded');
  
  // Add text selection listener
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showWidget') {
      showWidget(request.text);
    } else if (request.action === 'toggleWidget') {
      toggleWidget();
    }
  });
}

// Handle text selection
function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText = text;
    selectionRange = selection.getRangeAt(0);
    showSelectionIndicator();
  } else {
    hideSelectionIndicator();
  }
}

// Show selection indicator (small StyleSensei icon)
function showSelectionIndicator() {
  hideSelectionIndicator(); // Remove any existing indicator
  
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const indicator = document.createElement('div');
  indicator.id = 'stylesensei-indicator';
  indicator.innerHTML = `
    <div class="stylesensei-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L14 8H22L16 12L18 20L12 16L6 20L8 12L2 8H10L12 2Z" fill="#3B82F6"/>
      </svg>
    </div>
  `;
  
  indicator.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 5}px;
    left: ${rect.left + window.scrollX}px;
    z-index: 10000;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  indicator.addEventListener('mouseenter', () => {
    indicator.style.transform = 'scale(1.1)';
  });
  
  indicator.addEventListener('mouseleave', () => {
    indicator.style.transform = 'scale(1)';
  });
  
  indicator.addEventListener('click', () => {
    showWidget(selectedText);
  });
  
  document.body.appendChild(indicator);
}

// Hide selection indicator
function hideSelectionIndicator() {
  const existing = document.getElementById('stylesensei-indicator');
  if (existing) {
    existing.remove();
  }
}

// Show the main widget
function showWidget(text = '') {
  if (widget) {
    widget.remove();
  }
  
  // Create widget container
  widget = document.createElement('div');
  widget.id = 'stylesensei-widget';
  widget.innerHTML = `
    <div class="stylesensei-widget-container">
      <div class="widget-header">
        <div class="widget-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 8H22L16 12L18 20L12 16L6 20L8 12L2 8H10L12 2Z" fill="#3B82F6"/>
          </svg>
          <span>Sensei</span>
        </div>
        <button class="widget-close">×</button>
      </div>
      
      <div class="widget-content">
        <div class="text-section">
          <label>Selected Text:</label>
          <div class="original-text">${text || selectedText}</div>
        </div>
        
        <div class="controls-section">
          <div class="tone-selector">
            <label>Choose Your Tone:</label>
            <select id="tone-select">
              <option value="confident">Confident</option>
              <option value="polite">Polite</option>
              <option value="friendly">Friendly</option>
              <option value="persuasive">Persuasive</option>
              <option value="academic">Academic</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          
          <div class="action-selector">
            <label>Choose Your Action:</label>
            <div class="action-buttons-grid">
              <button class="action-btn" data-action="rewrite_with_tone">Rewrite with Tone</button>
              <button class="action-btn" data-action="improve_clarity">Improve Clarity</button>
              <button class="action-btn" data-action="make_concise">Make Concise</button>
              <button class="action-btn" data-action="make_polite">Make Polite</button>
              <button class="action-btn" data-action="make_persuasive">Make Persuasive</button>
              <button class="action-btn" data-action="make_confident">Make Confident</button>
              <button class="action-btn" data-action="make_creative">Make Creative</button>
              <button class="action-btn" data-action="make_academic">Make Academic</button>
              <button class="action-btn" data-action="make_friendly">Make Friendly</button>
            </div>
          </div>
        </div>
        
        <div class="result-section" style="display: none;">
          <label>Transformed Text:</label>
          <div class="transformed-text"></div>
          <div class="action-buttons">
            <button class="copy-btn">Copy Result</button>
            <button class="replace-btn">Replace Original</button>
          </div>
        </div>
        
        <div class="loading-section" style="display: none;">
          <div class="loading-spinner"></div>
          <span>Sensei is working...</span>
        </div>
      </div>
    </div>
  `;
  
  // Add CSS
  widget.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Add event listeners
  setupWidgetEventListeners();
  
  document.body.appendChild(widget);
  hideSelectionIndicator();
}

// Setup widget event listeners
function setupWidgetEventListeners() {
  const closeBtn = widget.querySelector('.widget-close');
  const actionBtns = widget.querySelectorAll('.action-btn');
  const copyBtn = widget.querySelector('.copy-btn');
  const replaceBtn = widget.querySelector('.replace-btn');
  
  closeBtn.addEventListener('click', hideWidget);
  
  actionBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      const tone = widget.querySelector('#tone-select').value;
      const text = selectedText;
      
      await transformText(text, action, tone);
    });
  });
  
  copyBtn.addEventListener('click', copyTransformedText);
  replaceBtn.addEventListener('click', replaceOriginalText);
}

// Transform text using AI
async function transformText(text, action, tone) {
  const loadingSection = widget.querySelector('.loading-section');
  const resultSection = widget.querySelector('.result-section');
  
  // Show loading
  loadingSection.style.display = 'block';
  resultSection.style.display = 'none';
  
  try {
    // Send message to background script for API call
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'transformText',
        text: text,
        action: action,
        tone: tone
      }, resolve);
    });
    
    if (response.success) {
      // Show result
      const transformedTextDiv = widget.querySelector('.transformed-text');
      transformedTextDiv.textContent = response.data.correctedText;
      
      loadingSection.style.display = 'none';
      resultSection.style.display = 'block';
    } else {
      throw new Error(response.error);
    }
  } catch (error) {
    console.error('Transformation error:', error);
    alert('Error transforming text: ' + error.message);
    loadingSection.style.display = 'none';
  }
}

// Copy transformed text to clipboard
async function copyTransformedText() {
  const transformedText = widget.querySelector('.transformed-text').textContent;
  try {
    await navigator.clipboard.writeText(transformedText);
    
    // Show success feedback
    const copyBtn = widget.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#10B981';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    alert('Failed to copy text');
  }
}

// Replace original text with transformed text
function replaceOriginalText() {
  if (!selectionRange) {
    alert('Original text selection lost. Please copy the text manually.');
    return;
  }
  
  const transformedText = widget.querySelector('.transformed-text').textContent;
  
  try {
    // Clear current selection
    window.getSelection().removeAllRanges();
    
    // Add back the original range
    window.getSelection().addRange(selectionRange);
    
    // Replace the selected text
    if (document.execCommand) {
      document.execCommand('insertText', false, transformedText);
    } else {
      // Fallback for newer browsers
      selectionRange.deleteContents();
      selectionRange.insertNode(document.createTextNode(transformedText));
    }
    
    hideWidget();
    
    // Show success feedback
    const notification = document.createElement('div');
    notification.textContent = 'Text replaced successfully!';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10002;
      font-family: system-ui;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  } catch (error) {
    console.error('Replace failed:', error);
    alert('Failed to replace text. Please copy manually.');
  }
}

// Hide widget
function hideWidget() {
  if (widget) {
    widget.remove();
    widget = null;
  }
}

// Toggle widget visibility
function toggleWidget() {
  if (widget) {
    hideWidget();
  } else {
    showWidget();
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 