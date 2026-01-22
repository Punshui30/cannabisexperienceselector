const fs = require('fs');
const path = require('path');

const keyPath = path.join(__dirname, 'vertex-key.json');

console.log('🔍 Looking for vertex-key.json...');

if (!fs.existsSync(keyPath)) {
    console.error(`
❌ ERROR: Could not find "vertex-key.json" in this folder.

INSTRUCTIONS:
1. Find the JSON key file you downloaded from Google Cloud.
2. Drag and drop it into this folder: ${__dirname}
3. Rename it to "vertex-key.json"
4. Run this script again: node fix-key.js
    `);
    process.exit(1);
}

try {
    const rawContent = fs.readFileSync(keyPath, 'utf8');
    // Parse and Re-Stringify to remove all whitespace/newlines automatically
    const cleanOneLine = JSON.stringify(JSON.parse(rawContent));

    console.log(`
✅ SUCCESS! Your key has been cleaned.
-------------------------------------------------------
COPY THE TEXT BELOW (Everything between the arrows):
-------------------------------------------------------
`);
    console.log(cleanOneLine);
    console.log(`
-------------------------------------------------------
⬆️  COPY THAT  ⬆️
Paste it into Vercel -> Settings -> Environment Variables -> GCP_SERVICE_ACCOUNT_KEY
-------------------------------------------------------
`);

} catch (err) {
    console.error('❌ ERROR: The file doesn\'t contain valid JSON. Please download a fresh key from Google Cloud.');
    console.error(err.message);
}
