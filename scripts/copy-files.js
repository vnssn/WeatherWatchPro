import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.mkdirSync(path.join(rootDir, 'dist'));
}

// Function to recursively copy a directory
function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Read all files and subdirectories in the source directory
  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(sourcePath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

// Copy server and shared directories to dist
copyDirectory(path.join(rootDir, 'server'), path.join(rootDir, 'dist/server'));
copyDirectory(path.join(rootDir, 'shared'), path.join(rootDir, 'dist/shared'));

// Copy JavaScript files from the root directory to dist
const rootFiles = fs.readdirSync(rootDir);
for (const file of rootFiles) {
  const filePath = path.join(rootDir, file);
  if (file.endsWith('.js') && fs.statSync(filePath).isFile()) {
    fs.copyFileSync(filePath, path.join(rootDir, 'dist', file));
  }
}

console.log('Files copied successfully for Vercel deployment'); 