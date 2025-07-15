import { type AxiosPromise } from 'axios';
import { UserApi } from 'service/commons/ApiClient';

import { URLS } from 'utils/constant';

export const getMemberList = (search): AxiosPromise => {
    return UserApi.get(URLS.API.MEMBER.SEARCH, { params: search });
};