// JavaScript для выполнения в браузере - создание тестового оффера
// Открыть https://ad-link-pro-karaterezzas.replit.app/advertiser/create-offer
// Запустить этот код в консоли браузера

const createTestOffer = () => {
  console.log('🚀 Начинаю создание тестового оффера...');
  
  // Заполнение основных полей
  const nameInput = document.querySelector('input[data-testid="input-name"]');
  if (nameInput) {
    nameInput.value = `Тестовый оффер ${new Date().toLocaleTimeString()}`;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Название заполнено');
  }
  
  const descInput = document.querySelector('textarea[data-testid="textarea-description"]');
  if (descInput) {
    descInput.value = 'Описание тестового оффера для проверки функциональности';
    descInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Описание заполнено');
  }
  
  const payoutInput = document.querySelector('input[data-testid="input-payout"]');
  if (payoutInput) {
    payoutInput.value = '100';
    payoutInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Выплата заполнена');
  }
  
  const urlInput = document.querySelector('input[data-testid="input-landing-url"]');
  if (urlInput) {
    urlInput.value = 'https://example.com/test-landing';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ URL заполнен');
  }
  
  // Небольшая задержка перед отправкой
  setTimeout(() => {
    const createButton = document.querySelector('button:contains("Создать оффер")') || 
                        Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent.includes('Создать оффер'));
    
    if (createButton) {
      console.log('🎯 Нажимаю кнопку создания оффера...');
      createButton.click();
    } else {
      console.log('❌ Кнопка создания не найдена');
    }
  }, 1000);
};

createTestOffer();