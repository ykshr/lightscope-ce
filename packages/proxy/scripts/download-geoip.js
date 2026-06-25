const https = require('https');
const fs = require('fs');
const path = require('path');

const url =
  'https://raw.githubusercontent.com/maxmind/MaxMind-DB/main/test-data/GeoIP2-City-Test.mmdb';
const destDir = path.resolve(__dirname, '../data');
const dest = path.resolve(destDir, 'GeoLite2-City.mmdb');

// Ensure directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Downloading MaxMind test database...');
const file = fs.createWriteStream(dest);
https
  .get(url, (response) => {
    if (response.statusCode !== 200) {
      console.error('Failed to download: Status ' + response.statusCode);
      process.exit(1);
    }
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download complete: ' + dest);
      process.exit(0);
    });
  })
  .on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Download failed:', err.message);
    process.exit(1);
  });
