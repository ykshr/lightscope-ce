import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Column } from './types';

export default function Header<T>({ columns }: { columns: Column<T>[] }) {
  const totalGridSpans = columns.reduce((acc, col) => acc + (col.gridSpan || 1), 0);

  return (
    <TableHeader>
      <TableRow className="border-b border-border text-xs uppercase text-muted-foreground hover:bg-transparent">
        {columns.map((col) => {
          const widthPercentage = ((col.gridSpan || 1) / totalGridSpans) * 100;

          return (
            <TableHead
              key={col.header}
              className="text-center"
              style={{ width: `${widthPercentage}%` }}
            >
              {col.header}
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
