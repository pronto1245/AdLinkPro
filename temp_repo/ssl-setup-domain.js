#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const acme = require('acme-client');

async function setupSSLForDomain(domain) {
  console.log(`🔐 Настройка SSL для домена: ${domain}`);
  
  try {
    // Создаем директорию для Let's Encrypt данных
    const letsEncryptDir = path.join(process.cwd(), '.letsencrypt');
    const publicDir = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge');
    
    if (!fs.existsSync(letsEncryptDir)) {
      fs.mkdirSync(letsEncryptDir, { recursive: true });
    }
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    console.log('📂 Директории созданы');

    // Создаем или загружаем приватный ключ аккаунта
    const accountKeyPath = path.join(letsEncryptDir, 'account.key');
    let accountKey;
    
    if (fs.existsSync(accountKeyPath)) {
      console.log('🔑 Загружаем существующий ключ аккаунта');
      accountKey = fs.readFileSync(accountKeyPath);
    } else {
      console.log('🆕 Создаем новый ключ аккаунта');
      accountKey = await acme.forge.createPrivateKey();
      fs.writeFileSync(accountKeyPath, accountKey);
    }

    // Инициализируем ACME клиент (staging для тестов)
    const client = new acme.Client({
      directoryUrl: acme.directory.letsencrypt.staging, // Используем staging для тестов
      accountKey
    });

    console.log('🌐 ACME клиент инициализирован');

    // Создаем CSR для домена
    const [certificateKey, csr] = await acme.forge.createCsr({
      commonName: domain
    });

    console.log('📝 CSR создан для домена');

    // Заказываем сертификат
    const certificate = await client.auto({
      csr,
      email: 'admin@example.com',
      termsOfServiceAgreed: true,
      challengeCreateFn: async (authz, challenge, keyAuthorization) => {
        console.log(`🎯 Challenge создан для ${authz.identifier.value}`);
        
        if (challenge.type === 'http-01') {
          const challengePath = path.join(publicDir, challenge.token);
          fs.writeFileSync(challengePath, keyAuthorization);
          console.log(`💾 Challenge файл сохранен: ${challenge.token}`);
        }
      },
      challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
        console.log(`🧹 Challenge удален для ${authz.identifier.value}`);
        
        if (challenge.type === 'http-01') {
          const challengePath = path.join(publicDir, challenge.token);
          if (fs.existsSync(challengePath)) {
            fs.unlinkSync(challengePath);
          }
        }
      }
    });

    console.log('🎉 Сертификат получен!');

    // Сохраняем сертификат и ключ
    const certPath = path.join(letsEncryptDir, `${domain}.crt`);
    const keyPath = path.join(letsEncryptDir, `${domain}.key`);
    
    fs.writeFileSync(certPath, certificate);
    fs.writeFileSync(keyPath, certificateKey);

    console.log(`✅ SSL сертификат сохранен для ${domain}`);
    console.log(`📁 Сертификат: ${certPath}`);
    console.log(`🔑 Ключ: ${keyPath}`);

    return {
      certificate,
      privateKey: certificateKey,
      certPath,
      keyPath
    };

  } catch (error) {
    console.error('❌ Ошибка при получении SSL сертификата:', error);
    throw error;
  }
}

// Запуск если файл вызван напрямую
if (require.main === module) {
  const domain = process.argv[2];
  if (!domain) {
    console.error('Использование: node ssl-setup-domain.js <domain>');
    process.exit(1);
  }
  
  setupSSLForDomain(domain)
    .then(() => {
      console.log('🎯 SSL настройка завершена успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка SSL настройки:', error);
      process.exit(1);
    });
}

module.exports = { setupSSLForDomain };