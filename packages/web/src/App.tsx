import Sidebar from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import authClient from '@/helpers/auth';
import Article from '@/pages/article';
import SingIn from '@/pages/auth/SingIn';
import SingUp from '@/pages/auth/SingUp';
import Overview from '@/pages/overview';
import Ranking from '@/pages/ranking';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    errorElement: <></>,
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
  const { data, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!data) {
    return <RouterProvider router={unauthenticatedRouter} />;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <RouterProvider router={router} />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
