import {baseApi} from "./ApiClient";
import {URLS} from "../utils/constant";
import {AxiosPromise} from "axios";

export const sendOk = (): AxiosPromise => {
    return baseApi.post(URLS.API.SSE.HEARTBEAT);
}