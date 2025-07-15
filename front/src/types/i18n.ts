// Supported languages union type
export type SupportedLanguage = 'ko' | 'en';

// Supported language codes as const assertion for better type safety
export const SUPPORTED_LANGUAGE_CODES = ['ko', 'en'] as const;

// Language configuration interface
export interface Language {
  code: SupportedLanguage;
  name: string;
  flag: string;
}

// Extended language configuration with additional properties
export interface LanguageConfig extends Language {
  nativeName: string;
  rtl?: boolean;
  dateFormat?: string;
  numberFormat?: Intl.NumberFormatOptions;
}

// Translation key definitions
export interface TranslationKeys {
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    yes: string;
    no: string;
    ok: string;
    close: string;
    refresh: string;
    back: string;
    next: string;
    previous: string;
    submit: string;
    reset: string;
    clear: string;
    select: string;
    upload: string;
    download: string;
    copy: string;
    move: string;
    rename: string;
    view: string;
    details: string;
    settings: string;
    logout: string;
    login: string;
    register: string;
    profile: string;
    home: string;
    dashboard: string;
    menu: string;
    language: string;
    theme: string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    rememberMe: string;
    forgotPassword: string;
    invalidCredentials: string;
    passwordMismatch: string;
    emailRequired: string;
    passwordRequired: string;
    nameRequired: string;
    loginSuccess: string;
    loginFailed: string;
    registerSuccess: string;
    registerFailed: string;
    logoutSuccess: string;
    sessionExpired: string;
    accessDenied: string;
  };
  workspace: {
    title: string;
    name: string;
    description: string;
    members: string;
    datasets: string;
    classes: string;
    training: string;
    models: string;
    create: string;
    edit: string;
    delete: string;
    invite: string;
    leave: string;
    settings: string;
    overview: string;
    statistics: string;
    activity: string;
    permissions: string;
    owner: string;
    member: string;
    viewer: string;
    admin: string;
    noWorkspaces: string;
    createFirst: string;
    loadingWorkspaces: string;
    workspaceCreated: string;
    workspaceUpdated: string;
    workspaceDeleted: string;
    invitationSent: string;
    memberRemoved: string;
  };
  classification: {
    classify: string;
    upload: string;
    result: string;
    confidence: string;
    accuracy: string;
    precision: string;
    recall: string;
    fScore: string;
    predictions: string;
    labels: string;
    categories: string;
    imageClassification: string;
    textClassification: string;
    modelTraining: string;
    trainingData: string;
    testData: string;
    validationData: string;
    epochs: string;
    batchSize: string;
    learningRate: string;
    startTraining: string;
    stopTraining: string;
    trainingProgress: string;
    trainingComplete: string;
    trainingFailed: string;
    noData: string;
    uploadImages: string;
    selectModel: string;
    createModel: string;
    customModel: string;
    pretrainedModel: string;
  };
  notice: {
    title: string;
    content: string;
    author: string;
    date: string;
    create: string;
    edit: string;
    delete: string;
    view: string;
    latest: string;
    important: string;
    general: string;
    system: string;
    maintenance: string;
    update: string;
    announcement: string;
    noNotices: string;
    noticeCreated: string;
    noticeUpdated: string;
    noticeDeleted: string;
    readMore: string;
    markAsRead: string;
    unread: string;
    read: string;
  };
  navigation: {
    home: string;
    dashboard: string;
    workspaces: string;
    classification: string;
    training: string;
    datasets: string;
    models: string;
    notices: string;
    settings: string;
    profile: string;
    help: string;
    about: string;
    contact: string;
    documentation: string;
    api: string;
    support: string;
    feedback: string;
    termsOfService: string;
    privacyPolicy: string;
    version: string;
  };
  validation: {
    required: string;
    email: string;
    minLength: string;
    maxLength: string;
    pattern: string;
    numeric: string;
    positive: string;
    range: string;
    fileSize: string;
    fileType: string;
    passwordStrength: string;
    uniqueEmail: string;
    confirmPassword: string;
    invalidUrl: string;
    futureDate: string;
    pastDate: string;
  };
  errors: {
    networkError: string;
    serverError: string;
    notFound: string;
    forbidden: string;
    unauthorized: string;
    badRequest: string;
    timeout: string;
    unknown: string;
    retry: string;
    contactSupport: string;
    sessionExpired: string;
    fileUploadError: string;
    fileTooLarge: string;
    unsupportedFileType: string;
    quotaExceeded: string;
    connectionLost: string;
    saveFailed: string;
    loadFailed: string;
    deleteFailed: string;
    updateFailed: string;
  };
  notifications: {
    newNotice: string;
    workspaceInvitation: string;
    trainingComplete: string;
    trainingFailed: string;
    memberJoined: string;
    memberLeft: string;
    datasetUpdated: string;
    modelReady: string;
    systemMaintenance: string;
    quotaWarning: string;
    accountUpdate: string;
    securityAlert: string;
    markAllRead: string;
    clearAll: string;
    noNotifications: string;
    viewAll: string;
  };
}

// Namespace type definition
export type Namespace = keyof TranslationKeys;

// Translation key paths with proper type constraints
export type TranslationKeyPath<T extends Namespace = Namespace> =
  T extends keyof TranslationKeys
    ? keyof TranslationKeys[T] extends string
      ? `${T}.${keyof TranslationKeys[T]}`
      : never
    : string;

// Generic translation key type for any namespace
export type AnyTranslationKey = TranslationKeyPath<Namespace>;

// Utility type to extract keys from a specific namespace
export type NamespaceKeys<T extends Namespace> = keyof TranslationKeys[T];

// Language detection and validation types
export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  source: 'browser' | 'storage' | 'default';
}

// Translation options with proper typing
export interface TranslationOptions {
  defaultValue?: string;
  count?: number;
  context?: string;
  interpolation?: Record<string, string | number>;
  [key: string]: unknown;
}

// Enhanced translation function types with proper constraints
export type TFunction<T extends Namespace = Namespace> = {
  // Strongly typed translation function
  <K extends TranslationKeyPath<T>>(key: K, options?: TranslationOptions): string;
  // Fallback for dynamic keys
  (key: string, options?: TranslationOptions): string;
};

// Namespace-specific translation function
export type NamespacedTFunction<T extends Namespace> = {
  <K extends NamespaceKeys<T>>(key: K, options?: TranslationOptions): string;
  (key: string, options?: TranslationOptions): string;
};

// Generic translation function type
export type GenericTFunction = TFunction<Namespace>;

// Localized routing types
export interface LocalizedRoute {
  path: string;
  localizedPaths: Record<string, string>;
  component: React.ComponentType;
}

// Translation validation utilities
export interface TranslationValidator {
  isValidKey(key: string): boolean;
  isValidNamespace(namespace: string): boolean;
  getAvailableKeys(namespace?: Namespace): string[];
  validateTranslationObject(obj: unknown): obj is Partial<TranslationKeys>;
}

// Translation loading states
export type TranslationLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

// Translation resource definition
export interface TranslationResource {
  language: SupportedLanguage;
  namespace: Namespace;
  data: Record<string, string>;
  version?: string;
  lastUpdated?: Date;
}

// Translation missing key handler
export type MissingKeyHandler = (key: string, namespace?: string) => string;

// Translation interpolation context
export interface InterpolationContext {
  [key: string]: string | number | boolean | null | undefined;
}

export interface UseTranslationResult<T extends Namespace = Namespace> {
  t: TFunction<T>;
  ready: boolean;
  i18n: unknown;
  language: SupportedLanguage;
  namespace?: T;
}

// Enhanced namespace-specific translation result
export interface UseNamespaceTranslationResult<T extends Namespace> {
  t: NamespacedTFunction<T>;
  ready: boolean;
  i18n: unknown;
  language: SupportedLanguage;
  namespace: T;
  keys: NamespaceKeys<T>[];
}

export interface UseLanguageResult {
  currentLanguage: SupportedLanguage;
  availableLanguages: LanguageConfig[];
  changeLanguage: (language: SupportedLanguage) => Promise<void>;
  isLoading: boolean;
  isRTL: boolean;
  isSupported: (language: string) => language is SupportedLanguage;
  getLanguageConfig: (language: SupportedLanguage) => LanguageConfig | undefined;
}

// Language switching result
export interface LanguageSwitchResult {
  success: boolean;
  previousLanguage: SupportedLanguage;
  newLanguage: SupportedLanguage;
  error?: string;
}

// Language preference storage
export interface LanguagePreference {
  language: SupportedLanguage;
  timestamp: number;
  source: 'user' | 'auto' | 'system';
}

// RTL language detection
export type RTLLanguage = 'ar' | 'he' | 'fa' | 'ur';
export type LTRLanguage = Exclude<SupportedLanguage, RTLLanguage>;

// Text direction type
export type TextDirection = 'ltr' | 'rtl';

// Language formatting options
export interface LanguageFormattingOptions {
  dateFormat?: Intl.DateTimeFormatOptions;
  numberFormat?: Intl.NumberFormatOptions;
  currencyFormat?: Intl.NumberFormatOptions;
  relativeTimeFormat?: Intl.RelativeTimeFormatOptions;
}

// Translation cache entry
export interface TranslationCacheEntry {
  key: string;
  value: string;
  timestamp: number;
  namespace: Namespace;
  language: SupportedLanguage;
}

// Translation error types
export type TranslationError =
  | 'MISSING_KEY'
  | 'INVALID_NAMESPACE'
  | 'LOADING_FAILED'
  | 'INTERPOLATION_ERROR'
  | 'VALIDATION_ERROR';

// Translation error details
export interface TranslationErrorDetails {
  type: TranslationError;
  key: string;
  namespace?: Namespace;
  message: string;
  context?: Record<string, unknown>;
}

// Translation middleware for error handling
export type TranslationMiddleware = (
  key: string,
  options: TranslationOptions,
  next: (key: string, options: TranslationOptions) => string
) => string;

// Translation plugin interface
export interface TranslationPlugin {
  name: string;
  version: string;
  initialize: (config: Record<string, unknown>) => void;
  middleware?: TranslationMiddleware;
  onLanguageChange?: (language: SupportedLanguage) => void;
  onKeyMissing?: MissingKeyHandler;
}

// Type guard functions
export const isValidLanguage = (lang: unknown): lang is SupportedLanguage => {
  return typeof lang === 'string' && (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(lang);
};

// List of valid namespaces
const VALID_NAMESPACES = ['common', 'auth', 'navigation', 'workspace', 'notice', 'test', 'classification', 'validation', 'errors', 'notifications'] as const;

export const isValidNamespace = (ns: unknown): ns is Namespace => {
  return typeof ns === 'string' && VALID_NAMESPACES.includes(ns as Namespace);
};

// Utility type for creating translation objects
export type CreateTranslationObject<T extends Namespace> = {
  [K in NamespaceKeys<T>]: string;
};

// Utility type for partial translation objects
export type PartialTranslationObject<T extends Namespace> = Partial<CreateTranslationObject<T>>;

// Translation completion status
export interface TranslationCompletionStatus {
  namespace: Namespace;
  language: SupportedLanguage;
  totalKeys: number;
  translatedKeys: number;
  missingKeys: string[];
  completionPercentage: number;
}

// =============================================================================
// ENHANCED HOOK TYPES FOR NEW GENERIC ARCHITECTURE
// =============================================================================

// Options for the generic useI18n hook
export interface UseI18nOptions {
  namespace?: string;
  keyPrefix?: string;
  useSuspense?: boolean;
  fallbackLng?: string;
  enableCache?: boolean;
  preload?: boolean;
}

// Enhanced result type for the generic useI18n hook
export interface UseI18nResult extends UseTranslationResult {
  // Additional features
  isNamespaceLoaded: boolean;
  preloadNamespace: (namespace: string) => Promise<void>;
  clearCache: () => void;
  getCachedTranslation: (key: string) => string | null;
  translateWithFallback: (key: string, fallbackKey?: string, options?: Record<string, unknown>) => string;
  // Batch translation for performance
  translateBatch: (keys: string[]) => Record<string, string>;
}

// Types for advanced hooks
export interface UseMultipleNamespacesResult {
  isReady: boolean;
  isLoading: boolean;
  getT: (namespace: string) => TFunction;
  preloadAll: () => Promise<void>;
  hooks: UseI18nResult[];
}

export interface UseFormTranslationResult extends UseTranslationResult {
  translateError: (errorKey: string, fieldName?: string) => string;
  translateField: (fieldKey: string) => string;
}

export interface UseDynamicTranslationResult extends UseTranslationResult {
  translateDynamic: (baseKey: string, dynamicPart: string, options?: Record<string, unknown>) => string;
  translateWithInterpolation: (key: string, values: Record<string, unknown>) => string;
}

// Cache utilities types
export interface I18nCacheStats {
  totalKeys: number;
  namespaces: string[];
  languages: string[];
}

export interface I18nKeyValidation {
  missing: string[];
  existing: string[];
}

// Utility types for the new architecture
export type CacheKey = string;
export type CacheValue = string;
export type CacheMap = Map<CacheKey, CacheValue>;

// Hook configuration types
export interface HookConfig {
  enableCache?: boolean;
  preload?: boolean;
  useSuspense?: boolean;
  fallbackLng?: string;
}

// Performance monitoring types
export interface TranslationPerformanceMetrics {
  cacheHitRate: number;
  averageTranslationTime: number;
  totalTranslations: number;
  cacheSize: number;
  lastCacheClean: Date;
}