const bcrypt = require('bcrypt');
const plain = 'Pub#2024!';
const hash = '$2b$10$.j9j0OKmKm6h35chftFOau/bP.nn.ECG6eKKauS3.oN6BI70i7wre';

bcrypt.compare(plain, hash).then(result => {
  console.log('✅ Совпадение пароля:', result);
});
