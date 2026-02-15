import AuthProvider from './provider';

export class NoAuthProvider implements AuthProvider {
  async initialize() {}

  async getUser() {
    return null;
  }

  async getToken() {
    return null;
  }
}
