import { type AxiosPromise } from 'axios';
import { UserApi } from 'service/commons/ApiClient';
import { type Pageable,type TestResultParams, type TestUploadData } from 'types';

import { URLS } from 'utils/constant';

export const testUploadImg = (params: TestUploadData): AxiosPromise => {
    return UserApi.post(URLS.API.FREETEST.POST, params);
};

export const testGetResult = (params?: TestResultParams | Pageable): AxiosPromise => {
    return UserApi.get(URLS.API.FREETEST.GET, { params });
};

export const requestAutoLabel = (workspaceId: number | string): AxiosPromise => {
    return UserApi.post(`${URLS.API.TRAIN.LABEL}/${workspaceId}`);
};

export const requestTrain = (workspaceId: number | string): AxiosPromise => {
    return UserApi.post(`${URLS.API.TRAIN.POST}/${workspaceId}`);
};