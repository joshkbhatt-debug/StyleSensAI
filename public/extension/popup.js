// StyleSensAI Chrome Extension Popup Script
// This script calls our secure API - no API keys needed!

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('analysisForm');
  const submitBtn = document.getElementById('submitBtn');
  const loading = document.getElementById('loading');
  const result = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const error = document.getElementById('error');
  const copyBtn = document.getElementById('copyBtn');

  // TODO: Update this URL to your production domain when deployed
  const API_BASE_URL = 'http://localhost:3000';

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const style = document.getElementById('style').value;
    const text = document.getElementById('text').value;

    if (!style || !text.trim()) {
      showError('Please fill in all fields');
      return;
    }

    // Show loading state
    setLoading(true);
    hideError();
    hideResult();

    try {
      const response = await fetch(`${API_BASE_URL}/api/analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          style: style
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Show result
      resultText.textContent = data.correctedText;
      showResult();
      
    } catch (err) {
      console.error('Error:', err);
      showError('Failed to improve text. Please try again.');
    } finally {
      setLoading(false);
    }
  });

  copyBtn.addEventListener('click', function() {
    const text = resultText.textContent;
    if (text) {
      navigator.clipboard.writeText(text).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.textContent = 'Copy to Clipboard';
        }, 2000);
      }).catch(function(err) {
        console.error('Failed to copy text: ', err);
        showError('Failed to copy text to clipboard');
      });
    }
  });

  function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    loading.style.display = isLoading ? 'block' : 'none';
  }

  function showResult() {
    result.style.display = 'block';
  }

  function hideResult() {
    result.style.display = 'none';
  }

  function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
  }

  function hideError() {
    error.style.display = 'none';
  }

  // Auto-resize textarea
  const textarea = document.getElementById('text');
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
  });
}); 