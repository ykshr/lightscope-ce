import Footer from '@/components/page/Footer';
import Header from '@/components/page/Header';
import { ReactNode } from 'react';

interface PageProps {
  header?: ReactNode;
  children: ReactNode;
}

export default function Page({ header, children }: PageProps) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <Header>{header}</Header>

      <main className="flex-1 overflow-y-auto p-10 scrollbar-hide w-full mx-auto flex flex-col gap-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
