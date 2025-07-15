import { type AxiosPromise } from 'axios';
import { UserApi } from 'service/commons/ApiClient';

export const getMyAlarms = (): AxiosPromise => {
  return UserApi.get('/alarm/my');
};

export const readAlarm = (alarmId: number): AxiosPromise => {
  return UserApi.put(`/alarm/${alarmId}`);
};

export const readAllAlarm = (): AxiosPromise => {
  return UserApi.put('/alarm/all');
};
