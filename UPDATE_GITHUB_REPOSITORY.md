# 🔄 Обновление существующего GitHub репозитория AdLinkPro

## Пошаговая инструкция по обновлению репозитория

### 1. Подготовка к обновлению

```bash
# Распакуйте новую версию проекта
tar -xzf ADLINKPRO_FINAL_GITHUB_READY.tar.gz

# Переименуйте package_github.json в package.json
mv package_github.json package.json

# Переименуйте README_GITHUB.md в README.md  
mv README_GITHUB.md README.md
```

### 2. Клонирование существующего репозитория

```bash
# Клонируйте ваш существующий репозиторий
git clone https://github.com/YOUR_USERNAME/AdLinkPro.git existing-repo

# Перейдите в папку существующего репо
cd existing-repo

# Сохраните текущую ветку (если есть важные изменения)
git checkout -b backup-$(date +%Y%m%d-%H%M%S)
git push origin backup-$(date +%Y%m%d-%H%M%S)

# Вернитесь на главную ветку
git checkout main
```

### 3. Замена файлов новой версией

```bash
# Удалите старые файлы (кроме .git и других служебных)
find . -maxdepth 1 -not -name '.git' -not -name '.' -not -name '..' -exec rm -rf {} +

# Скопируйте все файлы из новой версии
cp -r ../AdLinkPro-new/* ./

# Проверьте что .gitignore правильный
cat .gitignore
```

### 4. Коммит и отправка изменений

```bash
# Добавьте все изменения
git add .

# Создайте коммит с описанием обновления
git commit -m "feat: Complete AdLinkPro platform update

- ✅ Fixed CORS issues for offer creation
- ✅ Enhanced API error handling and authentication
- ✅ Improved UI/UX across all dashboards
- ✅ Added comprehensive documentation
- ✅ Production-ready deployment configuration
- ✅ Complete source code handover with all features"

# Отправьте изменения в GitHub
git push origin main
```

### 5. Создание Release (рекомендуется)

```bash
# Создайте тег для версии
git tag -a v2.0.0 -m "AdLinkPro v2.0.0 - Complete Platform Release

Key Features:
- Full affiliate marketing platform
- Anti-fraud protection system  
- Real-time analytics dashboards
- Multi-role user management
- Production deployment ready
- Complete documentation"

# Отправьте тег на GitHub
git push origin v2.0.0
```

### 6. Обновление через GitHub Web Interface

Альтернативный способ через веб-интерфейс:

1. **Создайте новую ветку** в GitHub:
   - Перейдите в репозиторий
   - Нажмите `main` → `View all branches` → `New branch`
   - Название: `platform-update-v2`

2. **Загрузите файлы через веб-интерфейс**:
   - Перейдите в ветку `platform-update-v2`
   - Нажмите `Add file` → `Upload files`
   - Перетащите все файлы из распакованного архива
   - Commit: `Complete platform update v2.0`

3. **Создайте Pull Request**:
   - `Compare & pull request`
   - Заголовок: `Complete AdLinkPro Platform Update v2.0`
   - Описание всех изменений
   - `Create pull request`

4. **Merge Pull Request**:
   - Проверьте изменения
   - `Merge pull request`
   - Удалите ветку после слияния

### 7. Обновление Deploy Keys и Secrets

Если изменились environment variables:

**В GitHub Settings → Secrets:**
```env
JWT_SECRET=ваш_новый_jwt_секрет
SESSION_SECRET=ваш_новый_session_секрет
DATABASE_URL=ваш_database_url
```

### 8. Проверка автодеплоя

После обновления репозитория:

1. **Koyeb** автоматически пересоберет backend
2. **Netlify** автоматически пересоберет frontend
3. Проверьте логи развертывания в обоих сервисах

### 9. Быстрое обновление одной командой

Создайте скрипт `update-repo.sh`:

```bash
#!/bin/bash
# Быстрое обновление репозитория

echo "🔄 Обновление AdLinkPro репозитория..."

# Распакуйте архив
tar -xzf ADLINKPRO_FINAL_GITHUB_READY.tar.gz
cd AdLinkPro

# Переименуйте файлы
mv package_github.json package.json
mv README_GITHUB.md README.md

# Инициализация git если нужно
if [ ! -d ".git" ]; then
    git init
    git remote add origin https://github.com/YOUR_USERNAME/AdLinkPro.git
fi

# Коммит и пуш
git add .
git commit -m "feat: Complete platform update v$(date +%Y.%m.%d)"
git push -u origin main

echo "✅ Репозиторий успешно обновлен!"
```

### 10. Проверочный чек-лист

После обновления проверьте:

- [ ] Репозиторий обновился на GitHub
- [ ] README.md отображается правильно
- [ ] Koyeb успешно развернул backend
- [ ] Netlify успешно развернул frontend  
- [ ] Все API endpoints работают
- [ ] Аутентификация функционирует
- [ ] База данных подключена
- [ ] CORS настроен правильно

---

## 🔧 Troubleshooting

**Проблема: Merge conflicts**
```bash
# Разрешите конфликты вручную, затем:
git add .
git commit -m "resolve: merge conflicts"
git push origin main
```

**Проблема: Не удаляются старые файлы**
```bash
# Удалите кеш git
git rm -r --cached .
git add .
git commit -m "cleanup: remove old files"
```

**Проблема: Deploy не запускается**
- Проверьте GitHub Actions во вкладке Actions
- Убедитесь что все secrets настроены
- Проверьте логи в Koyeb и Netlify

---

✅ **Ваш репозиторий AdLinkPro успешно обновлен до последней версии!**