import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'passport' | 'id_card' | 'license' | 'contract' | 'tax_document' | 'bank_statement' | 'other';
  file_url: string;
  file_size: number;
  mime_type: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export default function DocumentsManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    file: null as File | null
  });
  const [dragOver, setDragOver] = useState(false);

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => apiRequest('/api/partner/documents')
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { name: string; type: string; file: File }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('file', data.file);
      
      return fetch('/api/partner/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUploadDialog(false);
      setUploadForm({ name: '', type: '', file: null });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('documents.uploaded', 'Документ загружен')
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: string) => 
      apiRequest(`/api/partner/documents/${documentId}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({
        title: t('common.success', 'Успешно'),
        description: t('documents.deleted', 'Документ удален')
      });
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          variant: 'destructive',
          title: t('documents.error', 'Ошибка'),
          description: t('documents.fileTooLarge', 'Файл слишком большой (максимум 10MB)')
        });
        return;
      }
      setUploadForm(prev => ({ ...prev, file, name: prev.name || file.name }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />{t('documents.approved', 'Одобрен')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{t('documents.rejected', 'Отклонен')}</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{t('documents.pending', 'На рассмотрении')}</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: Document['type']) => {
    const types: Record<Document['type'], string> = {
      'passport': t('documents.types.passport', 'Паспорт'),
      'id_card': t('documents.types.idCard', 'Удостоверение личности'),
      'license': t('documents.types.license', 'Лицензия'),
      'contract': t('documents.types.contract', 'Договор'),
      'tax_document': t('documents.types.tax', 'Налоговый документ'),
      'bank_statement': t('documents.types.bank', 'Банковская выписка'),
      'other': t('documents.types.other', 'Другое')
    };
    return types[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents?.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getDocumentTypeLabel(doc.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{t('common.loading', 'Загрузка...')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FileText className="h-8 w-8 mr-3 text-blue-600" />
            {t('documents.title', 'Документы')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('documents.description', 'Загружайте и управляйте вашими документами')}
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              {t('documents.upload', 'Загрузить документ')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('documents.uploadNew', 'Загрузить новый документ')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="documentName">{t('documents.name', 'Название документа')}</Label>
                <Input
                  id="documentName"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('documents.namePlaceholder', 'Например: Паспорт гражданина')}
                />
              </div>

              <div>
                <Label htmlFor="documentType">{t('documents.type', 'Тип документа')}</Label>
                <Select value={uploadForm.type} onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('documents.selectType', 'Выберите тип')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passport">{t('documents.types.passport', 'Паспорт')}</SelectItem>
                    <SelectItem value="id_card">{t('documents.types.idCard', 'Удостоверение личности')}</SelectItem>
                    <SelectItem value="license">{t('documents.types.license', 'Лицензия')}</SelectItem>
                    <SelectItem value="contract">{t('documents.types.contract', 'Договор')}</SelectItem>
                    <SelectItem value="tax_document">{t('documents.types.tax', 'Налоговый документ')}</SelectItem>
                    <SelectItem value="bank_statement">{t('documents.types.bank', 'Банковская выписка')}</SelectItem>
                    <SelectItem value="other">{t('documents.types.other', 'Другое')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('documents.file', 'Файл')}</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadForm.file ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-blue-500" />
                      <div className="text-sm font-medium">{uploadForm.file.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(uploadForm.file.size)}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadForm(prev => ({ ...prev, file: null }))}
                      >
                        {t('common.remove', 'Удалить')}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm font-medium mb-2">
                        {t('documents.dragDrop', 'Перетащите файл сюда или нажмите для выбора')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('documents.fileTypes', 'PDF, JPG, PNG (максимум 10MB)')}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="mt-2" asChild>
                          <span>{t('documents.selectFile', 'Выбрать файл')}</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowUploadDialog(false)}>
                  {t('common.cancel', 'Отмена')}
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => uploadForm.file && uploadDocumentMutation.mutate({
                    name: uploadForm.name,
                    type: uploadForm.type,
                    file: uploadForm.file
                  })}
                  disabled={!uploadForm.file || !uploadForm.name || !uploadForm.type || uploadDocumentMutation.isPending}
                >
                  {uploadDocumentMutation.isPending ? t('common.uploading', 'Загрузка...') : t('common.upload', 'Загрузить')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('documents.search', 'Поиск по названию или типу')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Все')}</SelectItem>
                <SelectItem value="pending">{t('documents.pending', 'На рассмотрении')}</SelectItem>
                <SelectItem value="approved">{t('documents.approved', 'Одобрены')}</SelectItem>
                <SelectItem value="rejected">{t('documents.rejected', 'Отклонены')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('documents.allTypes', 'Все типы')}</SelectItem>
                <SelectItem value="passport">{t('documents.types.passport', 'Паспорт')}</SelectItem>
                <SelectItem value="id_card">{t('documents.types.idCard', 'Удостоверение')}</SelectItem>
                <SelectItem value="license">{t('documents.types.license', 'Лицензия')}</SelectItem>
                <SelectItem value="contract">{t('documents.types.contract', 'Договор')}</SelectItem>
                <SelectItem value="tax_document">{t('documents.types.tax', 'Налоговые')}</SelectItem>
                <SelectItem value="bank_statement">{t('documents.types.bank', 'Банковские')}</SelectItem>
                <SelectItem value="other">{t('documents.types.other', 'Другое')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {t('documents.allDocuments', 'Все документы')}
          </CardTitle>
          <CardDescription>
            {filteredDocuments.length} {t('documents.found', 'документов найдено')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <div className="text-lg font-semibold mb-2">{t('documents.empty', 'Нет документов')}</div>
              <div className="text-muted-foreground">{t('documents.emptyDescription', 'Загрузите первый документ')}</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('documents.name', 'Название')}</TableHead>
                  <TableHead>{t('documents.type', 'Тип')}</TableHead>
                  <TableHead>{t('documents.size', 'Размер')}</TableHead>
                  <TableHead>{t('common.status', 'Статус')}</TableHead>
                  <TableHead>{t('documents.uploaded', 'Загружен')}</TableHead>
                  <TableHead>{t('common.actions', 'Действия')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document: Document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <div className="font-medium">{document.name}</div>
                    </TableCell>
                    <TableCell>
                      {getDocumentTypeLabel(document.type)}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(document.file_size)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(document.status)}
                      {document.status === 'rejected' && document.rejection_reason && (
                        <div className="text-xs text-red-500 mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {document.rejection_reason}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(document.uploaded_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={document.file_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        {document.status === 'pending' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteDocumentMutation.mutate(document.id)}
                            disabled={deleteDocumentMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}