/**
 * @deprecated This legacy strings file has been migrated to the new i18n system.
 *
 * ⚠️  DEPRECATION NOTICE:
 * This file is deprecated and will be removed in a future version.
 * All strings have been migrated to the new i18n system using react-i18next.
 *
 * 🔄 MIGRATION GUIDE:
 *
 * Instead of: import { Strings } from './utils/strings'
 * Use: import { useTranslation } from 'react-i18next'
 *
 * Example:
 * ```typescript
 * // Old way (deprecated)
 * const message = Strings.Common.apiSuccess;
 *
 * // New way (recommended)
 * const { t } = useTranslation();
 * const message = t('common.messages.apiSuccess');
 * ```
 *
 * 📋 COMPLETE MIGRATION MAPPING:
 *
 * Legacy String                              → New i18n Key
 * ────────────────────────────────────────────────────────────────
 *
 * 🏷️  COMMON STRINGS:
 * Strings.Common.ok                         → t('common.buttons.ok')
 * Strings.Common.loginSuccess               → t('auth.login.loginSuccess')
 * Strings.Common.loginFailed                → t('auth.login.loginFailed')
 * Strings.Common.title                      → t('common.forms.title')
 * Strings.Common.content                    → t('common.forms.content')
 * Strings.Common.notice                     → t('common.notice')
 * Strings.Common.apiSuccess                 → t('common.messages.apiSuccess')
 * Strings.Common.apiFailed                  → t('common.messages.apiFailed')
 * Strings.Common.noData                     → t('common.messages.noData')
 * Strings.Common.notEmpty                   → t('common.messages.notEmpty')
 * Strings.Common.wait                       → t('common.messages.wait')
 *
 * 🧪 TEST STRINGS:
 * Strings.FreeTest.classifyTest             → t('test.classify.classifyTest')
 * Strings.FreeTest.requestTest              → t('test.classify.requestTest')
 *
 * 📢 NOTICE STRINGS:
 * Strings.Notice.update                     → t('notice.messages.update')
 * Strings.Notice.add                        → t('notice.messages.add')
 * Strings.Notice.updateFailed               → t('notice.messages.updateFailed')
 * Strings.Notice.addFailed                  → t('notice.messages.addFailed')
 *
 * 🏢 WORKSPACE STRINGS:
 * Strings.Workspace.update                  → t('workspace.messages.update')
 * Strings.Workspace.add                     → t('workspace.messages.add')
 * Strings.Workspace.updateFailed            → t('workspace.messages.updateFailed')
 * Strings.Workspace.addFailed               → t('workspace.messages.addFailed')
 *
 * 🔐 AUTH STRINGS:
 * Strings.Auth.passwordRequirements         → t('auth.password.requirements')
 * Strings.Auth.passwordMinLength            → t('auth.password.minLength')
 * Strings.Auth.passwordMustHaveNumber       → t('auth.password.mustHaveNumber')
 * Strings.Auth.passwordMustHaveSpecial      → t('auth.password.mustHaveSpecial')
 * Strings.Auth.passwordValidationError      → t('auth.password.validationError')
 *
 * 📁 TRANSLATION FILES LOCATION:
 * - English: /public/locales/en/*.json
 * - Korean:  /public/locales/ko/*.json
 *
 * 🗂️  FILE STRUCTURE:
 * - common.json    → General UI components, buttons, forms, messages
 * - auth.json      → Authentication and user management
 * - test.json      → Classification testing features
 * - notice.json    → Notice management system
 * - workspace.json → Workspace management features
 * - navigation.json → Navigation and menu items
 *
 * 🔧 SETUP IN COMPONENTS:
 * ```typescript
 * import { useTranslation } from 'react-i18next';
 *
 * function MyComponent() {
 *   const { t } = useTranslation(['common', 'auth']); // Load specific namespaces
 *   // Or just: const { t } = useTranslation(); // Auto-loads all namespaces
 *
 *   return (
 *     <div>
 *       <button>{t('common.buttons.ok')}</button>
 *       <p>{t('common.messages.apiSuccess')}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * 🌐 LANGUAGE SWITCHING:
 * The new i18n system supports automatic language switching.
 * Use the LanguageSelector component or i18n.changeLanguage() function.
 *
 * ⚡ BENEFITS OF NEW SYSTEM:
 * - Automatic language switching
 * - Better organization with namespaces
 * - Smaller bundle size (lazy loading)
 * - Industry standard (react-i18next)
 * - Better TypeScript support
 * - Plural forms support
 * - Variable interpolation
 *
 * 🚀 NEXT STEPS:
 * 1. Replace all Strings.* usage with t() calls
 * 2. Remove imports of this file
 * 3. Test language switching functionality
 * 4. Remove this file after migration is complete
 */

// Keep the legacy export for backward compatibility during migration period
export const Strings = {
  Common: {
    ok: '확인',
    loginSuccess: '로그인 성공',
    loginFailed: '로그인 실패',
    title: '제목',
    content: '내용',
    notice: '공지사항',
    apiSuccess: '요청이 성공했습니다.',
    apiFailed: '요청이 실패했습니다.',
    noData: '데이터가 없습니다.',
    notEmpty: '빈칸을 채워주세요.',
    wait: '잠시만 기다려주세요.',
  },
  FreeTest: {
    classifyTest: '분류 테스트',
    requestTest: '분류 요청을 보냈습니다. 결과를 기다려주세요.',
  },
  Notice: {
    update: '공지사항 수정이 완료되었습니다.',
    add: '공지사항 등록이 완료되었습니다.',
    updateFailed: '공지사항 수정에 실패했습니다.',
    addFailed: '공지사항 등록에 실패했습니다.',
  },
  Workspace: {
    update: '워크스페이스 수정이 완료되었습니다.',
    add: '워크스페이스 등록이 완료되었습니다.',
    updateFailed: '워크스페이스 수정에 실패했습니다.',
    addFailed: '워크스페이스 등록에 실패했습니다.',
  },
  Auth: {
    passwordRequirements: 'Password Requirements:',
    passwordMinLength: '• At least 6 characters',
    passwordMustHaveNumber: '• At least one number (0-9)',
    passwordMustHaveSpecial: '• At least one special character (!@#$%^&*)',
    passwordValidationError: 'Password must be at least 6 characters, include at least one number and one special character',
  },
};
