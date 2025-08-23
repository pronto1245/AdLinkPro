import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadResult {
  successful: Array<{
    uploadURL: string;
    name: string;
    size: number;
  }>;
  failed: Array<unknown>;
}

interface CreativeUploaderProps {
  offerId?: string;
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters?: () => Promise<{ method: 'PUT'; url: string }>;
  onComplete?: (result: UploadResult) => void;
  uploaded?: boolean;
  buttonClassName?: string;
}

export function CreativeUploader({
  maxFileSize = 50 * 1024 * 1024,
  onGetUploadParameters,
  onComplete,
  buttonClassName
}: CreativeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('🔍 Файл выбран:', file ? file.name : 'none');
    console.log('🔍 Размер файла:', file ? file.size : 0);

    if (file) {
      // Проверяем, что это ZIP файл
      if (!file.name.toLowerCase().endsWith('.zip')) {
        console.log('❌ Не ZIP файл');
        toast({
          title: 'Неверный формат файла',
          description: 'Пожалуйста, выберите ZIP архив с креативами',
          variant: 'destructive',
        });
        return;
      }

      // Проверяем размер файла
      if (file.size > maxFileSize) {
        console.log('❌ Файл слишком большой');
        toast({
          title: 'Файл слишком большой',
          description: `Максимальный размер файла ${formatFileSize(maxFileSize)}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Валидация файла пройдена');
      setSelectedFile(file);
      setUploadComplete(false);
      setUploadProgress(0);

      // Автоматически начинаем загрузку
      setTimeout(() => handleUpload(), 100);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log('❌ Нет выбранного файла');
      return;
    }

    console.log('🚀 Начало загрузки файла:', selectedFile.name);
    setUploading(true);
    setUploadProgress(10);

    try {
      let uploadURL: string;

      if (onGetUploadParameters) {
        console.log('📡 Получение upload URL через кастомный метод...');
        setUploadProgress(20);
        // Используем кастомный метод получения URL (для CreateOffer)
        const params = await onGetUploadParameters();
        uploadURL = params.url;
        console.log('✅ Upload URL получен:', uploadURL.substring(0, 50) + '...');
        setUploadProgress(40);
      } else {
        console.log('📡 Получение upload URL через стандартный метод...');
        // Используем стандартный метод (для OfferDetails)
        const token = localStorage.getItem('auth_token');
        console.log('🔑 Токен присутствует:', token ? 'да' : 'нет');

        const uploadResponse = await fetch('/api/objects/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Upload URL response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error('Upload URL error:', errorText);
          throw new Error(`Failed to get upload URL: ${uploadResponse.status}`);
        }

        const data = await uploadResponse.json();
        uploadURL = data.uploadURL;
      }

      console.log('📤 Загрузка файла в облако...');
      setUploadProgress(60);

      // Загружаем файл напрямую в облачное хранилище
      const fileUploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': 'application/zip',
        },
      });

      console.log('File upload response status:', fileUploadResponse.status);
      setUploadProgress(80);

      if (!fileUploadResponse.ok) {
        throw new Error(`Failed to upload file: ${fileUploadResponse.status}`);
      }

      setUploadProgress(100);
      setUploadComplete(true);

      toast({
        title: '✅ Креативы загружены',
        description: `Файл "${selectedFile.name}" успешно загружен`,
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

      // Через 2 секунды убираем файл из интерфейса
      setTimeout(() => {
        setSelectedFile(null);
        setUploadProgress(0);
        setUploadComplete(false);
      }, 2000);

    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      setUploadProgress(0);
      toast({
        title: '❌ Ошибка загрузки',
        description: 'Не удалось загрузить креативы. Попробуйте еще раз.',
        variant: 'destructive',
      });
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {return '0 Bytes';}
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
              <input
                id="creative-upload"
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="hidden"
                data-testid="input-file-creative"
              />
              <Button
                type="button"
                onClick={() => document.getElementById('creative-upload')?.click()}
                className={`bg-blue-600 hover:bg-blue-700 text-white transition-colors ${buttonClassName || ''}`}
                data-testid="button-upload-creative"
                title="Выбрать ZIP файл с креативами"
              >
                <Upload className="w-4 h-4 mr-2" />
                Выбрать файл
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploadComplete ? 'bg-green-100 dark:bg-green-900/30' : uploading ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {uploadComplete ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <FileText className={`w-5 h-5 ${uploading ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{selectedFile.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                    {uploading && ` • Загрузка ${uploadProgress}%`}
                    {uploadComplete && ' • ✅ Загружено'}
                  </p>
                </div>
              </div>
              {!uploading && !uploadComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  title="Удалить файл"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {uploading && (
              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {uploadComplete && (
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Файл успешно загружен!</span>
                </div>
              </div>
            )}

            {!uploading && !uploadComplete && (
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Загрузить
                </Button>
              </div>
            )}
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
