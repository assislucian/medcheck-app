import React from 'react';
import FileDropZone from './FileDropZone';
import { FileType } from '@/types/upload';

interface UploadDropzoneAreaProps {
  handleFileChangeByType: (type: FileType, files: FileList) => Promise<void>;
  isUploading: boolean;
  hasFile: (type: FileType) => boolean;
}

const UploadDropzoneArea = ({
  handleFileChangeByType,
  isUploading,
  hasFile,
}: UploadDropzoneAreaProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FileDropZone
        type="guia"
        onDropFiles={handleFileChangeByType}
        disabled={isUploading}
        hasFiles={hasFile('guia')}
      />
      <FileDropZone
        type="demonstrativo"
        onDropFiles={handleFileChangeByType}
        disabled={isUploading}
        hasFiles={hasFile('demonstrativo')}
      />
    </div>
  );
};

export default UploadDropzoneArea;
