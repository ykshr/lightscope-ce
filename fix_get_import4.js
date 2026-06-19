const fs = require('fs');

const file = 'packages/api/tests/unit/rest/routers/tracker.test.ts';
let content = fs.readFileSync(file, 'utf8');

// Use proper regex replace to find the exact block and fix it
// Oops, the problem was that I stripped it, and didn't add it back!
// But wait... earlier I appended append_tests2.js which *added* it
// Let me just look at the file content
