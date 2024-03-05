import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import qs from "qs";
import { CONSTANT } from "utils/constant";

export const authApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.AUTH_API_URL,
  headers: {
    Accept: "application/json",
  },
});

export const UserApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.API_URL,
  headers: {
    Accept: "application/json",
  },
});

export const PublicApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.PUBLIC_FILES_URL,
  headers: {
    Accept: "application/json",
  },
});

const checkToken = async (config: InternalAxiosRequestConfig) => {
  const access_token = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);

  if (access_token) {
    // config.headers = config.headers || {};
    config.headers.Authorization = "Bearer " + access_token;
  }

  return config;
};

// axios.defaults.withCredentials = true;
UserApi.interceptors.request.use(checkToken);
UserApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.setItem(CONSTANT.ACCESS_TOKEN, "");
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  },
);
