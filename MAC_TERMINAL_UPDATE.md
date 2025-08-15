# 💻 Обновление репозитория через терминал Mac

## 📋 Подготовка

### Шаг 1: Скачайте архив
1. Скачайте `ADLINKPRO_COMPLETE_PROJECT.tar.gz` в папку `~/Downloads`
2. Откройте **Терминал** (Cmd+Space → введите "Terminal")

### Шаг 2: Создайте рабочую папку
```bash
cd ~/Desktop
mkdir adlinkpro-update
cd adlinkpro-update
```

### Шаг 3: Распакуйте архив
```bash
tar -xzf ~/Downloads/ADLINKPRO_COMPLETE_PROJECT.tar.gz
ls -la
```

---

## 🔄 Полное обновление репозитория

### Шаг 4: Клонируйте существующий репозиторий
```bash
# Замените YOUR_USERNAME на ваш GitHub username
git clone https://github.com/YOUR_USERNAME/AdLinkPro.git existing-repo
cd existing-repo
```

### Шаг 5: Создайте backup ветку (безопасность)
```bash
# Создаем backup текущего состояния
git checkout -b backup-$(date +%Y%m%d-%H%M)
git push origin backup-$(date +%Y%m%d-%H%M)
```

### Шаг 6: Вернитесь на main и очистите
```bash
# Переключаемся на main
git checkout main

# Удаляем все файлы кроме .git
find . -maxdepth 1 -not -name '.git' -not -name '.' -delete
```

### Шаг 7: Скопируйте новые файлы
```bash
# Копируем все файлы из архива
cp -r ../client ./
cp -r ../server ./
cp -r ../shared ./
cp -r ../migrations ./
cp -r ../public ./
cp -r ../scripts ./
cp ../package.json ./
cp ../tsconfig.json ./
cp ../vite.config.ts ./
cp ../tailwind.config.ts ./
cp ../drizzle.config.ts ./
cp ../.env.example ./
cp ../.gitignore ./
```

### Шаг 8: Добавьте изменения в git
```bash
# Добавляем все файлы
git add .

# Проверяем что добавилось
git status
```

### Шаг 9: Создайте коммит
```bash
git commit -m "feat: Complete AdLinkPro platform update v2.0

- ✅ Fixed CORS issues for offer creation
- ✅ Enhanced API error handling and authentication
- ✅ Updated all dashboards with real PostgreSQL data
- ✅ Added complete deployment documentation
- ✅ Production-ready Koyeb + Netlify configs
- ✅ Removed all demo data and test records
- ✅ Improved security and stability"
```

### Шаг 10: Отправьте изменения
```bash
git push origin main
```

---

## 🚀 Альтернативный способ через Pull Request

### Если хотите использовать Pull Request:

```bash
# Создаем новую ветку для обновления
git checkout -b platform-update-v2

# Копируем файлы (шаги 7 те же)
cp -r ../client ./
# ... остальные файлы

# Коммитим в новую ветку
git add .
git commit -m "Complete platform update v2.0"
git push origin platform-update-v2
```

Затем на GitHub.com:
1. Откройте репозиторий 
2. GitHub покажет: "Compare & pull request" → нажмите
3. Создайте Pull Request
4. Merge когда готово

---

## 🔧 Проверка после обновления

### Проверьте что файлы загрузились:
```bash
ls -la
# Должны увидеть: client/ server/ shared/ package.json и т.д.
```

### Проверьте git статус:
```bash
git log --oneline -5
# Должен показать ваш коммит обновления
```

### Проверьте что push прошел:
```bash
git status
# Должно показать: "Your branch is up to date with 'origin/main'"
```

---

## 📱 Автоматические деплои

После успешного push:
- **Koyeb** получит webhook и начнет пересборку backend (2-3 мин)
- **Netlify** получит webhook и начнет пересборку frontend (1-2 мин)
- Проверьте логи деплоя в ваших панелях Koyeb/Netlify

---

## 🚨 Если возникли проблемы

### Ошибка аутентификации GitHub:
```bash
# Настройте git credentials (если первый раз)
git config --global user.name "Ваше Имя"
git config --global user.email "ваш@email.com"

# Если нужен токен доступа - создайте на github.com/settings/tokens
```

### Ошибка push:
```bash
# Принудительный push (ОСТОРОЖНО!)
git push origin main --force

# Или создайте Pull Request вместо прямого push
```

### Откат если что-то пошло не так:
```bash
# Переключитесь на backup ветку
git checkout backup-YYYYMMDD-HHMM
git checkout -b main-restored
git push origin main-restored

# Затем в GitHub сделайте main-restored основной веткой
```

---

## ✅ Готово!

Ваш репозиторий AdLinkPro обновлен через терминал Mac!

### Следующие шаги:
1. Проверьте что сайт работает после автодеплоя
2. Убедитесь что все функции работают корректно  
3. Удалите временные файлы:
```bash
cd ~/Desktop
rm -rf adlinkpro-update
```

**Обновление завершено успешно!** 🎉