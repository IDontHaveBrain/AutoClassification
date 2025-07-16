export * from './i18n';

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
    typeof (error as TranslationError).code === 'string' &&
    typeof (error as TranslationError).message === 'string'
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

export interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API response types
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Pagination types
export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
}

export interface PaginationResult<T = unknown> {
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
export interface CustomEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

export interface EventHandler<T = unknown> {
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

export type ComponentCallback<T = unknown> = (value: T) => void;

export type ComponentHandler<T = unknown> = (event: T) => void;

// Validation types
export interface ValidationRule<T = unknown> {
  validator: (value: T) => boolean | string;
  message?: string;
}

export interface ValidationSchema<_T = unknown> {
  [key: string]: ValidationRule[];
}

// API specific types
export interface SearchParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  [key: string]: unknown;
}

export interface NoticeData {
  title: string;
  content: string;
  [key: string]: unknown;
}

export interface WorkspaceData {
  name: string;
  description?: string;
  [key: string]: unknown;
}

// Alternative type to allow FormData for file uploads
export type WorkspaceUploadData = WorkspaceData | FormData;

export interface TestUploadParams {
  file?: File;
  [key: string]: unknown;
}

// Alternative interface to allow FormData and other upload formats
export type TestUploadData = TestUploadParams | FormData;

export interface TestResultParams {
  page?: number;
  size?: number;
  [key: string]: unknown;
}

// Allow for compatibility with Pageable interface used in components
export interface Pageable {
  page: number;
  size: number;
  sort?: string;
  [key: string]: unknown;
}

export interface AlertDetail {
  message: string;
  callback?: () => void;
}

// Default export - commonly used types are already exported via export * from './i18n'