const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

require('./server.js');

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}`;

function findRunner() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const runner = findRunner();

if (runner) {
  const appProc = spawn(runner, [
    `--app=${URL}`,
    '--window-size=1280,840'
  ], { detached: false, stdio: 'ignore' });

  appProc.on('exit', () => {
    process.exit(0);
  });
} else {
  exec(`start ${URL}`);
}
