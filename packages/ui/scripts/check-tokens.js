// Validates tokens.json colors exist as CSS vars in tokens.css (free, no deps).
const fs = require('fs');
const path = require('path');
const dir = __dirname + '/..';
const tokens = JSON.parse(fs.readFileSync(path.join(dir, 'tokens.json'), 'utf8'));
const css = fs.readFileSync(path.join(dir, 'tokens.css'), 'utf8');
const hexes = Object.values(tokens.colors);
const missing = hexes.filter((h) => !css.toLowerCase().includes(String(h).toLowerCase()));
if (missing.length) {
  console.error('Missing CSS vars for: ' + missing.join(', '));
  process.exit(1);
}
console.log('tokens OK: ' + hexes.length + ' colors mirrored in CSS');
