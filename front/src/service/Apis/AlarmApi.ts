import { UserApi } from "service/commons/ApiClient";
import { AxiosPromise } from "axios";

export const getMyAlarms = (): AxiosPromise => {
  return UserApi.get("/alarm/my");
};

export const readAlarm = (alarmId: number): AxiosPromise => {
  return UserApi.put(`/alarm/${alarmId}`);
}

export const readAllAlarm = (): AxiosPromise => {
  return UserApi.put("/alarm/all");
}
