const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.js', '.jsx'], filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getAllFiles(fullPath, exts, filesList);
      }
    } else {
      if (exts.includes(path.extname(fullPath))) {
        filesList.push(fullPath);
      }
    }
  }
  return filesList;
}

const srcDir = path.resolve('frontend/src');
const allFiles = getAllFiles(srcDir);
const orphaned = [];

// Pre-read all file contents into memory for fast searching
const fileContents = allFiles.map(f => ({ path: f, content: fs.readFileSync(f, 'utf8') }));

for (const file of allFiles) {
  const basename = path.basename(file, path.extname(file));
  // Skip Next.js special files
  if (['page', 'layout', 'error', 'loading', 'not-found', 'global-error', 'route', 'middleware'].includes(basename)) continue;
  if (basename === 'AdminSidebar' || basename === 'Header') continue; // Known to be used
  
  let isImported = false;
  for (const targetFile of fileContents) {
    if (targetFile.path !== file && targetFile.content.includes(basename)) {
      isImported = true;
      break;
    }
  }
  
  if (!isImported) {
    orphaned.push(file);
  }
}

console.log('Possibly orphaned files:');
orphaned.forEach(f => console.log(f.replace(srcDir, '')));
