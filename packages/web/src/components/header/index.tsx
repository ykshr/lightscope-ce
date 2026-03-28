import ArticleFilter from '@/components/header/ArticleFilter';
import DateFilter from '@/components/header/DateFilter';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function Header() {
  const isArticle = window.location.pathname === '/article';

  return (
    <header className="flex-none px-6 py-5 border-b">
      <div className="w-full flex items-center justify-between gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2">
          <DateFilter />
          {isArticle && <ArticleFilter />}
        </div>
      </div>
    </header>
  );
}
