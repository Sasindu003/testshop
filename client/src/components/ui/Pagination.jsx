import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination props:
 *   currentPage:  number
 *   totalPages:   number
 *   onPageChange: (page: number) => void
 *   siblingCount: number — pages shown around current (default 1)
 */
export default function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }) {
  if (totalPages <= 1) return null;

  // Build page number array with '…' gaps
  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const pages = (() => {
    const totalNums = siblingCount * 2 + 5; // siblings + first + last + 2 dots + current

    if (totalPages <= totalNums) return range(1, totalPages);

    const leftSib  = Math.max(currentPage - siblingCount, 1);
    const rightSib = Math.min(currentPage + siblingCount, totalPages);

    const showLeft  = leftSib > 2;
    const showRight = rightSib < totalPages - 1;

    if (!showLeft && showRight)  return [...range(1, rightSib + 1), '…', totalPages];
    if (showLeft && !showRight)  return [1, '…', ...range(leftSib - 1, totalPages)];
    return [1, '…', ...range(leftSib, rightSib), '…', totalPages];
  })();

  const btnBase =
    'flex items-center justify-center w-9 h-9 rounded text-sm font-sans transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`${btnBase} border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, i) =>
        page === '…' ? (
          <span key={`dot-${i}`} className="w-9 text-center text-secondary select-none">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${btnBase} ${
              page === currentPage
                ? 'bg-primary text-surface border border-primary'
                : 'border border-border hover:bg-background text-primary'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`${btnBase} border border-border hover:bg-background disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
