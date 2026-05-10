const fs = require('fs');
const files = [
  'src/controllers/analytics.controller.js',
  'src/controllers/auth.controller.js',
  'src/controllers/lead.controller.js',
  'src/controllers/notification.controller.js',
  'src/controllers/pipeline.controller.js',
  'src/controllers/task.controller.js',
  'src/controllers/user.controller.js',
  'src/middleware/errorHandler.js',
  'src/utils/fileHelper.js',
  'src/utils/logger.js'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  const matches = [...content.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s+)?(?:\([^)]*\)|req|res|next)\s*=>/g)];
  
  // also find functions: function abc(...)
  const matches2 = [...content.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)];
  
  // for logger, it's const logger = { ... }
  const matches3 = [...content.matchAll(/const\s+([a-zA-Z0-9_]+)\s*=\s*\{/g)];
  
  let exports = [];
  matches.forEach(m => exports.push(m[1]));
  matches2.forEach(m => exports.push(m[1]));
  matches3.forEach(m => exports.push(m[1]));
  
  // Dedup and filter
  exports = [...new Set(exports)];
  
  // Filter out internal variables like 'app', 'PORT', 'fs', 'path', etc. that shouldn't be exported
  // Actually, usually in these files, we want to export the main logic.
  if (f.includes('logger.js')) exports = ['logger'];
  if (f.includes('errorHandler.js')) exports = ['notFoundHandler', 'errorHandler'];
  if (f.includes('fileHelper.js')) exports = ['readData', 'writeData'];
  
  console.log(f, exports);
  
  // Replace `export {  };` with the correct export
  if (content.includes('export {  };')) {
    content = content.replace(/export\s*\{\s*\};\n?/, `export {\n  ${exports.join(',\n  ')}\n};\n`);
    fs.writeFileSync(f, content, 'utf8');
  }
});
