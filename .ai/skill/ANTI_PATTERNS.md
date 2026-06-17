# File: .ai/skill/ANTI_PATTERNS.md

## 1. Deep Cross-Package Imports
* **Why it is wrong**: Breaks monorepo encapsulation and introduces tight coupling between loosely coupled workspace packages.
* **Bad example**: `import { redactError } from '../../api/src/helpers/error';`
* **Good example**: `import { redactError } from '@/helpers/error';` (Using duplicated local utility)
* **Evidence**: `AGENTS.md` ("Always import from a package's public exports. Deep cross-package imports... are not allowed. To adhere to monorepo restrictions... small utility functions like `redactError` are duplicated in both `packages/api/src/helpers/` and `packages/proxy/src/helpers/`.")

## 2. Hardcoded Secret Fallbacks
* **Why it is wrong**: Creates a severe security vulnerability where missing configuration falls back to known, insecure defaults in production environments.
* **Bad example**: `const secret = process.env.JWT_SECRET || 'secret';`
* **Good example**: `const secret = process.env.JWT_SECRET; if (!secret) throw new Error('Missing secret');`
* **Evidence**: `AGENTS.md` ("To comply with strict security standards, hardcoded secret fallbacks (e.g., `|| 'secret'` or `:-secret`) are prohibited across application code, test files, and `docker-compose.yml`.")

## 3. SQL Injection via String Interpolation
* **Why it is wrong**: Interpolating variables directly into raw ClickHouse SQL queries exposes the database to SQL injection attacks.
* **Bad example**: `const query = \`SELECT * FROM table LIMIT \${limit}\`;`
* **Good example**: `const query = 'SELECT * FROM table LIMIT {limit:UInt32}'; client.query({ query, query_params: { limit }});`
* **Evidence**: Memory context ("ClickHouse queries in `packages/api/src/graphql/loaders/` must use parameter binding for `LIMIT`, `OFFSET`, and `LIMIT BY` clauses using the `{name:Type}` syntax")

## 4. Tests Inside the Source Directory
* **Why it is wrong**: Clutters the source code structure and risks test code being accidentally included in production build artifacts.
* **Bad example**: `packages/api/src/helpers/apple.test.ts`
* **Good example**: `packages/api/tests/unit/helpers/apple.test.ts`
* **Evidence**: `AGENTS.md` ("Within each package, unit and integration tests must be placed in `tests/unit/` and `tests/integration/` directories respectively. Do not place tests directly inside the `src/` directory.")

## 5. Non-English Documentation
* **Why it is wrong**: Fragments the knowledge base and makes the codebase inaccessible to international contributors and global AI agents.
* **Bad example**: `// ユーザーデータを取得`
* **Good example**: `// Fetch user data`
* **Evidence**: `AGENTS.md` ("Write all code, comments, and commit messages in concise and intuitive English. All documentation... must be written entirely in English.")

## 6. Derived State using `useEffect`
* **Why it is wrong**: Setting state derived from props inside a `useEffect` causes an unnecessary double re-render in React components, degrading performance.
* **Bad example**: `const [derived, setDerived] = useState(); useEffect(() => { setDerived(props.value * 2) }, [props.value]);`
* **Good example**: `const derived = useMemo(() => props.value * 2, [props.value]);`
* **Evidence**: Memory context ("React components in `packages/web` (such as `useProcessData` hooks) must compute derived state synchronously during render using `useMemo` rather than managing it with `useState` combined with `useEffect`")

## 7. Inventing AI Skill Documentation Patterns
* **Why it is wrong**: Documenting "best practices" that aren't actively utilized in the source code creates confusion and leads to architectural drift when other agents rely on false documentation.
* **Bad example**: `Documenting a "clean architecture" generic pattern without a repository example.`
* **Good example**: `Documenting a specific single-pass formatting pattern and citing packages/api/src/graphql/loaders/helpers/clickhouse.ts.`
* **Evidence**: `AGENTS.md` ("When generating documentation or code, AI agents must prioritize consistency with existing repository code over idealized architecture. Never describe generic best practices unless they are verified in the repository.")

## 8. Leaving Temporary Scripts in Workspace
* **Why it is wrong**: Pollutes the repository history and directory structure with irrelevant garbage files used for debugging or context gathering.
* **Bad example**: Committing `.ai/skill/test-output.txt` or `parse-script.js`.
* **Good example**: Removing `parse-script.js` before calling the submit tool.
* **Evidence**: `AGENTS.md` ("Do not leave temporary scratchpad scripts (e.g., .sh, .js, .py files) used for text processing or validation in the working directory when finalizing code or committing changes.")

## 9. Heavy Dependencies in Tracker Package
* **Why it is wrong**: The tracker is injected into external sites. Including heavy libraries (like React or Lodash) drastically increases bundle size, harming the host site's performance.
* **Bad example**: `import * as _ from 'lodash';` in `packages/tracker/src/index.ts`
* **Good example**: Using native `document.getElementsByTagName` and caching results in a prototype-less map `Object.create(null)`.
* **Evidence**: Memory context ("The `packages/tracker` package is performance-critical and bundle-size sensitive; it must rely on native browser globals... and avoid heavy external libraries")

## 10. Unsanitized `dangerouslySetInnerHTML`
* **Why it is wrong**: Passing user-controlled configuration keys or values directly into React's `dangerouslySetInnerHTML` exposes the UI to XSS and CSS injection attacks.
* **Bad example**: `<style dangerouslySetInnerHTML={{ __html: \`#\${id} { color: \${color}; }\` }} />`
* **Good example**: `<style dangerouslySetInnerHTML={{ __html: \`#\${sanitizeCSSIdentifier(id)} { color: \${sanitizeCSSValue(color)}; }\` }} />`
* **Evidence**: Memory context ("The `ChartStyle` component in `packages/web/src/components/ui/chart.tsx` mitigates XSS vulnerabilities within `dangerouslySetInnerHTML` by sanitizing CSS identifiers... and CSS values")
