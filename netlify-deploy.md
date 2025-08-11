# Руководство по деплою на Netlify через Object Storage

## Текущая конфигурация Object Storage:
- **Bucket ID**: `replit-objstore-6b899733-6fa6-40a7-a433-b8bbe153777d`
- **Публичная папка**: `/public/` 
- **URL доступа**: `https://ваш-домен.replit.dev/public-objects/filename`

## Шаги деплоя на Netlify:

### 1. Загрузка файлов в Object Storage
Загрузите файлы сайта в папку `public` через:
- Object Storage интерфейс Replit
- Страницу `/file-upload-test` 
- API endpoints

### 2. Структура файлов для Netlify
```
public/
├── index.html          # Главная страница
├── styles.css          # Стили
├── script.js           # JavaScript
├── images/             # Изображения
│   ├── logo.png
│   └── banner.jpg
└── assets/             # Другие ресурсы
```

### 3. Настройка Netlify

#### Вариант A: Manual Deploy
1. Зайдите в Netlify Dashboard
2. Выберите "Deploy manually"
3. Укажите источник: Object Storage URL
4. URL base: `https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev/public-objects/`

#### Вариант B: Git Integration  
1. Создайте GitHub репозиторий
2. Настройте GitHub Actions для синхронизации с Object Storage
3. Подключите репозиторий к Netlify

#### Вариант C: Build Process
1. Создайте `netlify.toml` конфигурацию
2. Настройте build команды для загрузки из Object Storage
3. Автоматический деплой при изменениях

### 4. URL файлов после загрузки
После загрузки в Object Storage файлы доступны по адресам:
- `https://домен.replit.dev/public-objects/index.html`
- `https://домен.replit.dev/public-objects/styles.css`
- `https://домен.replit.dev/public-objects/images/logo.png`

### 5. Пример netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  OBJECT_STORAGE_URL = "https://e2b04e37-b05b-4d57-9368-9f629e0035bd-00-2yo71uvl8ejp3.worf.replit.dev/public-objects/"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 6. Автоматизация с GitHub Actions
```yaml
name: Deploy to Netlify via Object Storage
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Upload to Object Storage
      run: |
        # Скрипт загрузки файлов в Object Storage
        curl -X PUT "Object Storage URL" --data-binary @index.html
    - name: Deploy to Netlify
      run: |
        # Автоматический деплой через Netlify CLI
        netlify deploy --prod --dir=public
```

## Готовые файлы для тестирования:
- ✅ `test-site.html` - готовый HTML файл с CSS и JavaScript
- ✅ API endpoints настроены
- ✅ Права доступа настроены

## Следующие шаги:
1. Загрузите `test-site.html` в папку `public` Object Storage
2. Проверьте доступность файла по URL
3. Настройте Netlify deploy с указанием Object Storage как источника
4. Протестируйте автоматический деплой

После успешной загрузки файла получите прямую ссылку и используйте её для настройки Netlify!