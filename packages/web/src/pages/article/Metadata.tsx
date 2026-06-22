import { type ArticleQuery } from '@/__generated__/graphql';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, Globe, Languages, Shapes, Tag, Users } from 'lucide-react';
import PublishStatus from './PublishStatus';

const MetaGridItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string | string[];
}) => (
  <div className="space-y-2 col-span-1 md:col-span-3">
    <div className="flex items-center gap-2 text-muted-foreground">
      {Icon && <Icon size={16} />}
      <span className="text-xs uppercase tracking-wider font-bold">{label}</span>
    </div>
    <p className={`text-card-foreground font-mono${Icon ? ' ml-6' : ''}`}>
      {Array.isArray(value)
        ? value.map((value, idx) => (
            <span key={idx} className="bg-card px-3 py-1 rounded border inline-block mr-2 mb-2">
              {value}
            </span>
          ))
        : value}
    </p>
  </div>
);

export default function Metadata({ article }: { article: NonNullable<ArticleQuery['article']> }) {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    return dateStr.toLocaleString();
  };

  return (
    <>
      {/* Main Header Card */}
      {/* Top Section: Image & Main Info & Timestamps */}
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        {/* Thumbnail */}
        <div className="w-full lg:w-80">
          <img src={article.image || ''} alt="Thumbnail" />
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-bold">{article.title}</h1>

          {/* Status Badge */}
          <PublishStatus
            publishedTime={article.publishedTime ? new Date(article.publishedTime) : undefined}
            expiredTime={article.expirationTime ? new Date(article.expirationTime) : undefined}
          />

          {/* Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-9 gap-y-2 gap-x-6">
            <MetaGridItem label="Published Time" value={formatDate(article.publishedTime)} />
            {article.modifiedTime && (
              <MetaGridItem label="Modified Time" value={formatDate(article.modifiedTime)} />
            )}
            {article.expirationTime && (
              <MetaGridItem label="Expiration Time" value={formatDate(article.expirationTime)} />
            )}
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible>
        <AccordionItem value="details">
          <AccordionTrigger>Details</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-y-2">
                {/* Column 1: DB Meta Items (Site, Locale, Section, Type) */}
                <MetaGridItem icon={Globe} label="Site Name" value={article.siteName} />
                <MetaGridItem icon={Languages} label="Locale" value={article.locale || ''} />
                <MetaGridItem icon={Shapes} label="Section" value={article.section || ''} />
                <MetaGridItem icon={FileText} label="Type" value={article.type || ''} />
              </div>
              {/* Column 2: Authors & Tags */}
              {/* Authors (Multiple, Simple Text) */}
              <MetaGridItem icon={Users} label="Authors" value={article.authors || []} />
              {/* Tags */}
              <MetaGridItem icon={Tag} label="Tags" value={article.tags} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
}
