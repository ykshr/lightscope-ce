export type AuthUser = {
  id: string;
  role: string;
  tenantId: number;
};

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>;
  login?(): Promise<void>;
  logout?(): Promise<void>;
}
