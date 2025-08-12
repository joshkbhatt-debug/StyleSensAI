// StyleSensei Popup Script
// Handles extension settings and API key management

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('settingsForm');
  const apiKeyInput = document.getElementById('apiKey');
  const statusDiv = document.getElementById('status');

  // Load existing settings
  await loadSettings();

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveSettings();
  });

  // Load settings from storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['openaiApiKey']);
      if (result.openaiApiKey) {
        apiKeyInput.value = result.openaiApiKey;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showStatus('Error loading settings', 'error');
    }
  }

  // Save settings to storage
  async function saveSettings() {
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      showStatus('Please enter your OpenAI API key', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      showStatus('Invalid API key format. OpenAI keys start with "sk-"', 'error');
      return;
    }

    try {
      // Test the API key by making a simple request
      showStatus('Testing API key...', 'info');
      
      const testResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!testResponse.ok) {
        throw new Error('Invalid API key or network error');
      }

      // Save the API key if test succeeds
      await chrome.storage.sync.set({ openaiApiKey: apiKey });
      showStatus('Settings saved successfully! You can now use StyleSensei on any website.', 'success');
      
      // Close popup after a delay
      setTimeout(() => {
        window.close();
      }, 2000);

    } catch (error) {
      console.error('Error saving settings:', error);
      showStatus('Invalid API key. Please check and try again.', 'error');
    }
  }

  // Show status message
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
});

// Toggle password visibility
function togglePassword() {
  const apiKeyInput = document.getElementById('apiKey');
  const toggleBtn = document.querySelector('.toggle-password');
  
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleBtn.textContent = 'Hide';
  } else {
    apiKeyInput.type = 'password';
    toggleBtn.textContent = 'Show';
  }
} 