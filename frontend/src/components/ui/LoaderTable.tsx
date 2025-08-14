import { SkeletonTable } from './skeleton';

interface LoaderTableProps {
  rows?: number;
  message?: string;
}

export default function LoaderTable({
  rows = 10,
  message = 'Carregando informações...',
}: LoaderTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </p>
        </div>
      </div>
      <SkeletonTable rows={rows} />
    </div>
  );
}
