// Скрипт для обновления токена партнера в браузере
const partnerToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdhODNkYjU0LWI4MTAtNDQ1My1hOWE0LWM3M2VkN2MzNGYwYSIsInVzZXJuYW1lIjoicGFydG5lcjEiLCJyb2xlIjoiYWZmaWxpYXRlIiwiYWR2ZXJ0aXNlcklkIjpudWxsLCJpYXQiOjE3NTQ4NDM5NDQsImV4cCI6MTc1NDkzMDM0NH0.j1m8MJlA5azhqZV2Ljbo2ZFkCbHZmvFiahdyoR5HoEc";

// Сохраняем токен
localStorage.setItem('token', partnerToken);
localStorage.setItem('auth_token', partnerToken);

// Переход на партнерскую страницу
window.location.href = '/affiliate';

console.log('🔄 Partner token updated, redirecting to affiliate dashboard...');