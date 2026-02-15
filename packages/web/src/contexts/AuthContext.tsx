import React, { createContext, useState, useEffect, useContext } from 'react';
import createAuthProvider from '@/auth';
import { AuthUser } from '@/auth/provider';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    const bootstrap = async () => {
      const auth = createAuthProvider();
      await auth.initialize();
      const user = await auth.getUser();
      setState({ user, loading: false });
    };

    bootstrap();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
