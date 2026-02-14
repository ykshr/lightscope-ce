import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Header from '@/components/header';
import Sidebar from '@/components/Sidebar';
import Overview from '@/contents/overview';
import { client, login } from '@/lib/appwrite';
import Footer from '@/components/Footer';
import Ranking from '@/contents/ranking';
import Article from '@/contents/article';

// client.ping().catch((error) => {
//   console.error('ping failed:', error);
// });

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
    ],
  },
]);

function App() {
  useEffect(() => {
    login();
  }, []);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
