# 💻 Правильные команды для вашей папки AdLinkPro

## 🎯 Ваша ситуация: папка `/Users/a1/Downloads/AdLinkPro`

### **1. Переход в рабочую папку:**
```bash
cd ~/Desktop
mkdir adlinkpro-update && cd adlinkpro-update
```

### **2. Копирование файлов из вашей папки:**
```bash
# Копируем все файлы из вашей распакованной папки
cp -r /Users/a1/Downloads/AdLinkPro/* ./

# Проверяем что скопировалось
ls -la
```

### **3. Клонирование вашего GitHub репозитория:**
```bash
# Замените YOUR_USERNAME на ваш GitHub логин
git clone https://github.com/YOUR_USERNAME/AdLinkPro.git existing-repo
cd existing-repo
```

### **4. Создание backup ветки:**
```bash
git checkout -b backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
```

### **5. Очистка и обновление:**
```bash
# Переключаемся на main и очищаем
git checkout main
find . -maxdepth 1 -not -name '.git' -not -name '.' -delete

# Копируем новые файлы из нашей рабочей папки
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

### **6. Коммит и отправка:**
```bash
# Добавляем все изменения
git add .

# Создаем коммит
git commit -m "feat: Complete AdLinkPro platform update v2.0

- ✅ Fixed CORS issues for offer creation
- ✅ Enhanced API error handling  
- ✅ Updated dashboards with real PostgreSQL data
- ✅ Production-ready Koyeb + Netlify configs
- ✅ Complete documentation and deployment guides"

# Отправляем на GitHub
git push origin main
```

### **7. Очистка (после успешного обновления):**
```bash
cd ~/Desktop
rm -rf adlinkpro-update
```

## ✅ Готово!

После успешного push:
- **Koyeb** начнет автоматическую пересборку backend (2-3 мин)
- **Netlify** начнет автоматическую пересборку frontend (1-2 мин)
- Ваш сайт обновится с новым кодом

**Теперь команды точно подходят для вашей папки `/Users/a1/Downloads/AdLinkPro`!**