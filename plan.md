1.  **Update API Better Auth Configuration**:
    *   In `packages/api/src/createContext.ts`, import `importPKCS8` and `SignJWT` from `jose` (since Apple requires a JWT client secret generated with `ES256`).
    *   Add the `generateAppleClientSecret` function in `packages/api/src/createContext.ts`.
    *   Add `socialProviders` section to the `betterAuth` configuration in both `packages/api/src/createContext.ts` and `packages/api/src/types/auth.ts`.
    *   For `google`, use `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
    *   For `microsoft`, use `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET`.
    *   For `apple`, use `APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, and `APPLE_APP_BUNDLE_IDENTIFIER`. Since `betterAuth` configuration occurs synchronously, generate the secret asynchronously only if `APPLE_CLIENT_ID` is present, or pre-generate it. Note that `betterAuth` `socialProviders` might accept string or undefined. We will generate the secret within the `createContext.ts`. Wait, `createContext.ts` is async, so `await generateAppleClientSecret(...)` is fine. For `types/auth.ts`, it is synchronous. If `APPLE_PRIVATE_KEY` is not present, we skip `apple`. Let's just define them using environment variables with fallbacks.
    *   Add `https://appleid.apple.com` to `trustedOrigins`.

2.  **Update Web SingIn/SingUp Pages**:
    *   In `packages/web/src/pages/auth/SingIn.tsx` and `SingUp.tsx`, add buttons for "Sign in with Google", "Sign in with Apple", and "Sign in with Microsoft".
    *   Use `authClient.signIn.social({ provider, callbackURL: '/' })` for each provider button.
    *   Since `SingIn.tsx` and `SingUp.tsx` use the generic layout, we can add a separator (e.g., "Or continue with") and then list the social login buttons.

3.  **Update Dependencies**:
    *   Install `jose` in `@lightscope-ce/api` if not already installed correctly (it seemed to resolve with `pnpm add` earlier). Let's explicitly add it in `packages/api/package.json` and run `pnpm install`.

4.  **Complete pre-commit steps**:
    *   Ensure proper testing, verification, review, and reflection are done by running the checks.
