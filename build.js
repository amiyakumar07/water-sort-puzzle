const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, 'www');

// Create www folder if it doesn't exist
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Copy game files to www folder
const filesToCopy = ['index.html', 'style.css', 'game.js'];

filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(destDir, file);
    try {
        fs.copyFileSync(src, dest);
        console.log(`Successfully copied ${file} to www/`);
    } catch (err) {
        console.error(`Error copying ${file}:`, err);
        process.exit(1);
    }
});
