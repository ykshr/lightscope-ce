export interface AuthUser {
  id: string;
  role?: string;
}

export default interface AuthProvider {
  initialize(): Promise<void>;
  getUser(): Promise<AuthUser | null>;
  getToken(): Promise<string | null>;
  login?(): Promise<void>;
  logout?(): Promise<void>;
}
