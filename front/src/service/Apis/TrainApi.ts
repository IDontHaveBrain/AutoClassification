import { AxiosPromise } from "axios";
import { UserApi } from "service/commons/ApiClient";
import { URLS } from "utils/constant";

export const uploadImg = (params): AxiosPromise => {
    return UserApi.post(URLS.API.TRAIN.POST, params);
}