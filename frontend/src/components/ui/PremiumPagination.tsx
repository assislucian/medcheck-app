import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  MoreHorizontal,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  Loader2
} from 'lucide-react';

/* ========================================================================
   PREMIUM PAGINATION INTERFACES
   ======================================================================== */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal' | 'medical';
  showInfo?: boolean;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  loading?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  className?: string;
  threshold?: number;
}

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  className?: string;
  skeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
}

interface SmartTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, item: T, index: number) => React.ReactNode;
    width?: string;
  }>;
  pagination?: {
    enabled: boolean;
    pageSize: number;
    serverSide?: boolean;
  };
  sorting?: {
    enabled: boolean;
    serverSide?: boolean;
  };
  filtering?: {
    enabled: boolean;
    serverSide?: boolean;
  };
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<keyof T, string>) => void;
  className?: string;
}

/* ========================================================================
   PREMIUM PAGINATION COMPONENT
   ======================================================================== */

export const PremiumPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  className,
  variant = 'medical',
  showInfo = true,
  showPageSize = true,
  pageSizeOptions = [10, 25, 50, 100]
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const getVariantStyles = () => {
    const styles = {
      default: 'bg-white border border-gray-200 shadow-sm',
      compact: 'bg-white border border-gray-200 text-sm',
      minimal: 'bg-transparent',
      medical: 'bg-gradient-to-r from-medical-50/50 to-brand-50/50 border border-medical-200/50 backdrop-blur-sm'
    };
    return styles[variant];
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <motion.div
      className={cn(
        'flex items-center justify-between px-6 py-4 rounded-xl',
        getVariantStyles(),
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Info Section */}
      {showInfo && (
        <div className="flex items-center gap-4">
          <p className="medical-body-small text-medical-600">
            Mostrando <span className="font-semibold">{startItem}</span> a{' '}
            <span className="font-semibold">{endItem}</span> de{' '}
            <span className="font-semibold">{totalItems}</span> resultados
          </p>
          
          {showPageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label className="medical-caption text-medical-600">
                Itens por página:
              </label>
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="medical-input-enhanced px-3 py-1 text-sm border border-medical-200 rounded-lg"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2">
        {/* Previous buttons */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className={cn(
            'medical-btn-enhanced p-2 rounded-lg border border-medical-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-medical-50 transition-colors duration-200'
          )}
        >
          <ChevronsLeft className="h-4 w-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className={cn(
            'medical-btn-enhanced p-2 rounded-lg border border-medical-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-medical-50 transition-colors duration-200'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-medical-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onPageChange(page as number)}
                  disabled={loading}
                  className={cn(
                    'px-3 py-2 rounded-lg font-medium transition-all duration-200',
                    page === currentPage
                      ? 'bg-gradient-to-r from-medical-500 to-brand-600 text-white shadow-md'
                      : 'text-medical-600 hover:bg-medical-50 hover:text-medical-700'
                  )}
                >
                  {page}
                </motion.button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next buttons */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className={cn(
            'medical-btn-enhanced p-2 rounded-lg border border-medical-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-medical-50 transition-colors duration-200'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || loading}
          className={cn(
            'medical-btn-enhanced p-2 rounded-lg border border-medical-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-medical-50 transition-colors duration-200'
          )}
        >
          <ChevronsRight className="h-4 w-4" />
        </motion.button>

        {/* Loading indicator */}
        {loading && (
          <div className="ml-3 flex items-center gap-2 text-medical-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="medical-caption">Carregando...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ========================================================================
   VIRTUAL SCROLLING COMPONENT
   ======================================================================== */

export const VirtualScroll = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  loading = false,
  hasNextPage = false,
  onLoadMore,
  className,
  threshold = 3
}: VirtualScrollProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);

    // Load more when near bottom
    if (
      hasNextPage &&
      onLoadMore &&
      !loading &&
      scrollTop + containerHeight >= totalHeight - threshold * itemHeight
    ) {
      onLoadMore();
    }
  }, [hasNextPage, onLoadMore, loading, containerHeight, totalHeight, itemHeight, threshold]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {items.slice(visibleStart, visibleEnd).map((item, index) => (
            <div key={visibleStart + index} style={{ height: itemHeight }}>
              {renderItem(item, visibleStart + index)}
            </div>
          ))}
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-medical-600" />
            <span className="ml-2 medical-body text-medical-600">
              Carregando mais...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================
   INFINITE SCROLL COMPONENT
   ======================================================================== */

export const InfiniteScroll = <T,>({
  items,
  renderItem,
  loadMore,
  hasMore,
  loading = false,
  threshold = 200,
  className,
  skeleton,
  emptyState
}: InfiniteScrollProps<T>) => {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      await loadMore();
    } finally {
      setIsLoading(false);
    }
  }, [loadMore, hasMore, isLoading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore, isLoading]);

  if (items.length === 0 && !loading) {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        {emptyState || (
          <div className="text-center space-y-4">
            <div className="p-6 rounded-full bg-gradient-to-br from-medical-100 to-brand-100 mx-auto w-fit">
              <Search className="h-8 w-8 text-medical-600" />
            </div>
            <div className="space-y-2">
              <h3 className="medical-heading-tertiary text-medical-700">
                Nenhum resultado encontrado
              </h3>
              <p className="medical-body text-medical-600">
                Tente ajustar seus filtros ou termos de busca.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('space-y-4', className)}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Loading indicator / Sentinel */}
      <div ref={sentinelRef} className="py-8">
        {(isLoading || loading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center"
          >
            {skeleton || (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-medical-600" />
                <span className="ml-2 medical-body text-medical-600">
                  Carregando mais resultados...
                </span>
              </>
            )}
          </motion.div>
        )}
        
        {!hasMore && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <span className="medical-caption text-medical-500">
              Todos os resultados foram carregados
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================
   SMART TABLE WITH PREMIUM FEATURES
   ======================================================================== */

export const SmartTable = <T,>({
  data,
  columns,
  pagination = { enabled: true, pageSize: 10 },
  sorting = { enabled: true },
  filtering = { enabled: true },
  loading = false,
  onPageChange,
  onSort,
  onFilter,
  className
}: SmartTableProps<T>) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<keyof T, string>>({} as any);

  const handleSort = (key: keyof T) => {
    if (!sorting.enabled) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  const handleFilter = (key: keyof T, value: string) => {
    if (!filtering.enabled) return;
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  // Client-side data processing (if not server-side)
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (!filtering.serverSide) {
      result = result.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const itemValue = String(item[key as keyof T]).toLowerCase();
          return itemValue.includes(value.toLowerCase());
        });
      });
    }

    // Apply sorting
    if (!sorting.serverSide && sortKey) {
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        const modifier = sortDirection === 'asc' ? 1 : -1;
        
        if (aValue < bValue) return -1 * modifier;
        if (aValue > bValue) return 1 * modifier;
        return 0;
      });
    }

    return result;
  }, [data, filters, sortKey, sortDirection, filtering.serverSide, sorting.serverSide]);

  // Pagination
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pagination.pageSize);
  const paginatedData = pagination.enabled && !pagination.serverSide
    ? processedData.slice(
        (currentPage - 1) * pagination.pageSize,
        currentPage * pagination.pageSize
      )
    : processedData;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters */}
      {filtering.enabled && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {columns.filter(col => col.filterable).map(column => (
            <div key={String(column.key)} className="space-y-2">
              <label className="medical-caption text-medical-600">
                Filtrar {column.label}
              </label>
              <input
                type="text"
                placeholder={`Buscar ${column.label.toLowerCase()}...`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilter(column.key, e.target.value)}
                className="medical-input-enhanced w-full"
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="medical-card-enhanced overflow-hidden rounded-2xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead className="bg-gradient-to-r from-medical-50 to-brand-50 border-b border-medical-200/50">
              <tr>
                {columns.map(column => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      'px-6 py-4 text-left',
                      column.sortable && 'cursor-pointer hover:bg-medical-100/50 transition-colors duration-200'
                    )}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="medical-label text-medical-700">
                        {column.label}
                      </span>
                      {column.sortable && (
                        <ArrowUpDown className={cn(
                          'h-4 w-4 text-medical-400',
                          sortKey === column.key && 'text-medical-600'
                        )} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedData.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-medical-100/50 hover:bg-medical-50/30 transition-colors duration-200"
                  >
                    {columns.map(column => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-4 medical-body text-medical-700"
                      >
                        {column.render
                          ? column.render(item[column.key], item, index)
                          : String(item[column.key])
                        }
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-medical-600" />
                <span className="medical-body text-medical-600">
                  Carregando dados...
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      {pagination.enabled && totalPages > 1 && (
        <PremiumPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pagination.pageSize}
          onPageChange={handlePageChange}
          loading={loading}
          variant="medical"
        />
      )}
    </div>
  );
};

export default {
  PremiumPagination,
  VirtualScroll,
  InfiniteScroll,
  SmartTable
}; 