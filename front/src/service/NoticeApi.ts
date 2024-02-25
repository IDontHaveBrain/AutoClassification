import {AxiosPromise} from "axios";
import {URLS} from "utils/constant";
import {UserApi} from "service/commons/ApiClient";

export const getNoticeList = (data?): AxiosPromise => {
    return UserApi.get(URLS.API.NOTICE.GET, data);
}