import { UserApi } from "service/commons/ApiClient";
import { URLS } from "utils/constant";
import { AxiosPromise } from "axios";

export const sendOk = (): AxiosPromise => {
  return UserApi.post(URLS.API.SSE.HEARTBEAT);
};
