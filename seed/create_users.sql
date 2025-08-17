-- SQL скрипт для создания реальных пользователей
-- Выполните этот скрипт в вашей PostgreSQL базе данных

-- Super Admin: 9791207@gmail.com, пароль: 77GeoDav=, роль: super_admin
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('9791207@gmail.com', 'superadmin_georgy', 'SUPER_ADMIN', '$2b$10$B.A3fGqJmqXy1eMXYiLfLeiMskQRCZ/0uNayJOVWq2n/UWassgYqq', NOW())
  ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- Advertiser: 6484488@gmail.co, пароль: 7787877As, роль: advertiser
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('6484488@gmail.co', 'advertiser_alex', 'ADVERTISER', '$2b$10$52ZM0G4n3o.k4//E6nyPouUkppTRe3ixOPEM8r.tS.ruIlV7QmzpW', NOW())
  ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- Affiliate: pablota096@gmail.com, пароль: 7787877As, роль: affiliate
INSERT INTO users (email, username, role, password_hash, created_at) VALUES
  ('pablota096@gmail.com', 'affiliate_pablo', 'AFFILIATE', '$2b$10$tFEZke1i3qdeS5c87MurQeiQFzdUOXbY5BhNxWSbf6jQeY2aRuARO', NOW())
  ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();

-- Проверка созданных пользователей
SELECT id, email, username, role, created_at 
FROM users 
WHERE email IN ('9791207@gmail.com', '6484488@gmail.co', 'pablota096@gmail.com')
ORDER BY role;