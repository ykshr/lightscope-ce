import { useHandle } from '@/hooks/useHandle';
import DateFilter from '@/components/header/DateFilter';
import ArticleFilter from '@/components/header/ArticleFilter';

export default function Header() {
  const { title, description, type = 'articles' } = useHandle();

  if (type === 'none') return null;

  return (
    <header className="flex-none px-6 py-5 border-b">
      <div className="w-full flex items-center justify-between gap-4">
        <div className="pl-12 md:pl-0">
          <h2 className="text-xl font-bold leading-tight tracking-tight break-words">
            {title}
          </h2>
          <p className="text-muted-foreground text-sm font-normal hidden lg:block">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateFilter />
          {type === 'articles' && <ArticleFilter />}
        </div>
      </div>
    </header>
  );
}
