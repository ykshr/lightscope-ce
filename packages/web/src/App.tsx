import Sidebar from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useSession } from '@/hooks/useAuth';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

const Article = lazy(() => import('@/pages/article'));
const SingIn = lazy(() => import('@/pages/login/SingIn'));
const SingUp = lazy(() => import('@/pages/login/SingUp'));
const Overview = lazy(() => import('@/pages/overview'));
const Ranking = lazy(() => import('@/pages/ranking'));
const Settings = lazy(() => import('@/pages/settings'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}
  >
    {children}
  </Suspense>
);

const RootLayout = () => {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};

const router = createBrowserRouter([
  {
    errorElement: <></>,
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: (
          <SuspenseWrapper>
            <Overview />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/ranking',
        element: (
          <SuspenseWrapper>
            <Ranking />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/article',
        element: (
          <SuspenseWrapper>
            <Article />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/settings',
        element: (
          <SuspenseWrapper>
            <Settings />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

const unauthenticatedRouter = createBrowserRouter([
  {
    path: '/singin',
    element: (
      <SuspenseWrapper>
        <SingIn />
      </SuspenseWrapper>
    ),
  },
  {
    path: '/signup',
    element: (
      <SuspenseWrapper>
        <SingUp />
      </SuspenseWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/singin" replace />,
  },
]);

function App() {
  const { data, isPending } = useSession(0);

  if (isPending) return null;

  if (!data) {
    return <RouterProvider router={unauthenticatedRouter} />;
  }

  return <RouterProvider router={router} />;
}

export default App;
