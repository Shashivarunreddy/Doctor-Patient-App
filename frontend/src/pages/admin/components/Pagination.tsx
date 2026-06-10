import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  // Generate page numbers to show (with ellipses)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Middle pages
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const startRange = (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-zinc-100 bg-white">
      {/* Description */}
      <p className="text-sm text-zinc-500 font-medium">
        Showing <span className="font-bold text-zinc-800">{startRange}</span> to{' '}
        <span className="font-bold text-zinc-800">{endRange}</span> of{' '}
        <span className="font-bold text-zinc-800">{total}</span> results
      </p>

      {/* Page Selector Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="h-8 w-8 p-0 rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          aria-label="Go to previous page"
        >
          <ChevronLeft size={16} />
        </Button>

        {getPageNumbers().map((p, idx) => {
          if (p === '...') {
            return (
              <span
                key={`ellipses-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm font-semibold select-none"
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          const isSelected = pageNum === page;

          return (
            <Button
              key={`page-${pageNum}`}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              className={`h-8 w-8 p-0 rounded-lg text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-primary text-white hover:bg-primary/95 shadow-sm'
                  : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
              }`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isSelected ? 'page' : undefined}
            >
              {pageNum}
            </Button>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="h-8 w-8 p-0 rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          aria-label="Go to next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
