import pidusage from 'pidusage';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getContainerPids() {
  const { stdout } = await execAsync('docker ps -q');
  const containerIds = stdout.trim().split('\n').filter(Boolean);

  const pids = [];
  for (const id of containerIds) {
    const { stdout: nameStdout } = await execAsync(`docker inspect -f '{{.Name}}' ${id}`);
    const name = nameStdout.trim().replace('/', '');

    // We only care about lightscope containers
    if (name.includes('clickhouse') || name.includes('api') || name.includes('proxy')) {
      const { stdout: pidStdout } = await execAsync(`docker inspect -f '{{.State.Pid}}' ${id}`);
      const pid = parseInt(pidStdout.trim(), 10);
      if (!isNaN(pid) && pid > 0) {
        pids.push({ name, pid });
      }
    }
  }
  return pids;
}

async function monitor() {
  const containers = await getContainerPids();
  console.log(`Monitoring ${containers.length} containers...`);

  setInterval(async () => {
    console.log('\n--- Resource Usage ---');
    console.log(new Date().toISOString());
    for (const { name, pid } of containers) {
      try {
        const stats = await pidusage(pid);
        console.log(
          `${name}: CPU ${stats.cpu.toFixed(2)}%, Mem ${(stats.memory / 1024 / 1024).toFixed(2)} MB`
        );
      } catch (err) {
        // Container might have stopped or pidusage failed
      }
    }
  }, 5000);
}

monitor().catch(console.error);
