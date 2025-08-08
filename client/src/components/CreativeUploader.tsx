import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreativeUploaderProps {
  offerId?: string;
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters?: () => Promise<{ method: 'PUT'; url: string }>;
  onComplete?: (result: any) => void;
  uploaded?: boolean;
  buttonClassName?: string;
}

export function CreativeUploader({ 
  offerId, 
  maxNumberOfFiles = 1,
  maxFileSize = 50 * 1024 * 1024,
  onGetUploadParameters,
  onComplete,
  uploaded = false,
  buttonClassName 
}: CreativeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверяем, что это ZIP файл
      if (!file.name.toLowerCase().endsWith('.zip')) {
        toast({
          title: "Неверный формат файла",
          description: "Пожалуйста, выберите ZIP архив с креативами",
          variant: "destructive",
        });
        return;
      }

      // Проверяем размер файла
      if (file.size > maxFileSize) {
        toast({
          title: "Файл слишком большой",
          description: `Максимальный размер файла ${formatFileSize(maxFileSize)}`,
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      let uploadURL: string;
      
      if (onGetUploadParameters) {
        // Используем кастомный метод получения URL (для CreateOffer)
        const params = await onGetUploadParameters();
        uploadURL = params.url;
      } else {
        // Используем стандартный метод (для OfferDetails)
        const token = localStorage.getItem('auth_token');
        const uploadResponse = await fetch('/api/objects/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const data = await uploadResponse.json();
        uploadURL = data.uploadURL;
      }

      // Загружаем файл напрямую в облачное хранилище
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': 'application/zip',
        },
      });

      if (!fileUploadResponse.ok) {
        throw new Error('Failed to upload file');
      }

      toast({
        title: "Креативы загружены",
        description: "ZIP архив успешно загружен в облачное хранилище",
      });

      // Формируем результат в формате Uppy для совместимости
      const result = {
        successful: [{
          uploadURL: uploadURL,
          name: selectedFile.name,
          size: selectedFile.size
        }],
        failed: []
      };

      // Вызываем callback с результатом
      onComplete?.(result);
      
      // Очищаем выбранный файл
      setSelectedFile(null);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить креативы. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Загрузка креативов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Выберите ZIP архив с креативами
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Максимальный размер файла: {formatFileSize(maxFileSize)}
              </p>
              <label htmlFor="creative-upload" className="cursor-pointer">
                <Button type="button" className={`bg-blue-600 hover:bg-blue-700 text-white ${buttonClassName || ''}`}>
                  <Upload className="w-4 h-4 mr-2" />
                  Выбрать файл
                </Button>
                <input
                  id="creative-upload"
                  type="file"
                  accept=".zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium">{selectedFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
                title="Удалить файл"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Загрузить креативы
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                Отмена
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Поддерживаются только ZIP архивы</p>
          <p>• Максимальный размер файла: {formatFileSize(maxFileSize)}</p>
          <p>• Архив должен содержать изображения, баннеры и другие рекламные материалы</p>
        </div>
      </CardContent>
    </Card>
  );
}