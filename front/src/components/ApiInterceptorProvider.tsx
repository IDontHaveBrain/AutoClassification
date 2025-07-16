import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { type AxiosError, type AxiosResponse } from 'axios';
import { UserApi } from 'service/commons/ApiClient';

import AuthUtils from 'utils/authUtils';

/**
 * React Router 네비게이션을 포함한 API 인터셉터를 설정하는 컴포넌트
 * useNavigate에 접근하려면 Router 컨텍스트 내에서 렌더링되어야 함
 */
export const ApiInterceptorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    const responseInterceptor = UserApi.interceptors.response.use(
      (response: AxiosResponse) => {
        isRedirectingRef.current = false;
        return response;
      },
      (error: AxiosError) => {
        const isAuthError = (
          (error.response && error.response.status === 401) ||
          (error.name === 'AuthenticationError')
        );

        if (isAuthError && !isRedirectingRef.current) {
          isRedirectingRef.current = true;
          AuthUtils.removeTokens();
          navigate('/sign-in', { replace: true });

          setTimeout(() => {
            isRedirectingRef.current = false;
          }, 1000);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      UserApi.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  return <>{children}</>;
};