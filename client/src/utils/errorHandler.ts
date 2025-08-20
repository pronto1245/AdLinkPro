export function setupGlobalErrorHandling() {
  window.addEventListener('unhandledrejection', (e: any) => {
    const st = e?.reason?.status ?? e?.detail?.status;
    if (st === 401 || st === 403) {
      try { 
        localStorage.removeItem('token'); 
        localStorage.removeItem('auth:token');
        localStorage.removeItem('auth_token');
      } catch {}
      if (location.pathname !== '/login') location.replace('/login');
      return;
    }
    console.warn('Unhandled rejection:', e?.reason ?? e);
  });
}

// Enhanced error handling for offers API
export function handleOfferError(error: any, context: string = 'Unknown') {
  console.error(`Offer error in ${context}:`, error);
  
  if (error?.message?.includes('401')) {
    return 'Необходима повторная авторизация';
  }
  
  if (error?.message?.includes('403')) {
    return 'Недостаточно прав для выполнения операции';
  }
  
  if (error?.message?.includes('404')) {
    return 'Оффер не найден';
  }
  
  if (error?.message?.includes('500')) {
    return 'Внутренняя ошибка сервера';
  }
  
  return error?.message || 'Неизвестная ошибка';
}

// Retry function for failed API requests
export async function retryApiRequest(
  requestFn: () => Promise<any>, 
  maxRetries: number = 3,
  delay: number = 1000
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Don't retry on authentication or authorization errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        throw error;
      }
      
      console.log(`Request attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}
