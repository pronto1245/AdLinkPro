# Unified Registration Component Documentation

## Overview

The unified registration component eliminates code duplication between Partner and Advertiser registration forms by providing a single, configurable component that handles both registration types.

## Architecture

### Before Refactoring
- **RegisterPartner.tsx**: ~525 lines of duplicated code
- **RegisterAdvertiser.tsx**: ~545 lines of duplicated code
- **Total Duplication**: ~1070 lines with 95% code overlap

### After Refactoring
- **UnifiedRegistration.tsx**: Single component handling both roles
- **RegisterPartner.tsx**: 3 lines (thin wrapper)
- **RegisterAdvertiser.tsx**: 3 lines (thin wrapper)
- **Code Reduction**: ~500+ lines eliminated

## Component Structure

### UnifiedRegistration Component
Located: `client/src/components/auth/UnifiedRegistration.tsx`

#### Role Configuration Interface
```typescript
interface RoleConfig {
  role: 'PARTNER' | 'ADVERTISER';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
  loginPath: string;
  successMessage: string;
  bgGradient: string;
  iconColor: string;
  requiresCompany: boolean;
}
```

#### Pre-defined Configurations
```typescript
export const ROLE_CONFIGS: Record<'PARTNER' | 'ADVERTISER', RoleConfig> = {
  PARTNER: {
    role: 'PARTNER',
    title: 'Регистрация партнёра',
    subtitle: 'Присоединяйтесь к нашей партнёрской программе',
    icon: UserCheck,
    buttonText: 'Стать партнёром',
    loginPath: '/login/partner',
    successMessage: 'Ваша заявка партнёра отправлена на рассмотрение...',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-100',
    iconColor: 'text-green-600',
    requiresCompany: false,
  },
  ADVERTISER: {
    role: 'ADVERTISER',
    title: 'Регистрация рекламодателя',
    subtitle: 'Создайте аккаунт для размещения рекламных кампаний',
    icon: Building,
    buttonText: 'Зарегистрироваться как рекламодатель',
    loginPath: '/login/advertiser',
    successMessage: 'Ваша заявка рекламодателя отправлена на рассмотрение...',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    iconColor: 'text-blue-600',
    requiresCompany: true,
  },
};
```

## Usage

### Partner Registration
```typescript
import UnifiedRegistration, { ROLE_CONFIGS } from '@/components/auth/UnifiedRegistration';

export default function RegisterPartner() {
  return <UnifiedRegistration config={ROLE_CONFIGS.PARTNER} />;
}
```

### Advertiser Registration
```typescript
import UnifiedRegistration, { ROLE_CONFIGS } from '@/components/auth/UnifiedRegistration';

export default function RegisterAdvertiser() {
  return <UnifiedRegistration config={ROLE_CONFIGS.ADVERTISER} />;
}
```

## Key Features

### Role-Based Configuration
- Dynamic form fields (company field only for advertisers)
- Role-specific validation schemas
- Custom UI themes and colors
- Different success messages and redirect paths

### Enhanced Security
- Improved rate limiting (8 attempts in 10 minutes vs. 5 in 15)
- User-friendly rate limit messages with progressive feedback
- Input sanitization for all form fields
- CSRF protection and secure token management

### User Experience Improvements
- Better error messages in Russian
- Progressive rate limiting feedback ("через 5 минут" vs raw seconds)
- Consistent form validation across both roles
- Improved password strength indicators

### Form Fields
- **Common Fields**: Name, Email, Telegram, Password, Phone, Contact Info, Agreements
- **Role-Specific Fields**: Company name (advertisers only)
- **Validation**: Zod schemas with Russian language error messages
- **Security**: Input sanitization and XSS protection

## Rate Limiting Improvements

### Old Configuration
```typescript
windowMs: 15 * 60 * 1000; // 15 minutes
maxAttempts: 5;
```

### New Configuration
```typescript
windowMs: 10 * 60 * 1000; // 10 minutes (more lenient)
maxAttempts: 8; // increased for better UX
```

### User-Friendly Messages
- "Превышен лимит попыток для безопасности"
- "Попробуйте через 5 минут" (instead of "300 секунд")
- Progressive feedback with proper Russian grammar

## Testing

### Test Coverage
- Role configuration validation
- Form data processing for both roles
- Input sanitization security
- Rate limiting logic
- Password strength integration
- Component-specific features

### Running Tests
```bash
npm test -- --testPathPatterns="unified-registration"
```

## Migration Guide

### For Developers
1. **No API Changes**: Existing registration endpoints remain unchanged
2. **Same Routes**: `/auth/register/partner` and `/auth/register/advertiser` work as before  
3. **Same Functionality**: All existing features preserved
4. **Improved UX**: Better rate limiting and error messages

### For Users
1. **Visual Changes**: Subtle improvements in error messaging
2. **Better Experience**: More forgiving rate limiting
3. **Same Process**: Registration flow remains identical

## Benefits

### Code Maintenance
- **Single Source of Truth**: One component to maintain instead of two
- **DRY Principle**: Eliminated 500+ lines of duplication
- **Easier Updates**: Changes apply to both registration types automatically
- **Consistent Behavior**: Guaranteed identical logic across roles

### Security Improvements
- **Better Rate Limiting**: More user-friendly while maintaining security
- **Unified Security Logic**: Consistent security measures across both forms
- **Enhanced Error Handling**: Better user feedback without exposing system details

### User Experience
- **Clearer Messages**: Russian language rate limiting feedback
- **Progressive Delays**: More reasonable attempt limits
- **Consistent UI**: Identical behavior and styling across registration types

## Future Enhancements

### Potential Improvements
1. **Dynamic Role Addition**: Easy to add new registration types
2. **A/B Testing**: Easy to test different configurations
3. **Theme Customization**: Simple to modify colors and styling
4. **Field Customization**: Easy to add/remove fields per role

### Extension Points
```typescript
// Easy to add new roles
export const ROLE_CONFIGS = {
  PARTNER: { ... },
  ADVERTISER: { ... },
  MANAGER: { ... }, // Future role
  ADMIN: { ... },   // Future role
};
```

This refactoring provides a solid foundation for future registration requirements while significantly improving maintainability and user experience.