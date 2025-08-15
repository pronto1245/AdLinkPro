# 🔧 GitHub Repository Setup Instructions

## Пошаговая инструкция по настройке GitHub репозитория

### 1. Создание репозитория на GitHub

1. Войдите в свой аккаунт GitHub
2. Нажмите "New repository" 
3. Название: `AdLinkPro`
4. Описание: `Advanced Affiliate Marketing Platform with Anti-Fraud Protection`
5. Выберите "Public" или "Private" 
6. НЕ создавайте README.md, .gitignore, license (они уже есть в проекте)
7. Нажмите "Create repository"

### 2. Загрузка кода в репозиторий

```bash
# Распакуйте архив проекта
tar -xzf ADLINKPRO_GITHUB_REPOSITORY_COMPLETE.tar.gz

# Перейдите в папку проекта  
cd AdLinkPro

# Инициализируйте git репозиторий
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit: Complete AdLinkPro platform"

# Добавьте remote origin (замените YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/AdLinkPro.git

# Отправьте код на GitHub
git branch -M main
git push -u origin main
```

### 3. Настройка GitHub Actions (CI/CD)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy AdLinkPro

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run type check
      run: npm run type-check
      
    - name: Build project
      run: npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Trigger Koyeb deployment
      run: |
        curl -X POST "${{ secrets.KOYEB_WEBHOOK_URL }}" \
          -H "Authorization: Bearer ${{ secrets.KOYEB_API_TOKEN }}"
        
  deploy-frontend:
    needs: test  
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Trigger Netlify deployment
      run: |
        curl -X POST "${{ secrets.NETLIFY_BUILD_HOOK }}"
```

### 4. Настройка Secrets в GitHub

В настройках репозитория добавьте следующие секреты:

**Settings → Secrets and variables → Actions**

```
KOYEB_API_TOKEN=your_koyeb_api_token
KOYEB_WEBHOOK_URL=your_koyeb_webhook_url
NETLIFY_BUILD_HOOK=your_netlify_build_hook
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

### 5. Настройка защищенных веток

**Settings → Branches → Add rule**

- Branch name pattern: `main`
- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### 6. Настройка тем и меток

**Issues → Labels → New label**

Создайте метки:
- `bug` (цвет: #d73a4a)  
- `enhancement` (цвет: #a2eeef)
- `documentation` (цвет: #0075ca)
- `backend` (цвет: #1d76db)
- `frontend` (цвет: #fbca04)
- `database` (цвет: #0e8a16)
- `security` (цвет: #b60205)

### 7. Создание шаблонов Issue и PR

**.github/ISSUE_TEMPLATE/bug_report.md:**
```markdown
---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

**.github/PULL_REQUEST_TEMPLATE.md:**
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature  
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist:
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
```

### 8. README значки

Добавьте в README.md значки статуса:

```markdown
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/AdLinkPro/deploy.yml)
![GitHub issues](https://img.shields.io/github/issues/YOUR_USERNAME/AdLinkPro)
![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/AdLinkPro)
![GitHub stars](https://img.shields.io/github/stars/YOUR_USERNAME/AdLinkPro)
```

### 9. Collaborators и команда

**Settings → Manage access → Invite a collaborator**

Добавьте участников команды с соответствующими правами:
- `Admin` - полный доступ
- `Write` - push в репозиторий
- `Read` - только чтение

### 10. Project Management

**Projects → New project → Board**

Создайте колонки:
- 📋 Backlog
- 🏗️ In Progress  
- 👀 In Review
- ✅ Done

### 11. Wiki настройка

**Wiki → Create the first page**

Создайте страницы:
- Home - общая информация
- API Documentation - документация API
- Development Setup - настройка разработки  
- Deployment Guide - руководство по развертыванию

---

## 🔗 Полезные команды Git

```bash
# Создание новой фичи
git checkout -b feature/new-feature
git add .
git commit -m "Add: новая функция"
git push origin feature/new-feature

# Обновление main ветки
git checkout main
git pull origin main

# Слияние фичи
git checkout main
git merge feature/new-feature
git push origin main

# Создание релиза
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

---

✅ **Ваш GitHub репозиторий готов к работе!**