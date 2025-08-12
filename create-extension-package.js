const fs = require('fs');
const path = require('path');

// Create extension package for distribution
function createExtensionPackage() {
  const extensionFiles = [
    'manifest.json',
    'background.js', 
    'content.js',
    'content.css'
  ];

  const packageDir = 'StyleSensei-Extension';
  
  // Create package directory
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir);
  }

  // Copy extension files
  extensionFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(packageDir, file));
      console.log(`✓ Copied ${file}`);
    }
  });

  // Create simple README for users
  const readme = `
# StyleSensei Browser Extension

## 🚀 Quick Installation

1. Go to: chrome://extensions/
2. Turn ON "Developer mode" (top-right toggle)  
3. Click "Load unpacked"
4. Select this "StyleSensei-Extension" folder
5. Click "Select Folder"

## ✅ Done! 

The extension is now installed and ready to use on any website!

## 🎯 How to Use

1. Go to any website (Gmail, Google Docs, social media, etc.)
2. Select/highlight any text you want to improve
3. Look for the small "S" icon that appears near your selection
4. Click the icon to open the transformation widget
5. Choose your tone and action
6. Transform your text instantly!

## 🌟 Features

- ✅ Works on ANY website
- ✅ No API keys required
- ✅ 6 different tones (Confident, Polite, Friendly, etc.)
- ✅ 9 different actions (Make Concise, Make Creative, etc.)
- ✅ Instant text replacement
- ✅ Copy to clipboard

Enjoy your AI writing assistant! 🎉
`;

  fs.writeFileSync(path.join(packageDir, 'README.md'), readme);
  console.log('✓ Created README.md');
  
  console.log(`\n🎉 Extension package created in "${packageDir}" folder!`);
  console.log('Users can now download this folder and install the extension.');
}

// Run the script
createExtensionPackage(); 