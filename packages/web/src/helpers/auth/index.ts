export type AuthUser = {
  id: string;
  role: string;
  tenantId: string;
};

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>;
  login?(): Promise<void>;
  logout?(): Promise<void>;
}
