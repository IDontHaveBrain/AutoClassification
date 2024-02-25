import {UserApi} from "./commons/ApiClient";
import {AxiosPromise} from "axios";

export const getMyAlarms = (): AxiosPromise => {
    return UserApi.get('/alarm/my');
}