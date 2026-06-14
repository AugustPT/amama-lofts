const fs = require('fs');
const path = require('path');

const logDir = 'C:\\Users\\august\\.gemini\\antigravity\\brain\\a9d3f26e-70b7-4b6c-b2c8-45cfa1ca1ffb\\.system_generated\\logs';
const transcriptPath = path.join(logDir, 'transcript_full.jsonl');
const activePath = fs.existsSync(transcriptPath) ? transcriptPath : path.join(logDir, 'transcript.jsonl');

const content = fs.readFileSync(activePath, 'utf8');
const lines = content.split('\n');

const virtualFs = {};

function normalizePath(p) {
  return p.replace(/\\/g, '/').toLowerCase();
}

lines.forEach(line => {
  if (!line.trim()) return;
  try {
    const step = JSON.parse(line);
    if (step.step_index >= 160) return; // Stop before step 160
    
    if (step.tool_calls) {
      step.tool_calls.forEach(call => {
        const args = call.args;
        if (!args || !args.TargetFile) return;
        
        const fileKey = normalizePath(args.TargetFile);
        
        if (call.name === 'write_to_file') {
          virtualFs[fileKey] = args.CodeContent;
        } else if (call.name === 'replace_file_content') {
          const current = virtualFs[fileKey] || '';
          const target = args.TargetContent;
          const replacement = args.ReplacementContent;
          
          if (!current.includes(target)) {
            console.warn(`[WARNING] Step ${step.step_index}: Target content not found in ${args.TargetFile}`);
          }
          virtualFs[fileKey] = current.replace(target, replacement);
        } else if (call.name === 'multi_replace_file_content') {
          let current = virtualFs[fileKey] || '';
          const chunks = args.ReplacementChunks;
          if (chunks) {
            chunks.forEach(chunk => {
              const target = chunk.TargetContent;
              const replacement = chunk.ReplacementContent;
              if (!current.includes(target)) {
                console.warn(`[WARNING] Step ${step.step_index} (multi): Target content not found in ${args.TargetFile}`);
              }
              current = current.replace(target, replacement);
            });
            virtualFs[fileKey] = current;
          }
        }
      });
    }
  } catch (e) {
    console.error('Error parsing line:', e);
  }
});

// Save all reconstructed files
console.log('\n=== RECONSTRUCTED FILES AT STEP 159 ===');
Object.keys(virtualFs).forEach(key => {
  const code = virtualFs[key];
  // Find relative path in amama lofts
  const match = key.match(/\/amama lofts\/(.*)/);
  if (match) {
    const relPath = match[1];
    console.log(`- ${relPath} (${code.length} chars)`);
    const outPath = relPath.replace(/\//g, '_') + '.original';
    fs.writeFileSync(outPath, code);
    console.log(`  Saved to ${outPath}`);
  }
});
