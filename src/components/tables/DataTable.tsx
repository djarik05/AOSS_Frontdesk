import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TableSkeleton } from '../feedback/LoadingSkeleton';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => any;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyState,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col || !col.accessor) return data;

    return [...data].sort((a, b) => {
      const valA = col.accessor!(a);
      const valB = col.accessor!(b);
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const comp = valA < valB ? -1 : 1;
      return sortDirection === 'asc' ? comp : -comp;
    });
  }, [data, sortKey, sortDirection, columns]);

  if (isLoading) {
    return <TableSkeleton rows={5} />;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-[0_2px_12px_rgba(33,22,79,0.02)]',
        className
      )}
    >
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-main/60">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-text-secondary select-none',
                  col.sortable ? 'cursor-pointer hover:text-text-primary' : '',
                  col.headerClassName
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-1.5">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <span className="text-text-muted">
                      {sortKey === col.key ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-accent-violet" />
                        ) : (
                          <ArrowDown className="h-3 w-3 text-accent-violet" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40 hover:opacity-100" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {sortedData.map((row, index) => {
            const key = keyExtractor(row, index);
            return (
              <tr
                key={key}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick
                    ? 'cursor-pointer hover:bg-accent-lavender/30'
                    : 'hover:bg-bg-main/50'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-5 py-3.5 text-xs sm:text-sm text-text-primary align-middle',
                      col.className
                    )}
                  >
                    {col.render
                      ? col.render(row, index)
                      : col.accessor
                      ? col.accessor(row)
                      : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
