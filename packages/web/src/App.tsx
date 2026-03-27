import Footer from '@/components/Footer';
import Header from '@/components/header';
import Sidebar from '@/components/Sidebar';
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
        handle: {
          title: 'Overview',
          description: 'Site-wide performance and trend analysis',
        },
      },
      {
        path: '/ranking',
        element: <Ranking />,
        handle: {
          title: 'Ranking',
          description: 'Article ranking and performance analysis',
        },
      },
      {
        path: '/article',
        element: <Article />,
        handle: {
          type: 'article',
        },
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
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!session) {
    return <RouterProvider router={unauthenticatedRouter} />;
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
