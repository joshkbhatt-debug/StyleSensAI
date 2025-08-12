// Build script for StyleSensAI extension
// Packages the extension for Chrome Web Store upload

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

function buildExtension() {
  console.log('🚀 Building StyleSensAI Extension...');

  const extensionDir = 'extension';
  const distDir = 'extension/dist';
  const zipPath = 'extension/SensAI-extension.zip';

  // Check if extension directory exists
  if (!fs.existsSync(extensionDir)) {
    console.error('❌ Extension directory not found. Run this from the project root.');
    process.exit(1);
  }

  // Create dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Required files for the extension
  const requiredFiles = [
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'styles.css'
  ];

  // Check if all required files exist
  console.log('🔍 Checking required files...');
  for (const file of requiredFiles) {
    const filePath = path.join(extensionDir, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required file missing: ${file}`);
      process.exit(1);
    }
    console.log(`✅ ${file}`);
  }

  // Copy files to dist directory
  console.log('📁 Copying files to dist directory...');
  for (const file of requiredFiles) {
    const srcPath = path.join(extensionDir, file);
    const destPath = path.join(distDir, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${file}`);
  }

  // Create icons directory if it doesn't exist
  const iconsDir = path.join(distDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Create placeholder icons if they don't exist
  const iconSizes = [16, 32, 48, 128];
  for (const size of iconSizes) {
    const iconPath = path.join(iconsDir, `icon${size}.png`);
    if (!fs.existsSync(iconPath)) {
      // Create a simple SVG-based placeholder icon
      const svgIcon = createPlaceholderIcon(size);
      // For now, we'll just create a text file indicating the icon should be created
      fs.writeFileSync(iconPath.replace('.png', '.txt'), `Icon ${size}x${size} should be created here`);
      console.log(`⚠️  Placeholder created for icon${size}.png (create actual PNG icon)`);
    }
  }

  // Update manifest.json with production settings
  console.log('🔧 Updating manifest for production...');
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Update manifest with production settings
  manifest.name = 'StyleSensAI - AI Writing Assistant';
  manifest.description = 'AI-powered writing assistant that transforms text to match selected tones while preserving your unique voice. Works on any website!';
  manifest.version = '1.0.0';

  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest updated');

  // Create ZIP file
  console.log('📦 Creating ZIP package...');
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', function() {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`✅ Extension packaged successfully!`);
    console.log(`📦 ZIP size: ${sizeInMB} MB`);
    console.log(`📁 Output: ${zipPath}`);
    console.log('');
    console.log('🎉 Ready for Chrome Web Store submission!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Create actual icon PNGs in extension/dist/icons/');
    console.log('2. Test the extension locally');
    console.log('3. Submit to Chrome Web Store');
  });

  archive.on('error', function(err) {
    console.error('❌ ZIP creation failed:', err);
    process.exit(1);
  });

  archive.pipe(output);

  // Add all files from dist directory to ZIP
  archive.directory(distDir, false);

  archive.finalize();
}

function createPlaceholderIcon(size) {
  // Create a simple SVG icon for SensAI
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="4" fill="url(#gradient)"/>
    <path d="M12 2L14 8H22L16 12L18 20L12 16L6 20L8 12L2 8H10L12 2Z" fill="white"/>
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#667eea"/>
        <stop offset="100%" style="stop-color:#764ba2"/>
      </linearGradient>
    </defs>
  </svg>`;
}

// Run the build
buildExtension(); 