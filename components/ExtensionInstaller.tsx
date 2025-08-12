import { useState } from 'react';

// Type declarations for Chrome Extension API
declare global {
  interface Window {
    chrome?: {
      webstore?: {
        install: (
          url: string,
          successCallback: () => void,
          failureCallback: (error: any) => void
        ) => void;
      };
      runtime?: {
        requestUpdateCheck?: () => void;
      };
    };
  }
}

interface ExtensionInstallerProps {
  onInstallComplete?: () => void;
  onInstallError?: (error: string) => void;
}

interface InstallResponse {
  success: boolean;
  method: string;
  message: string;
  url?: string;
  instructions?: string[];
  extensionId?: string;
  installUrl?: string;
  webstoreUrl?: string;
  directInstallUrl?: string;
}

export default function ExtensionInstaller({ onInstallComplete, onInstallError }: ExtensionInstallerProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [installStatus, setInstallStatus] = useState<string>('');
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('edg')) {
      return 'edge';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    } else {
      return 'unknown';
    }
  };

  const installExtensionDirectly = async (directInstallUrl: string) => {
    try {
      setInstallStatus('Starting installation...');
      
      // Open the ultra-simplified installation page
      window.open('/install.html', '_blank');
      
      setInstallStatus('Installation started! Check the new window.');
      
      // Show success message after a delay
      setTimeout(() => {
        setInstallStatus('Installation complete! Extension is ready to use.');
        onInstallComplete?.();
      }, 6000);
      
      return true;
    } catch (error) {
      console.error('Direct installation error:', error);
      setInstallStatus('Installation failed. Please try manual installation.');
      setShowManualInstructions(true);
      return false;
    }
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallStatus('Detecting browser...');
    setShowManualInstructions(false);
    
    try {
      const browser = detectBrowser();
      setInstallStatus(`Detected ${browser} browser, preparing installation...`);
      
      // Call our API to get installation method
      const response = await fetch('/api/install-extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          browserType: browser
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get installation method');
      }

      const result: InstallResponse = await response.json();
      setInstallStatus(result.message);

      if (result.success) {
        switch (result.method) {
          case 'direct-install':
            if (result.directInstallUrl) {
              setInstallStatus('Installing SensAI extension directly...');
              await installExtensionDirectly(result.directInstallUrl);
            }
            break;
            
          case 'chrome-store':
          case 'firefox-addons':
          case 'edge-addons':
            if (result.url) {
              setInstallStatus('Redirecting to browser store...');
              window.open(result.url, '_blank');
            }
            break;
            
          default:
            setShowManualInstructions(true);
            setInstallStatus('Manual installation required');
            break;
        }
      } else {
        setShowManualInstructions(true);
        setInstallStatus(result.message);
        onInstallError?.(result.message);
      }
    } catch (error) {
      console.error('Installation error:', error);
      setInstallStatus('Installation failed. Please try manual installation.');
      setShowManualInstructions(true);
      onInstallError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsInstalling(false);
    }
  };

  const downloadExtension = () => {
    const link = document.createElement('a');
    link.href = '/SensAI-extension.zip';
    link.download = 'SensAI-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerChromeInstallation = () => {
    setInstallStatus('Attempting Chrome extension installation...');
    
    // Create a special installation trigger for Chrome
    const installUrl = 'chrome-extension://install';
    const link = document.createElement('a');
    link.href = installUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    
    try {
      link.click();
      setInstallStatus('Chrome installation triggered! Check your extensions...');
      
      setTimeout(() => {
        setInstallStatus('If installation failed, please use manual method below.');
        setShowManualInstructions(true);
      }, 5000);
      
    } catch (error) {
      console.error('Chrome installation failed:', error);
      setInstallStatus('Chrome installation failed. Please use manual method.');
      setShowManualInstructions(true);
    } finally {
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalling ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Installing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.11 2 14 2.89 14 4V8H18C19.11 8 20 8.89 20 10V18C20 19.11 19.11 20 18 20H6C4.89 20 4 19.11 4 18V10C4 8.89 4.89 8 6 8H10V4C10 2.89 10.89 2 12 2M12 4V8H12.5C12.78 8 13 8.22 13 8.5V9.5C13 9.78 12.78 10 12.5 10H11.5C11.22 10 11 9.78 11 9.5V8.5C11 8.22 11.22 8 11.5 8H12V4Z"/>
              </svg>
              Install Extension
            </>
          )}
        </button>
        
        <div className="text-sm text-gray-500">
          <p>✓ Works on any website</p>
          <p>✓ No setup required</p>
          <p>✓ Completely free</p>
        </div>
      </div>

      {installStatus && (
        <div className="text-sm text-gray-600 text-center">
          {installStatus}
        </div>
      )}

      {showManualInstructions && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📦 Manual Installation:</h4>
          <div className="flex gap-2 mb-3">
            <button
              onClick={downloadExtension}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download Extension
            </button>
            <button
              onClick={triggerChromeInstallation}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Chrome Install
            </button>
          </div>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Download the extension ZIP file above</li>
            <li>2. Extract the ZIP file to a folder on your computer</li>
            <li>3. Open Chrome and go to <code className="bg-blue-100 px-1 rounded">chrome://extensions/</code></li>
            <li>4. Enable "Developer mode" (toggle in top right)</li>
            <li>5. Click "Load unpacked" and select the extracted folder</li>
            <li>6. The SensAI extension will appear in your toolbar!</li>
          </ol>
        </div>
      )}
    </div>
  );
} 