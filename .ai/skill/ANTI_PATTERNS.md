# File: .ai/skill/ANTI_PATTERNS.md

# 1. Deep Cross-Package Imports
* **Why it is wrong**: Violates pnpm monorepo encapsulation and creates tight coupling between workspace boundaries.
* **Bad example**: `import { redactError } from '../../api/src/helpers/redactError';`
* **Good example**: `import { redactError } from './helpers/redactError';` (locally duplicated small utility)
* **Evidence**: `AGENTS.md` ("Always import from a package's public exports. Deep cross-package imports (e.g., ../../api/src/...) are not allowed.")

# 2. Hardcoded Secret Fallbacks
* **Why it is wrong**: Disguises missing secrets in CI/CD and introduces security vulnerabilities by falling back to predictable strings.
* **Bad example**: `const secret = process.env.JWT_SECRET || 'secret';`
* **Good example**: `const secret = process.env.JWT_SECRET; if (!secret) throw new Error('Missing JWT_SECRET');`
* **Evidence**: `AGENTS.md` ("hardcoded secret fallbacks (e.g., || 'secret' or :-secret) are prohibited across application code, test files, and docker-compose.yml.")

# 3. Unparameterized ClickHouse Queries
* **Why it is wrong**: Exposes the database to SQL injection attacks.
* **Bad example**: `const query = \`SELECT * FROM events LIMIT \${limit}\`;`
* **Good example**: `const query = \`SELECT * FROM events LIMIT {limit:UInt32}\`;`
* **Evidence**: Memory constraints specify that ClickHouse queries must use `{name:Type}` parameter binding.

# 4. Using `as any` in Application Code
* **Why it is wrong**: Defeats the purpose of strict TypeScript typing and hides underlying architectural bugs.
* **Bad example**: `const user = response.data as any;`
* **Good example**: `const user = parseUserResponse(response.data);`
* **Evidence**: `AGENTS.md` ("Maintain strict TypeScript. The use of `any` or unsafe casting (like `as any`) is prohibited.")

# 5. Inventing Generic Architecture References
* **Why it is wrong**: Causes AI agents to implement "best practices" that break existing repository consistency and confuse human maintainers.
* **Bad example**: "Applying Hexagonal Architecture patterns to isolate the domain."
* **Good example**: "Pattern not found in repository."
* **Evidence**: Memory instructions ("Never describe generic best practices unless they are verified in the repository.")

# 6. Synchronous Main Thread Blocking for Tracking
* **Why it is wrong**: Tracking analytics synchronously causes layout thrashing and degrades user experience.
* **Bad example**: `window.addEventListener('scroll', () => { calculateScrollDepth(); });`
* **Good example**: `window.addEventListener('scroll', () => { window.requestAnimationFrame(calculateScrollDepth); }, { passive: true });`
* **Evidence**: `packages/tracker/src/features/scrollTracking.ts` uses `requestAnimationFrame` to throttle layout calculations.

# 7. Unsafe CSS Injection in React
* **Why it is wrong**: Injecting unsanitized user or configuration values into `dangerouslySetInnerHTML` allows XSS payload execution.
* **Bad example**: `<style dangerouslySetInnerHTML={{ __html: \`#\${id} { color: \${color} }\` }} />`
* **Good example**: `<style dangerouslySetInnerHTML={{ __html: \`#\${sanitizeCSSIdentifier(id)} { color: \${sanitizeCSSValue(color)} }\` }} />`
* **Evidence**: `packages/web/src/components/ui/chart.tsx` uses XSS sanitization techniques for CSS properties.

# 8. Overwriting Documentation Files
* **Why it is wrong**: Destroying existing guardrails and repository rules when applying new templates.
* **Bad example**: `fs.writeFileSync('AGENTS.md', newTemplateString);`
* **Good example**: Safely nesting new content under existing headers using Git merge diffs or partial replacements.
* **Evidence**: Memory instructions ("preserve existing project guidelines by safely nesting them under the new headings... rather than overwriting the entire file").

# 9. Asynchronous Derived State in React
* **Why it is wrong**: Causes unnecessary double re-renders and degrades performance when data props change.
* **Bad example**:
  ```tsx
  const [filtered, setFiltered] = useState([]);
  useEffect(() => { setFiltered(data.filter(d => d.active)) }, [data]);
  ```
* **Good example**: `const filtered = useMemo(() => data.filter(d => d.active), [data]);`
* **Evidence**: Memory constraints state that derived state must be computed synchronously during render using `useMemo`.

# 10. Navigating via Buttons
* **Why it is wrong**: Breaks screen reader accessibility and standard web features like "middle-click to open in new tab".
* **Bad example**: `<button onClick={() => navigate('/dashboard')}>Dashboard</button>`
* **Good example**: `<Link to="/dashboard">Dashboard</Link>`
* **Evidence**: Memory constraints ("use semantic <Link> components from react-router-dom rather than <button> elements with onClick").