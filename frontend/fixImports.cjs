const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content.replace(/from\s+['"](\.\.?\/[^'"]+)\.js['"]/g, "from '$1.jsx'");
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
      }
    }
  });
}

walk('src');
console.log('Fixed imports');
