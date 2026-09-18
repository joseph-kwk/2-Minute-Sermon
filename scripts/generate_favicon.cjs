const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'public', 'assets', 'logo.png');
const svgFaviconPath = path.join(__dirname, '..', 'public', 'favicon.svg');

if (!fs.existsSync(logoPath)) {
  console.error('Logo file not found:', logoPath);
  process.exit(1);
}

const logoBase64 = fs.readFileSync(logoPath).toString('base64');
const dataUri = `data:image/png;base64,${logoBase64}`;

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <filter id="subtle-shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.08)" />
    </filter>
  </defs>
  <!-- Clean white background with smooth rounded corners -->
  <rect width="128" height="128" rx="28" fill="#ffffff" />
  <rect x="1" y="1" width="126" height="126" rx="27" fill="none" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Centered logo graphic preserving natural 3:2 aspect ratio (never squeezed) -->
  <image href="${dataUri}" x="14" y="31" width="100" height="66.67" preserveAspectRatio="xMidYMid meet" />
</svg>`;

fs.writeFileSync(svgFaviconPath, svgContent, 'utf8');
console.log('✅ favicon.svg created successfully with white background and un-squeezed aspect ratio!');
