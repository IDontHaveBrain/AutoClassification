import { AxiosPromise } from "axios";
import { UserApi } from "service/commons/ApiClient";
import { URLS } from "utils/constant";

export const testUploadImg = (params): AxiosPromise => {
    return UserApi.post(URLS.API.FREETEST.POST, params);
};

export const testGetResult = (params?): AxiosPromise => {
    return UserApi.get(URLS.API.FREETEST.GET, { params });
}

export const requestAutoLabel = (workspaceId): AxiosPromise => {
    return UserApi.post(`${URLS.API.TRAIN.POST}/${workspaceId}`);
}