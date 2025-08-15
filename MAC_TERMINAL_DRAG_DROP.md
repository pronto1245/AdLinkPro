# 💻 Упрощенный способ для Mac терминала

## 🎯 Простой метод с перетаскиванием

### **Шаг 1: Подготовка папки**
```bash
# Откройте Терминал (Cmd+Space → "Terminal")
cd ~/Desktop
mkdir adlinkpro-update && cd adlinkpro-update
```

### **Шаг 2: Распаковка через перетаскивание**
1. **Введите в терминале:** `tar -xzf ` (с пробелом в конце)
2. **Перетащите** файл `ADLINKPRO_COMPLETE_PROJECT.tar.gz` из папки Downloads прямо в терминал
3. **Нажмите Enter**

Терминал автоматически подставит полный путь к файлу!

### **Шаг 3: Клонирование репозитория** 
```bash
# Замените YOUR_USERNAME на ваш GitHub логин
git clone https://github.com/YOUR_USERNAME/AdLinkPro.git existing-repo
cd existing-repo
```

### **Шаг 4: Создание backup**
```bash
git checkout -b backup-$(date +%Y%m%d)
git push origin backup-$(date +%Y%m%d)
```

### **Шаг 5: Очистка и копирование**
```bash
git checkout main
find . -maxdepth 1 -not -name '.git' -not -name '.' -delete

# Копируем новые файлы
cp -r ../client ./
cp -r ../server ./  
cp -r ../shared ./
cp -r ../migrations ./
cp -r ../public ./
cp ../package.json ./
cp ../tsconfig.json ./
cp ../vite.config.ts ./
cp ../tailwind.config.ts ./
cp ../.env.example ./
cp ../.gitignore ./
```

### **Шаг 6: Коммит и отправка**
```bash
git add .
git commit -m "feat: Complete AdLinkPro platform update v2.0"
git push origin main
```

## ✅ Готово!

**Метод с перетаскиванием очень удобный - терминал сам подставит правильный путь к файлу!**

---

## 🔄 Что происходит дальше:
- Koyeb автоматически пересоберет backend (2-3 мин)
- Netlify автоматически пересоберет frontend (1-2 мин)  
- Ваш сайт обновится с новым кодом

**Весь процесс займет 5-7 минут!**