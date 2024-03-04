import { AxiosPromise } from "axios";
import { UserApi } from "service/commons/ApiClient";
import { URLS } from "utils/constant";

export const uploadImg = (params): AxiosPromise => {
    return UserApi.post(URLS.API.TRAIN.POST, params);
}

export const getMyTrainImgs = (): AxiosPromise => {
    return UserApi.get(URLS.API.TRAIN.GET);
}

export const removeTrainImg = (id: number): AxiosPromise => {
    return UserApi.delete(`${URLS.API.TRAIN.DELETE}/${id}`);
}