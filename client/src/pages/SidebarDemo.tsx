import React from 'react';

export default function DemoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Демонстрация левого меню
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Левое меню успешно интегрировано в платформу AdLinkPro со всеми необходимыми функциями:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🎯 Основные функции
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>✅ Дашборд - центральная панель управления</li>
            <li>✅ Профиль пользователя - настройки аккаунта</li>
            <li>✅ Настройки - конфигурация системы</li>
            <li>✅ Управление ролями - контроль доступа</li>
            <li>✅ Поддержка - техническая помощь</li>
            <li>✅ Выход из системы - безопасный logout</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            🔐 Безопасность и API
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>✅ Интеграция с API для загрузки данных</li>
            <li>✅ Обработка JWT токенов</li>
            <li>✅ Автоматическое обновление токенов</li>
            <li>✅ Валидация токенов перед доступом</li>
            <li>✅ Роль-ориентированное меню</li>
            <li>✅ Защита критических функций</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            📱 Адаптивность
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>✅ Мобильная версия с overlay</li>
            <li>✅ Десктопная версия с collapse</li>
            <li>✅ Сохранение состояния меню</li>
            <li>✅ Плавные анимации переходов</li>
            <li>✅ Темная/светлая темы</li>
          </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            👥 Поддержка ролей
          </h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-300">
            <li>✅ Partner/Affiliate - партнёрское меню</li>
            <li>✅ Advertiser - меню рекламодателя</li>
            <li>✅ Owner - меню владельца</li>
            <li>✅ Super Admin - административное меню</li>
            <li>✅ Динамическое отображение элементов</li>
          </ul>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="text-green-600 dark:text-green-400 text-2xl">✅</div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              Реализация завершена
            </h3>
            <p className="text-green-800 dark:text-green-200">
              Левое меню полностью интегрировано в систему со всеми требуемыми функциями:
              API интеграция, обработка токенов, роль-ориентированная навигация, 
              адаптивный дизайн и автоматическое обновление токенов для безопасности.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 dark:text-blue-400 text-2xl">ℹ️</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Инструкция по использованию
            </h3>
            <div className="text-blue-800 dark:text-blue-200 space-y-2">
              <p><strong>Свернуть/развернуть:</strong> Нажмите кнопку в заголовке меню</p>
              <p><strong>Мобильная версия:</strong> Используйте кнопку меню в верхней панели</p>
              <p><strong>Статус токена:</strong> Отображается под именем пользователя</p>
              <p><strong>Защищённые функции:</strong> Отмечены восклицательным знаком при истечении токена</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}