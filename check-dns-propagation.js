#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const domain = 'setbet-arbit.ru';
const expectedIP = '34.117.33.233';
const expectedTXT = 'platform-verify=66eb0f916c7c6ebb228adbde1abc189a';

const dnsServers = [
  '8.8.8.8',        // Google
  '1.1.1.1',        // Cloudflare
  '208.67.222.222', // OpenDNS
  '8.8.4.4'         // Google Alternative
];

async function checkDNS() {
  console.log(`🔍 Проверяем распространение DNS для ${domain}...\n`);
  
  let aRecordFound = false;
  let txtRecordFound = false;
  
  for (const server of dnsServers) {
    console.log(`📡 Проверяем DNS сервер: ${server}`);
    
    try {
      // Проверяем A-запись
      const aCommand = `nslookup ${domain} ${server} | grep "Address:" | grep -v "#53"`;
      const { stdout: aOutput } = await execAsync(aCommand);
      
      if (aOutput && aOutput.includes(expectedIP)) {
        console.log(`✅ A-запись найдена: ${expectedIP}`);
        aRecordFound = true;
      } else if (aOutput) {
        console.log(`❌ A-запись не совпадает: ${aOutput.trim()}`);
      } else {
        console.log(`❌ A-запись не найдена`);
      }
    } catch (error) {
      console.log(`❌ Ошибка A-записи: ${error.message}`);
    }
    
    try {
      // Проверяем TXT-запись
      const txtCommand = `nslookup -type=TXT ${domain} ${server} | grep "text ="`;
      const { stdout: txtOutput } = await execAsync(txtCommand);
      
      if (txtOutput && txtOutput.includes('platform-verify=')) {
        console.log(`✅ TXT-запись найдена: ${txtOutput.trim()}`);
        txtRecordFound = true;
      } else {
        console.log(`❌ TXT-запись не найдена`);
      }
    } catch (error) {
      console.log(`❌ Ошибка TXT-записи: ${error.message}`);
    }
    
    console.log('---');
  }
  
  console.log('\n📊 РЕЗУЛЬТАТ:');
  console.log(`A-запись (${expectedIP}): ${aRecordFound ? '✅ ГОТОВО' : '❌ НЕ ГОТОВО'}`);
  console.log(`TXT-запись (верификация): ${txtRecordFound ? '✅ ГОТОВО' : '❌ НЕ ГОТОВО'}`);
  
  if (aRecordFound && txtRecordFound) {
    console.log('\n🎉 DNS записи распространились! Можно проверять домен в системе.');
    return true;
  } else {
    console.log('\n⏳ DNS записи еще распространяются. Попробуйте через 2-3 минуты.');
    return false;
  }
}

checkDNS();