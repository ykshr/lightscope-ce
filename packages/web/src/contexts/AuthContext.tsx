import { AuthProvider as AuthProviderType, AuthUser } from '@/helpers/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthState = {
  user: AuthUser | null;
  auth: AuthProviderType | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  auth: null,
  loading: true,
});

export const AuthProvider = ({
  auth,
  children,
}: {
  auth: AuthProviderType;
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    auth,
    loading: true,
  });

  useEffect(() => {
    const bootstrap = async () => {
      const user = await auth.getUser();
      setState({ user, auth, loading: false });
    };

    bootstrap();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
