import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import AuthUtils from 'utils/authUtils';
import { CONSTANT } from 'utils/constant';

export const AuthApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.AUTH_API_URL,
  headers: {
    Accept: 'application/json',
  },
});

AuthApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

AuthApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const UserApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.API_URL,
  headers: {
    Accept: 'application/json',
  },
});

export const PublicApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.PUBLIC_FILES_URL,
  headers: {
    Accept: 'application/json',
  },
});

const checkToken = (config: InternalAxiosRequestConfig) => {
  const access_token = AuthUtils.getValidAccessToken();

  if (access_token) {
    if (AuthUtils.willTokenExpireSoon(access_token, 2)) {
      // TODO: 토큰 갱신 로직 구현
    }

    config.headers.Authorization = `Bearer ${access_token}`;
  } else {
    const error = new Error('No valid authentication token available');
    error.name = 'AuthenticationError';
    throw error;
  }

  return config;
};

UserApi.interceptors.request.use(
  checkToken,
  (error) => {
    return Promise.reject(error);
  },
);

UserApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);
