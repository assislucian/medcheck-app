/**
 * Componente de Upload para Demonstrativos
 * Isolado para facilitar manutenção e testes
 */
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiService } from '../../services/api';

interface DemonstrativesUploadProps {
  onUploadSuccess: () => void;
}

export function DemonstrativesUpload({ onUploadSuccess }: DemonstrativesUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadFiles(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (!uploadFiles.length) {
      toast.error('Selecione pelo menos um arquivo para upload');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      uploadFiles.forEach((file) => {
        formData.append('files', file);
      });

      await ApiService.uploadDemonstrative(formData);

      toast.success(`${uploadFiles.length} arquivo(s) processado(s) com sucesso!`);
      setUploadFiles([]);
      
      // Limpar input
      const fileInput = document.getElementById('demonstrative-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      onUploadSuccess();
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(`Erro durante o upload: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
          <Upload className="h-6 w-6 text-emerald-600" />
        </div>
        <CardTitle className="text-emerald-800">Upload de Demonstrativos</CardTitle>
        <p className="text-sm text-emerald-600">
          Envie seus demonstrativos de pagamento (PDF, Excel) para análise automática
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <input
            id="demonstrative-upload"
            type="file"
            multiple
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 
                     file:text-sm file:font-medium 
                     file:bg-emerald-100 file:text-emerald-800 
                     hover:file:bg-emerald-200 
                     file:cursor-pointer cursor-pointer"
          />
          
          {uploadFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {uploadFiles.length} arquivo(s) selecionado(s):
              </p>
              <div className="space-y-1">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded border">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploading || uploadFiles.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Enviar {uploadFiles.length > 0 ? `${uploadFiles.length} Arquivo(s)` : 'Arquivos'}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Formatos aceitos: PDF, Excel (.xlsx, .xls)</p>
          <p>• Tamanho máximo: 10MB por arquivo</p>
          <p>• Processamento automático em segundos</p>
        </div>
      </CardContent>
    </Card>
  );
}