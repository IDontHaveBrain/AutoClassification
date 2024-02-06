import {baseApi} from "./ApiClient";
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
  return baseApi.post('/token', loginData);
}