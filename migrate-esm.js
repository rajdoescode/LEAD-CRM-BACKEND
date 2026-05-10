const fs = require('fs');
const path = require('path');

function glob(dir, arr = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) glob(fullPath, arr);
    else if (fullPath.endsWith('.js')) arr.push(fullPath);
  });
  return arr;
}

const resolveImportPath = (basePath, importPath) => {
  if (!importPath.startsWith('.')) return importPath; // Not a local import
  if (importPath.endsWith('.js') || importPath.endsWith('.json')) return importPath;

  const targetPath = path.resolve(path.dirname(basePath), importPath);
  
  if (fs.existsSync(targetPath + '.js')) {
    return importPath + '.js';
  } else if (fs.existsSync(targetPath + '/index.js')) {
    return importPath + '/index.js';
  } else if (fs.existsSync(targetPath + '.json')) {
    return importPath + '.json'; // Note: JSON imports might need assert/with in ES modules, but we'll try to just add extension first
  }
  
  return importPath; // Fallback
};

const files = glob('./src');
files.push('index.js'); // Don't forget root index.js if needed, actually it's 'src/index.js' in package.json main

let modifications = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace module.exports = ...
  content = content.replace(/module\.exports\s*=\s*/g, 'export default ');

  // Replace const x = require('y')
  // We need to carefully parse require patterns
  
  // 1. const { a, b } = require('c');
  content = content.replace(/(const|let|var)\s+(\{.*?\})\s*=\s*require\((['"])(.*?)\3\);?/g, (match, keyword, destructured, quote, importPath) => {
    const newPath = resolveImportPath(f, importPath);
    return `import ${destructured} from '${newPath}';`;
  });

  // 2. const a = require('c');
  content = content.replace(/(const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*require\((['"])(.*?)\3\);?/g, (match, keyword, identifier, quote, importPath) => {
    const newPath = resolveImportPath(f, importPath);
    return `import ${identifier} from '${newPath}';`;
  });

  // 3. require('c');
  content = content.replace(/require\((['"])(.*?)\1\);?/g, (match, quote, importPath) => {
    const newPath = resolveImportPath(f, importPath);
    return `import '${newPath}';`;
  });
  
  // Handle some common module.exports.foo = bar patterns if any?
  // Our previous check showed only module.exports = ...
  
  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    modifications++;
    console.log(`Updated ${f}`);
  }
});

console.log(`Done! Modified ${modifications} files.`);
