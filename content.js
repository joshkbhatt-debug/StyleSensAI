// StyleSensAI Content Script
// Injects the SensAI widget into web pages for text transformation

let widget = null;
let selectionIndicator = null;
let selectedText = '';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  console.log('StyleSensAI content script loaded');
  
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showWidget') {
      showWidget(request.text);
    } else if (request.action === 'toggleWidget') {
      if (widget && widget.style.display !== 'none') {
        hideWidget();
      } else {
        showWidget(selectedText);
      }
    }
  });
}

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText = text;
    showSelectionIndicator();
  } else {
    hideSelectionIndicator();
  }
}

// Show selection indicator (small StyleSensAI icon)
function showSelectionIndicator() {
  if (selectionIndicator) {
    selectionIndicator.style.display = 'block';
    return;
  }
  
  selectionIndicator = document.createElement('div');
  selectionIndicator.className = 'stylesensai-selection-indicator';
  selectionIndicator.innerHTML = `
    <div class="indicator-content">
      <span class="indicator-text">SA</span>
    </div>
  `;
  
  document.body.appendChild(selectionIndicator);
  
  // Position near selection
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    selectionIndicator.style.left = `${rect.right + window.scrollX + 10}px`;
    selectionIndicator.style.top = `${rect.top + window.scrollY - 10}px`;
  }
  
  // Add click handler
  selectionIndicator.addEventListener('click', () => {
    showWidget(selectedText);
  });
}

function hideSelectionIndicator() {
  if (selectionIndicator) {
    selectionIndicator.style.display = 'none';
  }
}

function showWidget(text) {
  if (widget) {
    widget.style.display = 'block';
    return;
  }
  
  widget = document.createElement('div');
  widget.className = 'stylesensai-widget';
  widget.innerHTML = `
    <div class="stylesensai-widget-container">
      <div class="widget-header">
        <div class="widget-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14 8H22L16 12L18 20L12 16L6 20L8 12L2 8H10L12 2Z" fill="#3B82F6"/>
          </svg>
          <span>SensAI</span>
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
        
        <div class="widget-actions">
          <button class="transform-btn" id="transform-btn">Transform Text</button>
        </div>
        
        <div class="loading-section" style="display: none;">
          <div class="loading-spinner"></div>
          <span>SensAI is working...</span>
        </div>
        
        <div class="result-section" style="display: none;">
          <label>Improved Text:</label>
          <div class="improved-text" id="improved-text"></div>
          <button class="replace-btn" id="replace-btn">Replace Selection</button>
          <button class="copy-btn" id="copy-btn">Copy to Clipboard</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(widget);
  
  // Add event listeners
  widget.querySelector('.widget-close').addEventListener('click', hideWidget);
  widget.querySelector('#transform-btn').addEventListener('click', handleTransform);
  widget.querySelector('#replace-btn').addEventListener('click', replaceSelection);
  widget.querySelector('#copy-btn').addEventListener('click', copyToClipboard);
  
  // Position widget
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    widget.style.left = `${rect.left + window.scrollX}px`;
    widget.style.top = `${rect.bottom + window.scrollY + 10}px`;
  }
}

function hideWidget() {
  if (widget) {
    widget.style.display = 'none';
  }
  hideSelectionIndicator();
}

async function handleTransform() {
  const tone = widget.querySelector('#tone-select').value;
  const actionBtn = widget.querySelector('.action-btn.selected');
  
  if (!actionBtn) {
    alert('Please select an action first');
    return;
  }
  
  const action = actionBtn.dataset.action;
  const text = widget.querySelector('.original-text').textContent;
  
  // Show loading
  widget.querySelector('.loading-section').style.display = 'block';
  widget.querySelector('.widget-actions').style.display = 'none';
  
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'transformText',
      text: text,
      tone: tone,
      action: action
    });
    
    if (response.success) {
      widget.querySelector('#improved-text').textContent = response.data.correctedText;
      widget.querySelector('.result-section').style.display = 'block';
    } else {
      alert(`Error: ${response.error}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  } finally {
    widget.querySelector('.loading-section').style.display = 'none';
  }
}

function replaceSelection() {
  const improvedText = widget.querySelector('#improved-text').textContent;
  const selection = window.getSelection();
  
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(improvedText));
  }
  
  hideWidget();
}

function copyToClipboard() {
  const improvedText = widget.querySelector('#improved-text').textContent;
  navigator.clipboard.writeText(improvedText).then(() => {
    alert('Text copied to clipboard!');
  });
}

// Add action button selection
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('action-btn')) {
    widget.querySelectorAll('.action-btn').forEach(btn => btn.classList.remove('selected'));
    e.target.classList.add('selected');
  }
}); 