const fs = require('fs');
const path = require('path');

// Source and destination directories
const srcDir = path.join(__dirname, '..', 'src', 'templates');
const destDir = path.join(__dirname, '..', 'lib', 'templates');

// Recursively copy directory
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Execute copy
try {
  copyDir(srcDir, destDir);
  console.log('Templates copied successfully to lib/templates');
} catch (error) {
  console.error('Error copying templates:', error);
  process.exit(1);
}
