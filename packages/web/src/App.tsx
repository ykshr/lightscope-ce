import Footer from '@/components/Footer';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import authClient from '@/helpers/auth';
import Article from '@/pages/article';
import Overview from '@/pages/overview';
import Ranking from '@/pages/ranking';
import SingIn from '@/pages/SingIn';
import SingUp from '@/pages/SingUp';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';

function AppLayout() {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <Header />

      <main className="flex-1 overflow-y-auto p-10 scrollbar-hide w-full mx-auto flex flex-col gap-6">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
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
  console.log({ data, isPending });

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
