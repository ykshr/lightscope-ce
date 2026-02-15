import { NoAuthProvider } from './noAuth';

export default function createAuthProvider() {
  return new NoAuthProvider();
}
