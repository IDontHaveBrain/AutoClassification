// Re-export all types from the i18n module
export * from './i18n';

// Import types for use in CommonTypes
import type {
  LanguageConfig,
  Namespace,
  SupportedLanguage,
  TFunction,
  TranslationKeys,
  UseLanguageResult,
  UseTranslationResult,
} from './i18n';

// Additional common types that might be needed
export interface CommonError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: CommonError;
  success: boolean;
  timestamp: number;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Type utilities
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
};

// Form-related types
export interface FormField<T = unknown> {
  value: T;
  error?: string;
  touched?: boolean;
  dirty?: boolean;
}

export interface FormState<T extends Record<string, unknown>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Event types
export interface CustomEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface ComponentWithChildren extends BaseComponentProps {
  children?: React.ReactNode;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface ThemeBreakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeSpacing {
  unit: number;
  scale: number[];
}

export interface Theme {
  colors: ThemeColors;
  breakpoints: ThemeBreakpoints;
  spacing: ThemeSpacing;
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
}

// Validation types
export interface ValidationRule<T = unknown> {
  validate: (value: T) => boolean | string;
  message?: string;
  priority?: number;
}

export type ValidationSchema<T extends Record<string, unknown>> = {
  [Field in keyof T]?: ValidationRule<T[Field]>[];
};

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Storage types
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string;
  serialize?: (data: unknown) => string;
  deserialize?: (data: string) => unknown;
}

// Permission types
export type Permission = 'read' | 'write' | 'delete' | 'admin';
export type Role = 'viewer' | 'editor' | 'admin' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner: User;
  members: User[];
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  permissions?: Permission[];
  badge?: string | number;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

// Modal types
export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
}

// Notification types
export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface Notification extends NotificationOptions {
  id: string;
  timestamp: number;
  read: boolean;
}

// File types
export interface FileUploadOptions {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onProgress?: (progress: number) => void;
  onSuccess?: (file: File, response: unknown) => void;
  onError?: (file: File, error: Error) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
  metadata?: Record<string, unknown>;
}

// Search types
export interface SearchOptions {
  query: string;
  filters?: Record<string, unknown>;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface SearchResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets?: Record<string, unknown>;
}

// Chart/Graph types
export interface ChartDataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter';
}

export interface ChartOptions {
  title?: string;
  xAxis?: {
    title?: string;
    type?: 'category' | 'number' | 'date';
  };
  yAxis?: {
    title?: string;
    min?: number;
    max?: number;
  };
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip?: {
    enabled?: boolean;
    format?: (value: unknown) => string;
  };
}

// Table types
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
}

export interface TableProps<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  selection?: {
    type: 'checkbox' | 'radio';
    selectedRowKeys: string[];
    onChange: (selectedRowKeys: string[], selectedRows: T[]) => void;
  };
}

// Date/Time types
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeRange {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface DateTimeRange {
  start: Date;
  end: Date;
}

// Utility function types
export type Debounced<T extends (...args: never[]) => unknown> = T & {
  cancel: () => void;
  flush: () => void;
};

export type Throttled<T extends (...args: never[]) => unknown> = T & {
  cancel: () => void;
};

// Hook types
export interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  deps?: React.DependencyList;
}

export interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<T>;
  reset: () => void;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    [key: string]: boolean;
  };
  limits: {
    maxFileSize: number;
    maxFiles: number;
    requestTimeout: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsProvider {
  track: (event: AnalyticsEvent) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  page: (name: string, properties?: Record<string, unknown>) => void;
}

// Error boundary types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface ErrorBoundaryProps {
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

// Testing types
export interface TestOptions {
  timeout?: number;
  retries?: number;
  skip?: boolean;
  only?: boolean;
}

export interface MockFunction<T extends (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  mockReturnValue: (value: ReturnType<T>) => void;
  mockImplementation: (fn: T) => void;
  mockResolvedValue: (value: ReturnType<T>) => void;
  mockRejectedValue: (error: Error) => void;
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
}

// Export default collection of commonly used types
export type CommonTypes = {
  SupportedLanguage: SupportedLanguage;
  Namespace: Namespace;
  TFunction: TFunction;
  UseTranslationResult: UseTranslationResult;
  UseLanguageResult: UseLanguageResult;
  TranslationKeys: TranslationKeys;
  LanguageConfig: LanguageConfig;
  LoadingState: LoadingState;
  AsyncState: AsyncState<unknown>;
  CommonError: CommonError;
  ApiResponse: ApiResponse<unknown>;
  User: User;
  Workspace: Workspace;
  NotificationOptions: NotificationOptions;
  BaseComponentProps: BaseComponentProps;
  ComponentWithChildren: ComponentWithChildren;
};