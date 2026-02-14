import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useUrlParams } from '@/hooks/useUrl';

export default function TablePagination({
  page,
  totalCount,
  itemsPerPage = 10,
}: {
  page: number;
  totalCount?: number;
  itemsPerPage?: number;
}) {
  const [, updateUrlParams] = useUrlParams();

  const totalPages = totalCount ? Math.ceil(totalCount / itemsPerPage) : 0;

  return (
    <>
      {totalCount !== undefined && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) updateUrlParams({ page: page - 1 });
                }}
                aria-disabled={page <= 1}
                className={
                  page <= 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {[...Array(Math.min(totalPages, 10))].map((_, i) => {
              const pageNum = i + 1;
              // 大規模データの場合はここを調整して ... (Ellipsis) を入れる
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={page === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      updateUrlParams({ page: pageNum });
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {totalPages > 10 && <PaginationEllipsis />}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) updateUrlParams({ page: page + 1 });
                }}
                aria-disabled={page >= totalPages}
                className={
                  page >= totalPages
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
