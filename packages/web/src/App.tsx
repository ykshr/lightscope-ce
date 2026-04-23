import Sidebar from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useSession } from '@/hooks/useSession';
import Article from '@/pages/article';
import SingIn from '@/pages/auth/SingIn';
import SingUp from '@/pages/auth/SingUp';
import Overview from '@/pages/overview';
import Ranking from '@/pages/ranking';
import Settings from '@/pages/settings';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

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
        element: <Overview />,
      },
      {
        path: '/ranking',
        element: <Ranking />,
      },
      {
        path: '/article',
        element: <Article />,
      },
      {
        path: '/settings',
        element: <Settings />,
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
    element: <SingIn />,
  },
  {
    path: '/signup',
    element: <SingUp />,
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
