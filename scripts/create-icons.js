const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, '../extension/dist/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// SVG icon template for SensAI
function createSVGIcon(size) {
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

// Create icons for different sizes
const sizes = [16, 32, 48, 128];

console.log('🎨 Creating SensAI extension icons...');

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const iconPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(iconPath, svgContent);
  console.log(`✅ Created icon${size}.svg`);
});

// Also create a simple PNG placeholder (text file for now)
sizes.forEach(size => {
  const pngPath = path.join(iconsDir, `icon${size}.png`);
  const placeholderContent = `This should be a ${size}x${size} PNG icon for the SensAI extension.
  
To create the actual PNG:
1. Open the corresponding SVG file in a browser or image editor
2. Export as PNG at ${size}x${size} pixels
3. Replace this file with the actual PNG

The icon should be a star shape with a blue-to-purple gradient background.`;
  
  fs.writeFileSync(pngPath, placeholderContent);
  console.log(`⚠️  Created placeholder for icon${size}.png`);
});

console.log('🎉 Icons created! Check extension/dist/icons/');
console.log('📝 Note: Replace PNG placeholders with actual PNG files for production'); 