import { Loading } from '@/components/common/Loading';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Column } from './types';

export default function Body<T extends { id: string | number }>({
  isLoading,
  data,
  columns,
}: {
  isLoading?: boolean;
  data: T[] | undefined;
  columns: Column<T>[];
}) {
  return (
    <TableBody className="text-sm">
      {isLoading && !data && (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            <Loading />
          </TableCell>
        </TableRow>
      )}
      {!isLoading && (!data || data.length === 0) && (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No data available.
          </TableCell>
        </TableRow>
      )}
      {data &&
        data.map((item, idx) => (
          <TableRow
            key={item.id}
            className="group hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
          >
            {columns.map((col) => (
              <TableCell key={`${item.id}-${col.header}`}>
                <div className={`max-h-[7em] overflow-y-auto ${col.className}`}>
                  {col.render
                    ? col.render(item, idx)
                    : (item[col.accessorKey as keyof T] as React.ReactNode)}
                </div>
              </TableCell>
            ))}
          </TableRow>
        ))}
    </TableBody>
  );
}
