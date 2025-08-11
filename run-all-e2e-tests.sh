#!/bin/bash

echo "=== ПОЛНОЕ ФУНКЦИОНАЛЬНОЕ ТЕСТИРОВАНИЕ САЙТА ==="
echo "Дата: $(date)"
echo ""

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Счетчики
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
ERRORS_FOUND=""

test_api() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}ТЕСТ $TOTAL_TESTS: ${description}${NC}"
    
    if [ "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$url" -H "Content-Type: application/json" -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$url" 2>/dev/null)
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ ПРОЙДЕН - HTTP $http_code${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ ПРОВАЛЕН - Ожидался HTTP $expected_status, получен HTTP $http_code${NC}"
        echo "Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        ERRORS_FOUND="$ERRORS_FOUND\n- $description: HTTP $http_code вместо $expected_status"
    fi
    echo ""
}

test_with_auth() {
    local method=$1
    local url=$2
    local token=$3
    local data=$4
    local expected_status=$5
    local description=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}ТЕСТ $TOTAL_TESTS: ${description}${NC}"
    
    if [ "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$url" -H "Authorization: Bearer $token" 2>/dev/null)
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ ПРОЙДЕН - HTTP $http_code${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        # Показываем небольшую часть ответа для проверки данных
        echo "Данные: $(echo $body | head -c 100)..."
    else
        echo -e "${RED}❌ ПРОВАЛЕН - Ожидался HTTP $expected_status, получен HTTP $http_code${NC}"
        echo "Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        ERRORS_FOUND="$ERRORS_FOUND\n- $description: HTTP $http_code вместо $expected_status"
    fi
    echo ""
}

# Базовый URL
BASE_URL="http://localhost:5000"

echo -e "${YELLOW}=== 1. ТЕСТИРОВАНИЕ АУТЕНТИФИКАЦИИ ===${NC}"

# Тест логина супер-админа
test_api "POST" "$BASE_URL/api/auth/login" '{"username":"superadmin","password":"admin123"}' "200" "Логин супер-администратора"
SUPERADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"username":"superadmin","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Тест логина рекламодателя
test_api "POST" "$BASE_URL/api/auth/login" '{"username":"advertiser1","password":"password123"}' "200" "Логин рекламодателя"
ADVERTISER_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"username":"advertiser1","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Тест логина партнёра
test_api "POST" "$BASE_URL/api/auth/login" '{"username":"partner1","password":"password123"}' "200" "Логин партнёра"
PARTNER_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" -d '{"username":"partner1","password":"password123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Проверка токенов
test_with_auth "GET" "$BASE_URL/api/auth/me" "$SUPERADMIN_TOKEN" "" "200" "Проверка токена супер-админа"
test_with_auth "GET" "$BASE_URL/api/auth/me" "$ADVERTISER_TOKEN" "" "200" "Проверка токена рекламодателя"
test_with_auth "GET" "$BASE_URL/api/auth/me" "$PARTNER_TOKEN" "" "200" "Проверка токена партнёра"

echo -e "${YELLOW}=== 2. ТЕСТИРОВАНИЕ СУПЕР-АДМИН ПАНЕЛИ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/admin/users" "$SUPERADMIN_TOKEN" "" "200" "Получение списка пользователей"
test_with_auth "GET" "$BASE_URL/api/admin/offers" "$SUPERADMIN_TOKEN" "" "200" "Получение всех офферов"
test_with_auth "GET" "$BASE_URL/api/admin/analytics" "$SUPERADMIN_TOKEN" "" "200" "Получение аналитики супер-админа"
test_with_auth "GET" "$BASE_URL/api/admin/statistics" "$SUPERADMIN_TOKEN" "" "200" "Получение статистики супер-админа"
test_with_auth "GET" "$BASE_URL/api/admin/dashboard" "$SUPERADMIN_TOKEN" "" "200" "Получение дашборда супер-админа"
test_with_auth "GET" "$BASE_URL/api/admin/settings" "$SUPERADMIN_TOKEN" "" "200" "Получение системных настроек"

echo -e "${YELLOW}=== 3. ТЕСТИРОВАНИЕ РЕКЛАМОДАТЕЛЯ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/advertiser/offers" "$ADVERTISER_TOKEN" "" "200" "Получение офферов рекламодателя"
test_with_auth "GET" "$BASE_URL/api/advertiser/partners" "$ADVERTISER_TOKEN" "" "200" "Получение партнёров рекламодателя"
test_with_auth "GET" "$BASE_URL/api/advertiser/statistics" "$ADVERTISER_TOKEN" "" "200" "Статистика рекламодателя"
test_with_auth "GET" "$BASE_URL/api/advertiser/profile/domains" "$ADVERTISER_TOKEN" "" "200" "Кастомные домены рекламодателя"
test_with_auth "GET" "$BASE_URL/api/postbacks/profiles" "$ADVERTISER_TOKEN" "" "200" "Профили постбеков рекламодателя"

echo -e "${YELLOW}=== 4. ТЕСТИРОВАНИЕ ПАРТНЁРА ===${NC}"

test_with_auth "GET" "$BASE_URL/api/partner/offers" "$PARTNER_TOKEN" "" "200" "Доступные офферы для партнёра"
test_with_auth "GET" "$BASE_URL/api/partner/statistics" "$PARTNER_TOKEN" "" "200" "Статистика партнёра"
test_with_auth "GET" "$BASE_URL/api/partner/tracking-links" "$PARTNER_TOKEN" "" "200" "Трекинговые ссылки партнёра"

echo -e "${YELLOW}=== 5. ТЕСТИРОВАНИЕ ПОСТБЕК СИСТЕМЫ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/postbacks/profiles" "$ADVERTISER_TOKEN" "" "200" "Получение профилей постбеков"
test_with_auth "GET" "$BASE_URL/api/postbacks/deliveries" "$ADVERTISER_TOKEN" "" "200" "История доставки постбеков"

echo -e "${YELLOW}=== 6. ТЕСТИРОВАНИЕ АНТИ-ФРОД СИСТЕМЫ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/antifraud/rules" "$ADVERTISER_TOKEN" "" "200" "Правила антифрода"
test_with_auth "GET" "$BASE_URL/api/antifraud/alerts" "$ADVERTISER_TOKEN" "" "200" "Алерты антифрода"

echo -e "${YELLOW}=== 7. ТЕСТИРОВАНИЕ УВЕДОМЛЕНИЙ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/notifications" "$ADVERTISER_TOKEN" "" "200" "Получение уведомлений"

echo -e "${YELLOW}=== 8. ТЕСТИРОВАНИЕ ФАЙЛОВОГО УПРАВЛЕНИЯ ===${NC}"

test_with_auth "GET" "$BASE_URL/api/advertiser/creatives" "$ADVERTISER_TOKEN" "" "200" "Получение креативов рекламодателя"

echo -e "${YELLOW}=== РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ ===${NC}"
echo "Всего тестов: $TOTAL_TESTS"
echo -e "Пройдено: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Провалено: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!${NC}"
else
    echo -e "${RED}❌ НАЙДЕНЫ ОШИБКИ:${NC}"
    echo -e "$ERRORS_FOUND"
fi

echo ""
echo "Процент успеха: $(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)%"
