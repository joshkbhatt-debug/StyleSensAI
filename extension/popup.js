// StyleSensAI Popup Script
// Handles settings persistence and user interactions

document.addEventListener('DOMContentLoaded', function() {
    // Load saved settings
    loadSettings();
    
    // Add event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Tone selector
    const toneSelect = document.getElementById('default-tone');
    toneSelect.addEventListener('change', function() {
        saveSettings();
    });
    
    // Action buttons
    const actionBtns = document.querySelectorAll('.action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all buttons
            actionBtns.forEach(b => b.classList.remove('selected'));
            // Add selected class to clicked button
            this.classList.add('selected');
            saveSettings();
        });
    });
}

function loadSettings() {
    chrome.storage.sync.get({
        defaultTone: 'confident',
        defaultAction: 'rewrite_with_tone'
    }, function(items) {
        // Set tone selector
        const toneSelect = document.getElementById('default-tone');
        toneSelect.value = items.defaultTone;
        
        // Set action button
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.action === items.defaultAction) {
                btn.classList.add('selected');
            }
        });
    });
}

function saveSettings() {
    const toneSelect = document.getElementById('default-tone');
    const selectedActionBtn = document.querySelector('.action-btn.selected');
    
    const settings = {
        defaultTone: toneSelect.value,
        defaultAction: selectedActionBtn ? selectedActionBtn.dataset.action : 'rewrite_with_tone'
    };
    
    chrome.storage.sync.set(settings, function() {
        showStatus('Settings saved successfully!', 'success');
        
        // Also save to local storage for content script access
        chrome.storage.local.set(settings);
    });
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Send settings to content script when popup opens
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateSettings',
            settings: {
                defaultTone: document.getElementById('default-tone').value,
                defaultAction: document.querySelector('.action-btn.selected')?.dataset.action || 'rewrite_with_tone'
            }
        });
    }
}); 