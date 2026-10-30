const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const electronBin = path.join(__dirname, 'node_modules', 'electron', 'dist', 'electron.exe');

if (fs.existsSync(electronBin)) {
  console.log('A iniciar Aplicação Desktop (Electron)...');
  const proc = spawn(electronBin, ['.'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  proc.on('exit', (code) => {
    process.exit(code || 0);
  });
} else {
  // Fallback caso Electron não esteja disponível
  console.log('Electron não encontrado. A iniciar modo App local...');
  require('./server.js');

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

  setTimeout(() => {
    let port = process.env.PORT || 3000;
    const portFile = path.join(__dirname, '.port');
    if (fs.existsSync(portFile)) {
      try {
        port = fs.readFileSync(portFile, 'utf-8').trim() || port;
      } catch (e) {}
    }

    const URL = `http://localhost:${port}`;
    console.log(`Abrindo aplicação em: ${URL}`);

    const runner = findRunner();
    if (runner) {
      const appProc = spawn(runner, [
        `--app=${URL}`,
        '--window-size=1380,880'
      ], { detached: false, stdio: 'ignore' });

      appProc.on('exit', () => {
        process.exit(0);
      });
    } else {
      exec(`start ${URL}`);
    }
  }, 600);
}
