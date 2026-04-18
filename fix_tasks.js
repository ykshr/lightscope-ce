const fs = require('fs');
const content = fs.readFileSync('TASKS.md', 'utf8');

const newSection5 = `## 5. Increase Test Coverage
- **Task:** Implement comprehensive tests across all projects based on the following definitions:
  - **Unit Test:** Function-level testing. Does not require the package to be started.
  - **Integration Test:** Package-level testing. Requires the single target package to be started. External packages and dependencies must be mocked using stubs or drivers.
  - **E2E Test:** Fully integrated testing involving all packages. Requires all packages to be started. Must cover comprehensive user journeys and data flows.

- **Task:** Apply the definitions to each project as follows:
  - **\`packages/api\`**:
    - **Unit Tests:** Test individual resolver functions, authentication helpers, and data processing utilities.
    - **Integration Tests:** Start the API server and test GraphQL queries and mutations against an isolated (or stubbed) test database.
  - **\`packages/web\`**:
    - **Unit Tests:** Test UI components (rendering, state changes), custom hooks, and utility functions.
    - **Integration Tests:** Start the Vite dev server and test component interactions using mocked API responses.
  - **\`packages/proxy\`**:
    - **Unit Tests:** Test request parsing, validation logic, and data transformation helpers.
    - **Integration Tests:** Start the Hono proxy server and test event ingestion endpoints, stubbing the actual ClickHouse database connection.
  - **\`packages/tracker\`**:
    - **Unit Tests:** Test event tracking logic, configuration parsing, and browser API wrappers without a live backend.
    - **Integration Tests:** Test the tracker script initialization and payload generation in an isolated environment (e.g., jsdom) with a mocked proxy endpoint.
  - **\`packages/e2e\`**:
    - **E2E Tests:** Use Playwright to simulate full user journeys (authentication, data ingestion via tracker, proxy processing, API serving, and web dashboard visualization). Requires all services (\`web\`, \`api\`, \`proxy\`, \`mock-site\`, and databases) to be up and running via Docker Compose.
`;

const lines = content.split('\n');

let startIndex = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('## 5. Increase Test Coverage')) {
    startIndex = i;
    break;
  }
}

if (startIndex !== -1) {
  const before = lines.slice(0, startIndex);

  // Find where section 6 starts, but only search AFTER section 5
  let endIndex = -1;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].includes('## 6. Documentation Updates')) {
      endIndex = i;
      break;
    }
  }

  if (endIndex !== -1) {
    const after = lines.slice(endIndex);
    const finalContent = [...before, newSection5.trim(), '', ...after].join('\n');
    fs.writeFileSync('TASKS.md', finalContent);
    console.log("Successfully updated.");
  } else {
    console.log("Could not find section 6.");
  }
} else {
  console.log("Could not find section 5.");
}
