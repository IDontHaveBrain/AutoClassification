// Type definitions for i18n translations
export interface CommonTranslations {
  buttons: {
    ok: string;
    cancel: string;
    save: string;
    edit: string;
    delete: string;
    add: string;
    search: string;
    refresh: string;
    submit: string;
    close: string;
  };
  messages: {
    apiSuccess: string;
    apiFailed: string;
    noData: string;
    notEmpty: string;
    wait: string;
    loadingData: string;
    savingData: string;
    processingRequest: string;
  };
  forms: {
    title: string;
    content: string;
    description: string;
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    required: string;
    optional: string;
  };
  status: {
    success: string;
    failed: string;
    pending: string;
    processing: string;
    completed: string;
    error: string;
  };
  time: {
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    lastMonth: string;
  };
}

export interface AuthTranslations {
  login: {
    title: string;
    email: string;
    password: string;
    loginButton: string;
    forgotPassword: string;
    noAccount: string;
    signUp: string;
    loginSuccess: string;
    loginFailed: string;
    invalidCredentials: string;
    accountLocked: string;
  };
  register: {
    title: string;
    confirmPassword: string;
    signUpButton: string;
    alreadyHaveAccount: string;
    signIn: string;
    registerSuccess: string;
    registerFailed: string;
    emailAlreadyExists: string;
    passwordsDoNotMatch: string;
  };
  password: {
    requirements: string;
    minLength: string;
    mustHaveNumber: string;
    mustHaveSpecial: string;
    validationError: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    changePassword: string;
    passwordChanged: string;
    passwordChangeFailed: string;
  };
  profile: {
    title: string;
    editProfile: string;
    updateProfile: string;
    profileUpdated: string;
    profileUpdateFailed: string;
  };
  logout: {
    title: string;
    confirmLogout: string;
    logoutSuccess: string;
    logoutFailed: string;
  };
  session: {
    expired: string;
    invalid: string;
    tokenRefreshed: string;
    unauthorized: string;
  };
}

export interface WorkspaceTranslations {
  general: {
    title: string;
    workspaceList: string;
    workspaceEditor: string;
    createWorkspace: string;
    editWorkspace: string;
    deleteWorkspace: string;
    workspaceName: string;
    workspaceDescription: string;
    workspaceSettings: string;
  };
  actions: {
    create: string;
    update: string;
    delete: string;
    save: string;
    cancel: string;
    clone: string;
    export: string;
    import: string;
  };
  messages: {
    update: string;
    add: string;
    updateFailed: string;
    addFailed: string;
    deleteFailed: string;
    deleteSuccess: string;
    deleteConfirm: string;
    noWorkspaces: string;
    loadingWorkspaces: string;
    savingWorkspace: string;
  };
  members: {
    title: string;
    addMember: string;
    removeMember: string;
    memberList: string;
    memberRole: string;
    owner: string;
    admin: string;
    member: string;
    viewer: string;
    inviteMember: string;
    memberInvited: string;
    memberInviteFailed: string;
    memberRemoved: string;
    memberRemoveFailed: string;
  };
  dataset: {
    title: string;
    uploadDataset: string;
    datasetName: string;
    datasetSize: string;
    datasetCount: string;
    datasetUploaded: string;
    datasetUploadFailed: string;
    datasetDeleted: string;
    datasetDeleteFailed: string;
    noDatasets: string;
    loadingDatasets: string;
  };
  classification: {
    title: string;
    classTitle: string;
    addClass: string;
    removeClass: string;
    className: string;
    classDescription: string;
    classCount: string;
    classAdded: string;
    classAddFailed: string;
    classRemoved: string;
    classRemoveFailed: string;
    noClasses: string;
    loadingClasses: string;
  };
  training: {
    title: string;
    startTraining: string;
    stopTraining: string;
    trainingStatus: string;
    trainingProgress: string;
    trainingStarted: string;
    trainingCompleted: string;
    trainingFailed: string;
    trainingStopped: string;
    trainingInProgress: string;
    trainingModel: string;
    modelName: string;
    modelVersion: string;
  };
  autoLabel: {
    title: string;
    startAutoLabel: string;
    autoLabelProgress: string;
    autoLabelCompleted: string;
    autoLabelFailed: string;
    autoLabelInProgress: string;
    reviewLabels: string;
    approveLabels: string;
    rejectLabels: string;
  };
}

export interface NoticeTranslations {
  general: {
    title: string;
    noticeList: string;
    noticeDetail: string;
    noticeEditor: string;
    createNotice: string;
    editNotice: string;
    deleteNotice: string;
    noticeTitle: string;
    noticeContent: string;
    author: string;
    createdAt: string;
    updatedAt: string;
    viewCount: string;
  };
  actions: {
    create: string;
    update: string;
    delete: string;
    save: string;
    cancel: string;
    publish: string;
    unpublish: string;
    pin: string;
    unpin: string;
  };
  messages: {
    update: string;
    add: string;
    updateFailed: string;
    addFailed: string;
    deleteFailed: string;
    deleteSuccess: string;
    deleteConfirm: string;
    noNotices: string;
    loadingNotices: string;
    savingNotice: string;
    published: string;
    unpublished: string;
    pinned: string;
    unpinned: string;
  };
  status: {
    published: string;
    unpublished: string;
    draft: string;
    pinned: string;
    normal: string;
  };
  form: {
    titlePlaceholder: string;
    contentPlaceholder: string;
    titleRequired: string;
    contentRequired: string;
    attachments: string;
    addAttachment: string;
    removeAttachment: string;
    maxFileSize: string;
    allowedFileTypes: string;
  };
  search: {
    searchNotices: string;
    searchPlaceholder: string;
    searchResults: string;
    noSearchResults: string;
    searchBy: string;
    searchByTitle: string;
    searchByContent: string;
    searchByAuthor: string;
  };
}

export interface NavigationTranslations {
  menu: {
    home: string;
    notice: string;
    workspace: string;
    service: string;
    profile: string;
    settings: string;
    logout: string;
    login: string;
    register: string;
  };
  submenu: {
    noticeList: string;
    noticeWrite: string;
    workspaceList: string;
    workspaceEditor: string;
    autoLabel: string;
    training: string;
    testClassify: string;
    testResult: string;
    classify: string;
    result: string;
  };
  breadcrumb: {
    home: string;
    notice: string;
    workspace: string;
    service: string;
    profile: string;
    settings: string;
  };
  tabs: {
    overview: string;
    details: string;
    settings: string;
    members: string;
    dataset: string;
    classification: string;
    training: string;
    results: string;
    history: string;
  };
  actions: {
    back: string;
    forward: string;
    refresh: string;
    home: string;
    previous: string;
    next: string;
    goToTop: string;
    goToBottom: string;
  };
  status: {
    loading: string;
    error: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    offline: string;
    online: string;
  };
}

export interface TestTranslations {
  classify: {
    title: string;
    classifyTest: string;
    requestTest: string;
    testResult: string;
    testResultList: string;
    testResultDetail: string;
    startTest: string;
    stopTest: string;
    testCompleted: string;
    testFailed: string;
    testInProgress: string;
    uploadImage: string;
    selectImage: string;
    classificationResult: string;
    confidence: string;
    accuracy: string;
    noResults: string;
    loadingResults: string;
    processingImage: string;
    analysisComplete: string;
    retryTest: string;
    downloadResults: string;
    exportResults: string;
  };
  history: {
    title: string;
    testHistory: string;
    recentTests: string;
    testDate: string;
    testStatus: string;
    viewDetails: string;
    deleteHistory: string;
    clearHistory: string;
    noHistory: string;
    loadingHistory: string;
    historyDeleted: string;
    historyCleared: string;
  };
  settings: {
    title: string;
    testSettings: string;
    maxImageSize: string;
    supportedFormats: string;
    timeout: string;
    retryAttempts: string;
    saveSettings: string;
    resetSettings: string;
    settingsSaved: string;
    settingsReset: string;
  };
}

export interface Translations {
  common: CommonTranslations;
  auth: AuthTranslations;
  workspace: WorkspaceTranslations;
  notice: NoticeTranslations;
  navigation: NavigationTranslations;
  test: TestTranslations;
}

export type TranslationResources = Translations;

export type TranslationKey = keyof Translations;
export type NestedTranslationKey<T extends TranslationKey> = keyof Translations[T];