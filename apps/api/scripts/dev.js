const { spawn, execSync } = require('child_process');
const path = require('path');

const port = process.env.API_PORT || 4000;

// Tự động giải phóng cổng nếu có tiến trình cũ chiếm dụng (tránh EADDRINUSE và SIGABRT 134)
function killPort(portNumber) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${portNumber}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore'],
      });
      const lines = output.trim().split(/\r?\n/);
      const currentPid = process.pid;
      const pidsToKill = new Set();

      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && Number(pid) !== currentPid) {
            pidsToKill.add(pid);
          }
        }
      }

      for (const pid of pidsToKill) {
        try {
          console.log(`[dev] Giải phóng cổng ${portNumber} từ tiến trình PID ${pid}...`);
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        } catch {}
      }
    } catch {
      // Không có tiến trình chiếm cổng
    }
  }
}

killPort(port);

// Tìm binary của nest
let nestBin;
try {
  nestBin = require.resolve('@nestjs/cli/bin/nest.js');
} catch {
  nestBin = path.join(__dirname, '..', 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');
}

console.log(`[dev] Khởi chạy NestJS API trên cổng ${port}...`);

const child = spawn(process.execPath, [nestBin, 'start', '--watch'], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.resolve(__dirname, '..'),
});

child.on('close', (code) => {
  process.exit(code ?? 0);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
  process.exit(0);
});
