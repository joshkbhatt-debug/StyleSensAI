// StyleSensei Background Service Worker
// Handles API calls through your backend service

// Your backend API endpoint (update this when you deploy)
const API_BASE_URL = 'http://localhost:3002/api'; // Will be your production URL

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('StyleSensei extension installed');
  
  // Create context menu for selected text
  chrome.contextMenus.create({
    id: 'stylesensei-transform',
    title: 'Transform with StyleSensei',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'stylesensei-transform' && info.selectionText) {
    // Send selected text to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'showWidget',
      text: info.selectionText
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'transformText') {
    handleTextTransformation(request, sendResponse);
    return true; // Keep the message channel open for async response
  }
});

// Handle text transformation API calls through your backend
async function handleTextTransformation(request, sendResponse) {
  try {
    const { text, action, tone } = request;
    
    // Call your own backend API (no API key needed from users!)
    const response = await fetch(`${API_BASE_URL}/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        action: action,
        tone: tone
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    sendResponse({
      success: true,
      data: {
        correctedText: data.correctedText,
        suggestions: data.suggestions || []
      }
    });
  } catch (error) {
    console.error('Text transformation error:', error);
    sendResponse({
      success: false,
      error: `Sensei encountered an issue: ${error.message}`
    });
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send message to content script to toggle widget
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleWidget'
  });
}); 