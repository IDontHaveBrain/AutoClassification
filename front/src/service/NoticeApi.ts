import {AxiosPromise} from "axios";
import {URLS} from "utils/constant";
import {UserApi} from "service/commons/ApiClient";

export const getNoticeList = (search?): AxiosPromise => {
    console.log('getNoticeList data : ', search);
    return UserApi.get(`${URLS.API.NOTICE.GET}`, {params: search});
}

export const getNoticeDetail = (id: number): AxiosPromise => {
    return UserApi.get(URLS.API.NOTICE.GET + `/${id}`);
}

export const addNotice = (data): AxiosPromise => {
    return UserApi.post(URLS.API.NOTICE.POST, data);
}

export const updateNotice = (id: number, data): AxiosPromise => {
    return UserApi.put(URLS.API.NOTICE.PUT + `/${id}`, data);
}