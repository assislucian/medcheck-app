import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface FileDropZoneProps {
  onDropFiles: (type: string, files: FileList) => void;
  type: string;
  disabled?: boolean;
}

const FileDropZone = ({ onDropFiles, type, disabled = false }: FileDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(type, e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDropFiles(type, e.target.files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
        isDragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500/40"
          : "border-gray-200 bg-surface-1/50 hover:border-gray-300 hover:bg-surface-1 dark:border-border dark:bg-surface-2/40 dark:hover:bg-surface-2",
        disabled && "opacity-60 cursor-not-allowed"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
        multiple
      />
      <Upload className="h-10 w-10 text-blue-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Arraste e solte aqui</h3>
      <p className="text-muted-foreground text-sm mb-2">ou clique para selecionar arquivos</p>
      <p className="text-xs text-muted-foreground">Formatos suportados: PDF, Excel, CSV</p>
    </div>
  );
};

export default FileDropZone;
