import React from 'react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-500">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Страница не найдена
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Извините, запрашиваемая страница не существует или была перемещена.
          </p>
        </div>
        <Link href="/auth/login">
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            data-testid="button-back-to-login"
          >
            Вернуться к входу
          </button>
        </Link>
      </div>
    </div>
  );
}