#!/usr/bin/env node

/**
 * Seed script для автоматического создания реальных пользователей
 * для всех трех ролей (super_admin, advertiser, affiliate)
 * 
 * Использует fetch для обращения к API регистрации и создает пользователей
 * с указанными ролями и паролями.
 * 
 * ВАЖНО: Этот скрипт предназначен для работы с полной системой регистрации.
 * Если система использует упрощенную настройку без endpoint'а регистрации,
 * скрипт покажет инструкции по настройке.
 */

// Данные пользователей для создания
const users = [
  {
    email: '9791207@gmail.com',
    username: 'superadmin_georgy',
    password: '77GeoDav=',
    role: 'super_admin',
    firstName: 'Георгий',
    lastName: 'Давыдов',
    company: 'AdLinkPro Platform'
  },
  {
    email: '6484488@gmail.co',
    username: 'advertiser_alex',
    password: '7787877As',
    role: 'advertiser',
    firstName: 'Александр',
    lastName: 'Петров',
    company: 'Marketing Agency Ltd'
  },
  {
    email: 'pablota096@gmail.com',
    username: 'affiliate_pablo',
    password: '7787877As',
    role: 'affiliate',
    firstName: 'Пабло',
    lastName: 'Таланов',
    company: 'Traffic Source Inc'
  }
];

// Базовый URL API (по умолчанию localhost:5000)
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const REGISTER_ENDPOINT = `${BASE_URL}/api/auth/register`;

/**
 * Функция для создания пользователя через API
 */
async function createUser(userData) {
  try {
    console.log(`🔄 Создание пользователя: ${userData.email} (${userData.role})`);
    
    const response = await fetch(REGISTER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    // Проверяем, получили ли мы HTML вместо JSON (значит endpoint не найден)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error(`❌ Endpoint ${REGISTER_ENDPOINT} не найден (получен HTML вместо JSON)`);
      return { 
        success: false, 
        error: 'Registration endpoint не настроен', 
        isEndpointMissing: true 
      };
    }

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`❌ Ошибка создания ${userData.email}:`, responseData.error || 'Unknown error');
      return { success: false, error: responseData.error || 'Unknown error' };
    }

    console.log(`✅ Успешно создан пользователь: ${userData.email} (${userData.role})`);
    return { success: true, data: responseData };

  } catch (error) {
    console.error(`❌ Сетевая ошибка при создании ${userData.email}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Основная функция выполнения seed скрипта
 */
async function runSeedScript() {
  console.log('🚀 Запуск seed скрипта для создания реальных пользователей');
  console.log(`📡 API URL: ${REGISTER_ENDPOINT}`);
  console.log('📋 Пользователи для создания:');
  
  users.forEach(user => {
    console.log(`   - ${user.email} (${user.role})`);
  });
  
  console.log('');

  const results = [];
  
  // Создаем пользователей последовательно
  for (const userData of users) {
    const result = await createUser(userData);
    results.push({
      email: userData.email,
      role: userData.role,
      ...result
    });
    
    // Если endpoint отсутствует, прерываем выполнение
    if (result.isEndpointMissing) {
      break;
    }
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Итоговая статистика
  console.log('\n📊 Результаты создания пользователей:');
  console.log('═'.repeat(50));
  
  // Проверяем, был ли endpoint недоступен
  const endpointMissing = results.some(r => r.isEndpointMissing);
  
  if (endpointMissing) {
    console.log('❌ Registration endpoint /api/auth/register не найден');
    console.log('\n💡 Возможные решения:');
    console.log('');
    console.log('1. 🔧 Использовать полную систему маршрутизации:');
    console.log('   - Убедитесь, что в server/index.ts вызывается registerRoutes()');
    console.log('   - Проверьте настройку базы данных');
    console.log('');
    console.log('2. 🗃️ Добавить пользователей напрямую в базу данных:');
    console.log('   - Подключитесь к PostgreSQL');
    console.log('   - Выполните SQL INSERT команды для каждого пользователя');
    console.log('');
    console.log('3. 🔌 Настроить переменные окружения:');
    console.log('   - OWNER_EMAIL=9791207@gmail.com');
    console.log('   - OWNER_PASSWORD=77GeoDav=');
    console.log('   - ADVERTISER_EMAIL=6484488@gmail.co');
    console.log('   - ADVERTISER_PASSWORD=7787877As');
    console.log('   - PARTNER_EMAIL=pablota096@gmail.com');
    console.log('   - PARTNER_PASSWORD=7787877As');
    console.log('   - ALLOW_SEED=1');
    console.log('   Затем вызвать POST /api/dev/seed-users');
    console.log('');
    console.log('4. 📝 SQL команды для прямой вставки в БД:');
    console.log('');
    printSQLCommands();
    
    process.exit(1);
  }
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  successful.forEach(result => {
    console.log(`✅ ${result.email} (${result.role}) - создан успешно`);
  });

  if (failed.length > 0) {
    console.log('\n❌ Ошибки:');
    failed.forEach(result => {
      console.log(`   ${result.email} (${result.role}) - ${result.error}`);
    });
  }

  console.log(`\n📈 Итого: ${successful.length} успешно, ${failed.length} с ошибками`);
  
  if (successful.length === users.length) {
    console.log('🎉 Все пользователи созданы успешно!');
    process.exit(0);
  } else {
    console.log('⚠️  Некоторые пользователи не были созданы. Проверьте ошибки выше.');
    process.exit(1);
  }
}

/**
 * Печать SQL команд для прямой вставки в базу данных
 */
function printSQLCommands() {
  console.log('-- SQL команды для создания пользователей:');
  console.log('-- (Выполните их в вашей PostgreSQL базе данных)');
  console.log('');
  
  users.forEach(user => {
    // Генерируем хэш пароля (в реальности нужно использовать bcrypt)
    console.log(`-- Пользователь: ${user.email} (${user.role})`);
    console.log(`INSERT INTO users (email, username, role, password_hash, created_at) VALUES`);
    console.log(`  ('${user.email}', '${user.username}', '${user.role.toUpperCase()}', '$2b$10$HASH_PASSWORD', NOW());`);
    console.log('');
  });
  
  console.log('-- Примечание: Замените $2b$10$HASH_PASSWORD на реальный bcrypt хэш пароля');
  console.log('-- Например, для пароля "77GeoDav=" хэш будет выглядеть как:');
  console.log('-- $2b$10$abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
}

/**
 * Проверка доступности API перед запуском
 */
async function checkApiAvailability() {
  try {
    console.log(`🔍 Проверка доступности API: ${BASE_URL}`);
    
    const response = await fetch(BASE_URL, {
      method: 'GET'
    });
    
    console.log(`✅ API доступен (HTTP ${response.status})`);
    return true;
  } catch (error) {
    console.error(`❌ API недоступен: ${error.message}`);
    console.log('💡 Убедитесь, что сервер запущен на', BASE_URL);
    return false;
  }
}

// Запуск скрипта
(async () => {
  try {
    // Проверяем доступность API
    const apiAvailable = await checkApiAvailability();
    
    if (!apiAvailable) {
      console.log('\n🛑 Прерывание выполнения: API недоступен');
      process.exit(1);
    }

    console.log(''); // Пустая строка для разделения
    
    // Запускаем создание пользователей
    await runSeedScript();
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  }
})();

/**
 * Проверка доступности API перед запуском
 */
async function checkApiAvailability() {
  try {
    console.log(`🔍 Проверка доступности API: ${BASE_URL}`);
    
    const response = await fetch(BASE_URL, {
      method: 'GET',
      timeout: 5000
    });
    
    console.log(`✅ API доступен (HTTP ${response.status})`);
    return true;
  } catch (error) {
    console.error(`❌ API недоступен: ${error.message}`);
    console.log('💡 Убедитесь, что сервер запущен на', BASE_URL);
    return false;
  }
}

// Запуск скрипта
(async () => {
  try {
    // Проверяем доступность API
    const apiAvailable = await checkApiAvailability();
    
    if (!apiAvailable) {
      console.log('\n🛑 Прерывание выполнения: API недоступен');
      process.exit(1);
    }

    console.log(''); // Пустая строка для разделения
    
    // Запускаем создание пользователей
    await runSeedScript();
    
  } catch (error) {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  }
})();