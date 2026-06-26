const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

// Helper to log with prefix
function log(msg) {
  console.log(`[E2E-Runner] ${msg}`);
}

// Read JWT_SECRET from environment or fall back to .env file
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^JWT_SECRET=(.+)$/m);
    if (match) {
      jwtSecret = match[1].trim();
    }
  }
}

if (!jwtSecret) {
  console.error('Error: JWT_SECRET must be defined in the environment or .env file');
  process.exit(1);
}

const env = {
  ...process.env,
  JWT_SECRET: jwtSecret,
  CLICKHOUSE_URL: 'http://127.0.0.1:8123',
  CLICKHOUSE_USERNAME: process.env.CLICKHOUSE_USERNAME || 'lightscope',
  CLICKHOUSE_PASSWORD: process.env.CLICKHOUSE_PASSWORD || 'lightscope',
  CLICKHOUSE_DB: process.env.CLICKHOUSE_DB || 'lightscope',
  API_PORT: '3001',
  API_ALLOW_ORIGINS: 'http://localhost:3000,http://127.0.0.1:3000',
  PROXY_PORT: '3002',
  PROXY_ALLOW_ORIGINS: '*',
  VITE_API_URL: 'http://127.0.0.1:3001',
  VITE_PROXY_URL: 'http://127.0.0.1:3002',
  VITE_PORT: '3000',
  PORT: '3000',
};

const processes = [];

function runCommandSync(cmd, cwd = rootDir) {
  log(`Executing: ${cmd} in ${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env });
}

function startProcess(cmd, args, cwd = rootDir) {
  log(`Starting background process: ${cmd} ${args.join(' ')} in ${cwd}`);
  // Use detached: true to start the process in a new process group, so we can kill all its children cleanly
  const proc = spawn(cmd, args, { cwd, stdio: 'inherit', env, detached: true });
  processes.push(proc);
  
  proc.on('error', (err) => {
    log(`Process error: ${err}`);
  });
  
  return proc;
}

async function main() {
  let exitCode = 0;
  try {
    // 1. Start ClickHouse via docker compose
    log('Spinning up ClickHouse in Docker...');
    runCommandSync('docker compose up -d clickhouse');

    // 2. Build tracking script (pretest:e2e equivalent)
    log('Building tracker...');
    runCommandSync('pnpm --filter @lightscope-ce/tracker run build');

    // 3. Push API database migrations/schema
    log('Pushing database schema...');
    runCommandSync('pnpm --filter @lightscope-ce/api run db:push');

    // 4. Start services in the background
    // API
    startProcess('pnpm', ['--filter', '@lightscope-ce/api', 'run', 'dev'], rootDir);
    // Proxy
    startProcess('pnpm', ['--filter', '@lightscope-ce/proxy', 'run', 'dev'], rootDir);
    // Web
    startProcess('pnpm', ['--filter', '@lightscope-ce/web', 'run', 'dev'], rootDir);
    // Mock site
    startProcess('node', [path.join(rootDir, 'utils', 'serve-mock-site.js')], rootDir);

    // 5. Wait for services to be ready
    log('Waiting for services to be ready...');
    runCommandSync('node utils/wait-for-services.js');

    // 6. Run E2E tests
    log('Running E2E tests...');
    runCommandSync('pnpm --filter @lightscope-ce/e2e run test:e2e');
  } catch (error) {
    console.error('Error during E2E run:', error);
    exitCode = 1;
  } finally {
    log('Tearing down...');
    
    // Kill all spawned background processes using process groups
    for (const proc of processes) {
      if (proc.pid) {
        log(`Killing process group PID: ${proc.pid}`);
        try {
          process.kill(-proc.pid, 'SIGTERM');
        } catch (e) {
          // ignore error if process already exited
        }
      }
    }

    // Stop ClickHouse and remove its volumes
    try {
      log('Stopping ClickHouse container...');
      runCommandSync('docker compose down -v');
    } catch (e) {
      console.error('Error stopping ClickHouse container:', e);
    }
    
    process.exit(exitCode);
  }
}

main();
