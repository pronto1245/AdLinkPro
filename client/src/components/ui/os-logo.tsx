import React from 'react';
import { cn } from '@/lib/utils';

interface OsLogoProps {
  os: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const OsLogo: React.FC<OsLogoProps> = ({ os, className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const getOsIcon = (osName: string) => {
    const osLower = osName.toLowerCase();

    if (osLower.includes('windows')) {
      return (
        <svg className={cn(sizeClasses[size], className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M0 3.4L10.1 2V11.6H0V3.4ZM11.3 1.9L24 0V11.6H11.3V1.9ZM24 12.4V24L11.3 22.1V12.4H24ZM10.1 22.2L0 20.6V12.4H10.1V22.2Z" className="text-blue-500"/>
        </svg>
      );
    }

    if (osLower.includes('mac') || osLower.includes('ios')) {
      return (
        <svg className={cn(sizeClasses[size], className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.19 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" className="text-gray-600"/>
        </svg>
      );
    }

    if (osLower.includes('linux')) {
      return (
        <svg className={cn(sizeClasses[size], className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.5 2C12.3 2 12.15 2.03 12 2.06C11.85 2.03 11.7 2 11.5 2C10.26 2 9.27 3 9.27 4.22C9.27 4.31 9.28 4.4 9.29 4.5C9.1 4.77 8.95 5.08 8.84 5.42C8.46 6.55 8.46 7.77 8.84 8.9C9.05 9.5 9.37 10.04 9.78 10.5C9.83 10.56 9.88 10.61 9.94 10.66C10.28 11.05 10.69 11.38 11.16 11.63C11.41 11.77 11.69 11.87 11.97 11.95C12.03 11.97 12.1 11.98 12.16 12C12.22 11.98 12.29 11.97 12.35 11.95C12.63 11.87 12.91 11.77 13.16 11.63C13.63 11.38 14.04 11.05 14.38 10.66C14.44 10.61 14.49 10.56 14.54 10.5C14.95 10.04 15.27 9.5 15.48 8.9C15.86 7.77 15.86 6.55 15.48 5.42C15.37 5.08 15.22 4.77 15.03 4.5C15.04 4.4 15.05 4.31 15.05 4.22C15.05 3 14.06 2 12.82 2H12.5ZM11.5 3C11.78 3 12 3.22 12 3.5S11.78 4 11.5 4 11 3.78 11 3.5 11.22 3 11.5 3ZM12.5 3C12.78 3 13 3.22 13 3.5S12.78 4 12.5 4 12 3.78 12 3.5 12.22 3 12.5 3ZM10.5 13C10.22 13 10 13.22 10 13.5V17.5C10 17.78 10.22 18 10.5 18S11 17.78 11 17.5V13.5C11 13.22 10.78 13 10.5 13ZM13.5 13C13.22 13 13 13.22 13 13.5V17.5C13 17.78 13.22 18 13.5 18S14 17.78 14 17.5V13.5C14 13.22 13.78 13 13.5 13Z" className="text-orange-500"/>
        </svg>
      );
    }

    if (osLower.includes('android')) {
      return (
        <svg className={cn(sizeClasses[size], className)} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 9.48L16.38 8.26C16.18 8.06 15.86 8.06 15.66 8.26C15.46 8.46 15.46 8.78 15.66 8.98L16.88 10.2C15.93 10.8 14.8 11.15 13.6 11.15C12.4 11.15 11.27 10.8 10.32 10.2L11.54 8.98C11.74 8.78 11.74 8.46 11.54 8.26C11.34 8.06 11.02 8.06 10.82 8.26L9.6 9.48C8.75 10.33 8.25 11.48 8.25 12.75V17.25C8.25 18.77 9.48 20 11 20H16C17.52 20 18.75 18.77 18.75 17.25V12.75C18.75 11.48 18.25 10.33 17.6 9.48ZM11 18.5C10.45 18.5 10 18.05 10 17.5S10.45 16.5 11 16.5 12 16.95 12 17.5 11.55 18.5 11 18.5ZM16 18.5C15.45 18.5 15 18.05 15 17.5S15.45 16.5 16 16.5 17 16.95 17 17.5 16.55 18.5 16 18.5ZM7.5 6.5C7.36 6.5 7.25 6.39 7.25 6.25S7.36 6 7.5 6 7.75 6.11 7.75 6.25 7.64 6.5 7.5 6.5ZM16.5 6.5C16.36 6.5 16.25 6.39 16.25 6.25S16.36 6 16.5 6 16.75 6.11 16.75 6.25 16.64 6.5 16.5 6.5ZM12 2C11.5 2 11 2.5 11 3C11 3.5 11 4 11 4.5C11 5 11.5 5.5 12 5.5S13 5 13 4.5C13 4 13 3.5 13 3C13 2.5 12.5 2 12 2Z" className="text-green-500"/>
        </svg>
      );
    }

    // Default/Unknown OS icon
    return (
      <svg className={cn(sizeClasses[size], className)} viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 6H20V18H4V6ZM20 4H4C2.89 4 2 4.89 2 6V18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM12 15L15.5 11.5L17 13L12 18L7 13L8.5 11.5L12 15Z" className="text-gray-500"/>
      </svg>
    );
  };

  return (
    <div className="inline-flex items-center justify-center" title={`OS: ${os}`}>
      {getOsIcon(os)}
    </div>
  );
};

export default OsLogo;
