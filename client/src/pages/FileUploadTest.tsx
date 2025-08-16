import { useState } from 'react';
import { ObjectUploader } from '@/components/ObjectUploader';
import type { UploadResult } from '@uppy/core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, File, Check, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  objectPath?: string;
  uploadedAt: Date;
}

export default function FileUploadTest() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleGetUploadParameters = async () => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const data = await response.json();
      
      return {
        method: 'PUT' as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error('Error getting upload parameters:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось получить URL для загрузки",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    setIsUploading(true);
    
    try {
      for (const file of (result.successful || [])) {
        const uploadURL = file.uploadURL;
        
        // Устанавливаем ACL политику для загруженного файла
        const response = await fetch('/api/objects/metadata', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            fileURL: uploadURL
          })
        });

        if (response.ok) {
          const metadata = await response.json();
          
          const newFile: UploadedFile = {
            id: file.id || Date.now().toString(),
            name: file.name || 'unknown',
            size: file.size || 0,
            type: file.type || 'unknown',
            url: uploadURL || '',
            objectPath: metadata.objectPath,
            uploadedAt: new Date()
          };

          setUploadedFiles(prev => [...prev, newFile]);
          
          toast({
            title: "Файл загружен успешно",
            description: `${file.name} был загружен в Object Storage`
          });
        } else {
          console.error('Failed to set file metadata');
          toast({
            title: "Ошибка метаданных",
            description: "Файл загружен, но не удалось установить метаданные",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error processing upload:', error);
      toast({
        title: "Ошибка обработки",
        description: "Произошла ошибка при обработке загруженных файлов",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearFiles = () => {
    setUploadedFiles([]);
    toast({
      title: "Список очищен",
      description: "Все файлы удалены из списка"
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Тестирование Object Storage</h1>
        <p className="text-muted-foreground">
          Загрузите файлы в облачное хранилище Replit
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Загрузка файлов
          </CardTitle>
          <CardDescription>
            Выберите файлы для загрузки в Object Storage. Максимальный размер: 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ObjectUploader
            maxNumberOfFiles={5}
            maxFileSize={10485760} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleComplete}
            buttonClassName="w-full h-20 border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors"
          >
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <span className="text-lg font-medium">Загрузить файлы</span>
              <span className="text-sm">Нажмите для выбора файлов</span>
            </div>
          </ObjectUploader>
          
          {isUploading && (
            <div className="mt-4 text-center text-muted-foreground">
              <span>Обработка загруженных файлов...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Загруженные файлы ({uploadedFiles.length})
              </CardTitle>
              <CardDescription>
                Файлы в приватном хранилище Object Storage
              </CardDescription>
            </div>
            <Button onClick={clearFiles} variant="outline" size="sm">
              Очистить список
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      {file.objectPath && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {file.objectPath}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {file.uploadedAt.toLocaleTimeString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Информация о хранилище</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Bucket ID:</p>
              <p className="font-mono text-xs break-all">replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d</p>
            </div>
            <div>
              <p className="font-medium">Приватная директория:</p>
              <p className="font-mono text-xs">/.private/</p>
            </div>
            <div>
              <p className="font-medium">Публичная директория:</p>
              <p className="font-mono text-xs">/public/</p>
            </div>
            <div>
              <p className="font-medium">Максимальный размер:</p>
              <p>10 MB на файл</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}