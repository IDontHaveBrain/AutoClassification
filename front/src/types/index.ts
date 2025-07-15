// Export all i18n types
export * from './i18n';

// Import types we need to use in this file
import type { SupportedLanguage, TranslationError, TranslationFunction } from './i18n';

// Common type guards
export const isValidLanguage = (lang: string): lang is SupportedLanguage => {
  return ['ko', 'en'].includes(lang);
};

export const isTranslationError = (error: unknown): error is TranslationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as any).code === 'string' &&
    typeof (error as any).message === 'string'
  );
};

// Utility types for component props
export interface WithTranslation {
  t: TranslationFunction;
  language: SupportedLanguage;
}

export interface WithLanguage {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T = any> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination types
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResult<T = any> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  'data-testid'?: string;
}

export interface LoadingProps {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface ErrorProps {
  error?: string | Error | null;
  onRetry?: () => void;
}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  breakpoints: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Event types
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface EventHandler<T = any> {
  (event: CustomEvent<T>): void;
}

// Storage types
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

// Configuration types
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  i18n: {
    defaultLanguage: SupportedLanguage;
    fallbackLanguage: SupportedLanguage;
    debug: boolean;
  };
  features: {
    [key: string]: boolean;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Awaitable<T> = T | Promise<T>;

export type ValueOf<T> = T[keyof T];

export type Entries<T> = Array<[keyof T, T[keyof T]]>;

export type Keys<T> = Array<keyof T>;

export type Values<T> = Array<T[keyof T]>;

// Component ref types
export type ComponentRef<T = HTMLElement> = React.RefObject<T>;

export type ComponentCallback<T = any> = (value: T) => void;

export type ComponentHandler<T = any> = (event: T) => void;

// Validation types
export interface ValidationRule<T = any> {
  validator: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationSchema<T = any> {
  [key: string]: ValidationRule[];
}

// Default export - commonly used types are already exported via export * from './i18n'