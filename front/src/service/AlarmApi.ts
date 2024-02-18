import {baseApi} from "./ApiClient";

const getMyAlarms = () => {
    return baseApi.get('/alarm');
}