import { type AxiosPromise } from 'axios';
import { AuthApi, UserApi } from 'service/commons/ApiClient';
import SseManager from 'service/commons/SseManager';

export interface LoginData {
  username: string;
  password: string;
  remember?: boolean;
  client_id?: string;
  client_secret?: string;
  grant_type?: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export const signIn = (loginData: LoginData): AxiosPromise => {
  const params = {
    ...loginData,
    client_id: 'public',
    client_secret: 'public',
    grant_type: 'password',
  };
  const formData = new FormData();
  formData.append('client_id', params.client_id);
  formData.append('client_secret', params.client_secret);
  formData.append('grant_type', params.grant_type);
  formData.append('username', params.username);
  formData.append('password', params.password);

  return AuthApi.post('/token', formData).then(response => {
    window.dispatchEvent(new CustomEvent('userLoggedIn'));
    return response;
  });
};

export const getPublicKey = (): AxiosPromise => {
  return AuthApi.get('/key');
};

export const signUp = (data: SignUpData): AxiosPromise => {
  return UserApi.post('/member/register', data);
};

export const signOut = (): void => {
  const sseManager = SseManager.getInstance();
  sseManager.disconnect();
};
