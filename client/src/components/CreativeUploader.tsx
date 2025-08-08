import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";
import { Upload, FileArchive } from "lucide-react";

interface CreativeUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children?: ReactNode;
  uploaded?: boolean;
}

/**
 * Компонент загрузки креативов для офферов
 * 
 * Функции:
 * - Кнопка с иконкой для открытия модального окна загрузки
 * - Модальное окно для выбора файлов, предпросмотра и отслеживания прогресса
 * - Поддержка только ZIP архивов
 * - Визуальная индикация успешной загрузки
 * 
 * @param props - Параметры компонента
 * @param props.maxNumberOfFiles - Максимальное количество файлов (по умолчанию: 1)
 * @param props.maxFileSize - Максимальный размер файла в байтах (по умолчанию: 50MB)
 * @param props.onGetUploadParameters - Функция получения параметров загрузки
 * @param props.onComplete - Callback при завершении загрузки
 * @param props.buttonClassName - CSS класс для кнопки
 * @param props.children - Содержимое кнопки (если не указано, используется по умолчанию)
 * @param props.uploaded - Флаг успешной загрузки
 */
export function CreativeUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 52428800, // 50MB default for ZIP archives
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
  uploaded = false,
}: CreativeUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
        allowedFileTypes: ['.zip', 'application/zip'], // Только ZIP архивы
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on('complete', (result) => {
        onComplete?.(result);
        setShowModal(false);
      })
  );

  return (
    <div className="space-y-2">
      <Button 
        type="button"
        onClick={() => setShowModal(true)} 
        className={`flex items-center gap-2 ${buttonClassName}`}
        variant={uploaded ? "default" : "outline"}
        title="Загрузить ZIP архив с креативами"
      >
        {uploaded ? (
          <>
            <FileArchive className="h-4 w-4 text-green-600" />
            <span>Креативы загружены</span>
          </>
        ) : children ? (
          children
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Загрузить креативы</span>
          </>
        )}
      </Button>

      {uploaded && (
        <p className="text-xs text-muted-foreground">
          ZIP архив с креативами успешно загружен
        </p>
      )}

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
        note="Загрузите ZIP архив с креативными материалами (максимум 50MB)"
        metaFields={[
          { id: 'name', name: 'Название архива', placeholder: 'creatives.zip' },
        ]}
        locale={{
          strings: {
            dropPasteFiles: 'Перетащите ZIP архив сюда или нажмите для выбора',
            browseFolders: 'Выбрать файлы',
            uploadComplete: 'Загрузка завершена',
            uploadPaused: 'Загрузка приостановлена',
            resumeUpload: 'Продолжить загрузку',
            pauseUpload: 'Приостановить загрузку',
            retryUpload: 'Повторить загрузку',
            cancelUpload: 'Отменить загрузку',
            xFilesSelected: {
              0: '%{smart_count} файл выбран',
              1: '%{smart_count} файла выбрано',
              2: '%{smart_count} файлов выбрано'
            },
            uploading: 'Загрузка...',
            complete: 'Завершено'
          }
        }}
      />
    </div>
  );
}