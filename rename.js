const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\DELL\\OneDrive\\Desktop\\maxGlow';

const excludeDirs = ['.git', 'node_modules', '.next', 'public/uploads', 'public/assets/images'];

// Extensions to include (so we don't accidentally ruin binary files)
const includeExtensions = ['.js', '.jsx', '.json', '.html', '.css', '.md', '.env', '.env.development', '.conf', '.cjs', '.ts', '.tsx'];

const replacements = [
  { search: /MaxGlowOn/g, replace: 'MaxGlowOn' },
  { search: /maxglowon/g, replace: 'maxglowon' },
  { search: /MaxGlow/g, replace: 'MaxGlow' },
  { search: /maxglow/g, replace: 'maxglow' },
  { search: /MAXGLOW/g, replace: 'MAXGLOW' },
];

function processFile(filePath) {
  const ext = path.extname(filePath);
  const isEnv = path.basename(filePath).startsWith('.env');
  
  if (!includeExtensions.includes(ext) && !isEnv) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  replacements.forEach(r => {
    newContent = newContent.replace(r.search, r.replace);
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (excludeDirs.includes(file)) continue;

    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

walkDir(rootDir);
console.log('Renaming maxglow.nginx.conf to maxglow.nginx.conf...');
const oldNginxPath = path.join(rootDir, 'maxglow.nginx.conf');
const newNginxPath = path.join(rootDir, 'maxglow.nginx.conf');
if (fs.existsSync(oldNginxPath)) {
  fs.renameSync(oldNginxPath, newNginxPath);
  console.log('Renamed nginx config file successfully.');
}

console.log('Done.');
