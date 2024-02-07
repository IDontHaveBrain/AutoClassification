import axios, {AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig} from "axios";
import CONSTANT from "../utils/constant/constant";

export const authApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.AUTH_API_URL,
  headers:{
    Accept: "application/json"
  }
});

export const baseApi: AxiosInstance = axios.create({
  baseURL: CONSTANT.API_URL,
  headers:{
    Accept: "application/json"
  }
});

const checkToken = async (config: InternalAxiosRequestConfig) => {
  const access_token = sessionStorage.getItem(CONSTANT.ACCESS_TOKEN);

  if(access_token) {
    // config.headers = config.headers || {};
    config.headers.Authorization = 'Bearer ' + access_token;
  }

  return config;
}

axios.defaults.withCredentials = true;
baseApi.interceptors.request.use(checkToken);
baseApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if(error.response && error.response.status === 401) {
      sessionStorage.setItem(CONSTANT.ACCESS_TOKEN, '');
      window.location.href= '/sign-in';
    }
    return Promise.reject(error);
  }
);