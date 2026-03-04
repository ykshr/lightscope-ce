const net = require('net');

const ports = [3000, 60000, 8123, 8080];
const timeout = 60000;
const start = Date.now();

const checkPort = (port) =>
  new Promise((resolve) => {
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
  });

const wait = async () => {
  console.log(`Waiting for ports ${ports.join(', ')} to be ready...`);
  while (Date.now() - start < timeout) {
    const results = await Promise.all(ports.map(checkPort));
    if (results.every(Boolean)) {
      console.log('All services are ready.');
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error('Timeout waiting for services.');
  process.exit(1);
};

wait();
