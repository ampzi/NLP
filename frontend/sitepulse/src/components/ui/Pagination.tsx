import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '../../utils/format';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-1 py-3">
      <span className="text-xs text-charcoal">
        صفحه {formatNumber(page)} از {formatNumber(totalPages)}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          aria-label="صفحه قبل"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/5"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          aria-label="صفحه بعد"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-stone text-ink disabled:cursor-not-allowed disabled:opacity-40 hover:bg-ink/5"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
