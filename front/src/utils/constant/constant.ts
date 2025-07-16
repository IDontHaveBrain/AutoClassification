const CONSTANT = {
  BASE_URL: import.meta.env.VITE_API_URL,
  AUTH_API_URL: `${import.meta.env.VITE_API_URL}/auth`,
  API_URL: `${import.meta.env.VITE_API_URL}/api`,
  PUBLIC_FILES_URL: `${import.meta.env.VITE_API_URL}/public`,
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  REMEMBER_ME: 'remember_me',
  PAGE_SIZE: [10, 25, 50],
};

export default CONSTANT;
