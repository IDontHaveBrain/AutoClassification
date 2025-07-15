import { AuthApi, UserApi } from "service/commons/ApiClient";
import { AxiosPromise } from "axios";
import SseManager from "service/commons/SseManager";
import { CONSTANT, URLS } from "utils/constant";

export interface LoginData {
  username: string;
  password: string;
  client_id?: string;
  client_secret?: string;
  grant_type?: string;
}

export const signIn = (loginData: LoginData): AxiosPromise => {
  const params = {
    ...loginData,
    client_id: "public",
    client_secret: "public",
    grant_type: "password",
  };
  const formData = new FormData();
  formData.append("client_id", params.client_id);
  formData.append("client_secret", params.client_secret);
  formData.append("grant_type", params.grant_type);
  formData.append("username", params.username);
  formData.append("password", params.password);

  return AuthApi.post("/token", formData).then(response => {
    // 로그인 성공 시 이벤트 발생
    window.dispatchEvent(new CustomEvent('userLoggedIn'));
    return response;
  });
};

export const getPublicKey = (): AxiosPromise => {
  return AuthApi.get("/key");
};

export const signUp = (data: any): AxiosPromise => {
  return UserApi.post("/member/register", data);
};

export const signOut = (): void => {
  // 로그아웃 시 SSE 연결 종료
  const sseManager = SseManager.getInstance();
  sseManager.disconnect();
};
