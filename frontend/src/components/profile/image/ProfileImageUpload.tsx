import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X } from 'lucide-react';
import { useState } from 'react';

interface ProfileImageUploadProps {
  imagePreview: string | null;
  onImageUpload: (base64: string) => void;
  onImageRemove?: () => void;
}

export const ProfileImageUpload = ({
  imagePreview,
  onImageUpload,
  onImageRemove,
}: ProfileImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const resizeImage = (
    file: File,
    maxWidth = 150,
    maxHeight = 150,
    quality = 0.8
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular dimensões mantendo aspect ratio
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Converter para base64 JPEG com qualidade controlada
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    await processFile(file);
    e.target.value = '';
  };

  const processFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido', {
        description: 'Por favor, selecione uma imagem no formato JPG, PNG ou WebP',
      });
      return;
    }

    // Verificar tamanho original (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande', {
        description: 'A imagem deve ter no máximo 5MB',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Redimensionar e comprimir
      const resizedBase64 = await resizeImage(file, 150, 150, 0.8);

      // Verificar tamanho final em base64 (máx ~100KB)
      if (resizedBase64.length > 150000) {
        // Tentar com qualidade menor
        const compressedBase64 = await resizeImage(file, 120, 120, 0.6);
        onImageUpload(compressedBase64);
      } else {
        onImageUpload(resizedBase64);
      }

      toast.success('Foto atualizada', {
        description: 'Sua foto de perfil foi processada e otimizada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem', {
        description: 'Não foi possível processar a imagem. Tente novamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    await processFile(files[0]);
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Foto de Perfil</Label>
      <div className="flex flex-col items-center">
        <div
          className={`relative mb-4 group ${
            isDragging ? 'ring-2 ring-primary ring-offset-2' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Avatar className="h-32 w-32 border-4 border-muted shadow-lg">
            {imagePreview ? (
              <AvatarImage src={imagePreview} alt="Preview" className="object-cover" />
            ) : (
              <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                <Camera className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Botão de remover foto */}
          {imagePreview && onImageRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onImageRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="w-full max-w-xs">
          <Label htmlFor="avatar" className="w-full">
            <Button
              variant="outline"
              className="w-full cursor-pointer flex items-center gap-2"
              type="button"
              disabled={isProcessing}
              asChild
            >
              <div>
                <Upload className="h-4 w-4" />
                <span>
                  {isProcessing
                    ? 'Processando...'
                    : imagePreview
                      ? 'Trocar foto'
                      : 'Carregar foto'}
                </span>
              </div>
            </Button>
          </Label>
          <Input
            id="avatar"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleImageUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Arraste uma imagem ou clique para selecionar
            <br />
            <span className="text-primary">
              JPG, PNG ou WebP • Será redimensionada para 150x150px
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
