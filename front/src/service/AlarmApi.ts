import {baseApi} from "./commons/ApiClient";
import {AxiosPromise} from "axios";

export const getMyAlarms = (): AxiosPromise => {
    return baseApi.get('/alarm/my');
}