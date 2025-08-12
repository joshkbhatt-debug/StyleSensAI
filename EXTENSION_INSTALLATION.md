# SensAI Extension Installation System

## Overview

The SensAI app now includes an **automatic extension installation system** that detects the user's browser and handles extension installation seamlessly.

## How It Works

### 1. Browser Detection
The system automatically detects the user's browser:
- **Chrome** - Uses Chrome Extension Installation API + Chrome Web Store
- **Firefox** - Redirects to Firefox Add-ons
- **Edge** - Redirects to Microsoft Edge Add-ons
- **Safari** - Provides manual installation instructions
- **Unknown** - Falls back to manual installation

### 2. Installation Methods

#### Chrome (Primary)
1. **Chrome Extension Installation API** - Direct installation if extension is published
2. **Chrome Web Store** - Redirects to store page for installation
3. **Manual Installation** - Download ZIP and load unpacked

#### Other Browsers
- **Firefox** - Redirects to Firefox Add-ons store
- **Edge** - Redirects to Microsoft Edge Add-ons store
- **Safari** - Manual installation only

### 3. User Experience

1. User clicks "Install Extension" button
2. System detects browser automatically
3. Shows installation progress with status messages
4. Handles installation automatically or provides fallback options
5. Provides manual installation instructions if needed

## API Endpoints

### `/api/install-extension`
- **Method**: POST
- **Purpose**: Determines installation method based on browser
- **Response**: Installation instructions and URLs

## Environment Variables

When publishing to browser stores, set these environment variables:

```bash
# Chrome Web Store Extension ID (when published)
NEXT_PUBLIC_CHROME_EXTENSION_ID=your_chrome_extension_id_here

# Browser Store URLs (when published)
NEXT_PUBLIC_CHROME_STORE_URL=https://chrome.google.com/webstore/detail/your-extension-id
NEXT_PUBLIC_FIREFOX_ADDONS_URL=https://addons.mozilla.org/en-US/firefox/addon/your-extension-id
NEXT_PUBLIC_EDGE_ADDONS_URL=https://microsoftedge.microsoft.com/addons/detail/your-extension-id
```

## Components

### ExtensionInstaller
- **Location**: `components/ExtensionInstaller.tsx`
- **Purpose**: Main UI component for extension installation
- **Features**:
  - Browser detection
  - Installation progress tracking
  - Fallback to manual installation
  - Download extension ZIP

## Installation Flow

```
User clicks "Install Extension"
    ↓
Detect browser type
    ↓
Call /api/install-extension
    ↓
Get installation method
    ↓
Execute installation:
├── Chrome: Try API → Web Store → Manual
├── Firefox: Redirect to Add-ons
├── Edge: Redirect to Add-ons
└── Safari: Manual instructions
    ↓
Show success/fallback options
```

## Development vs Production

### Development
- Uses placeholder extension IDs
- Provides manual installation instructions
- Downloads extension ZIP for testing

### Production
- Uses real extension IDs from browser stores
- Automatic installation via browser APIs
- Redirects to official store pages

## Testing

1. **Chrome**: Test with Chrome Extension Installation API
2. **Other browsers**: Test redirects to respective stores
3. **Manual fallback**: Test ZIP download and instructions
4. **Error handling**: Test with invalid extension IDs

## Future Enhancements

- [ ] Firefox WebExtensions API support
- [ ] Edge Add-ons API support
- [ ] Safari App Extensions support
- [ ] Extension update notifications
- [ ] Installation analytics tracking 