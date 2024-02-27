import {authApi, UserApi} from "service/commons/ApiClient";
import {AxiosPromise} from "axios";


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
    client_id: 'public',
    client_secret: 'public',
    grant_type: 'password'
  }
  const formData = new FormData();
  formData.append('client_id', params.client_id);
  formData.append('client_secret', params.client_secret);
  formData.append('grant_type', params.grant_type);
  formData.append('username', params.username);
  formData.append('password', params.password);

  return authApi.post('/token', formData);
}

export const getPublicKey = (): AxiosPromise => {
  return authApi.get('/key');
}