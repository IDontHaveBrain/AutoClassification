import {baseApi} from "./ApiClient";
import {AxiosPromise} from "axios";

export const getMyAlarms = (): AxiosPromise => {
    return baseApi.get('/alarm/my');
}