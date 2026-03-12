import AuthProvider from './provider';
import { NoAuthProvider } from './noAuth';

export default function createAuthProvider(): AuthProvider {
  return new NoAuthProvider();
}
