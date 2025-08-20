import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Extract error messages from Zod validation errors
export function getZodErrorMessages(error: ZodError): Record<string, string> {
  const messages: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    messages[path] = err.message;
  });
  
  return messages;
}

// Get a user-friendly error message from any error
export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);
    return validationError.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
}

// Validate form data and show user-friendly errors
export function validateFormData<T>(
  schema: any, 
  data: T, 
  onError: (message: string, details?: Record<string, string>) => void
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = getZodErrorMessages(error);
      const firstError = Object.values(errorMessages)[0];
      onError(firstError || 'Проверьте правильность заполнения формы', errorMessages);
    } else {
      onError(getErrorMessage(error));
    }
    return null;
  }
}