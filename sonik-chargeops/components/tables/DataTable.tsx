'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSkeleton, EmptyState, ErrorState } from '@/components/ui/States';
import { Pagination } from '@/types';

interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  pagination?: Pagination;
  onPageChange?: (offset: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { [key: string]: any }>({
  columns,
  data,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const hasPagination = pagination && pagination.total > 0;
  const canPrev = pagination ? pagination.offset > 0 : false;
  const canNext = pagination ? pagination.offset + pagination.limit < pagination.total : false;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold select-none">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  scope="col"
                  className={`px-4 py-3.5 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <LoadingSkeleton rows={5} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-slate-50/70 transition-colors duration-150"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3.5 text-sm ${
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : col.accessor ? String(row[col.accessor] ?? '—') : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-600 gap-3">
          <div>
            Showing{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(pagination.offset + 1, pagination.total)}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(pagination.offset + pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{pagination.total}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange && onPageChange(Math.max(0, pagination.offset - pagination.limit))}
              disabled={!canPrev}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <span className="px-2 font-medium text-slate-500">
              Page {pagination.current_page} of {pagination.pages || 1}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(pagination.offset + pagination.limit)}
              disabled={!canNext}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
