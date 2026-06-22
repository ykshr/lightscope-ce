const net = require('net');
const http = require('http');

const ports = process.env.WAIT_PORTS
  ? process.env.WAIT_PORTS.split(',').map(Number)
  : [3000, 3001, 3002, 8123, 8080];
const timeout = 60000;
const start = Date.now();

const checkPort = (port) =>
  new Promise((resolve) => {
    let path = '/';
    if (port === 3001 || port === 3002) path = '/health';

    if (port === 8123) {
      const socket = new net.Socket();
      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, '127.0.0.1');
      return;
    }

    const req = http.get({ hostname: '127.0.0.1', port, path, timeout: 2000 }, (res) => {
      // Consume response data to free up memory
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.on('error', () => resolve(false));
  });

const checkClickHouseReady = () =>
  new Promise((resolve) => {
    const req = http.get(
      'http://127.0.0.1:8123/?query=SELECT%201%20FROM%20system.tables%20WHERE%20database=%27lightscope%27%20AND%20name=%27pv_utm_hour_to_day_mv%27%20LIMIT%201',
      { auth: `lightscope:${process.env.CLICKHOUSE_PASSWORD || 'lightscope'}` },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200 && data.trim() === '1') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.end();
  });

const wait = async () => {
  console.log(`Waiting for ports ${ports.join(', ')} to be ready...`);
  while (Date.now() - start < timeout) {
    const portResults = await Promise.all(ports.map(checkPort));
    if (portResults.every(Boolean)) {
      if (ports.includes(8123)) {
        const isClickHouseReady = await checkClickHouseReady();
        if (isClickHouseReady) {
          console.log('All services and ClickHouse tables are ready.');
          process.exit(0);
        }
      } else {
        console.log('All configured services are ready.');
        process.exit(0);
      }
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error('Timeout waiting for services to be ready.');
  process.exit(1);
};

wait();
