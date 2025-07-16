import * as forge from 'node-forge';

import { CONSTANT } from './constant';

const AuthUtils = {
  encrypt: (data: string, publicKey: string): string => {
    const pemKey =
      `-----BEGIN PUBLIC KEY-----\n${
      publicKey
      }\n` +
      `-----END PUBLIC KEY-----`;
    const pubKey = forge.pki.publicKeyFromPem(pemKey);

    const encrypted = pubKey.encrypt(data);

    return forge.util.encode64(encrypted);
  },

  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem(CONSTANT.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  },

  setAccessToken: (token: string): void => {
    try {
      localStorage.setItem(CONSTANT.ACCESS_TOKEN, token);
    } catch (error) {
      // localStorage 오류를 조용히 처리 (예: 프라이빗 브라우징 모드)
    }
  },

  getRefreshToken: (): string | null => {
    try {
      return localStorage.getItem(CONSTANT.REFRESH_TOKEN);
    } catch (error) {
      return null;
    }
  },

  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(CONSTANT.REFRESH_TOKEN, token);
    } catch (error) {
      // localStorage 오류를 조용히 처리 (예: 프라이빗 브라우징 모드)
    }
  },

  removeTokens: (): void => {
    try {
      localStorage.removeItem(CONSTANT.ACCESS_TOKEN);
      localStorage.removeItem(CONSTANT.REFRESH_TOKEN);
    } catch (error) {
      // localStorage 오류를 조용히 처리 (예: 프라이빗 브라우징 모드)
    }
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // 유효하지 않은 토큰을 만료된 것으로 간주
    }
  },

  isValidJwtFormat: (token: string): boolean => {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      const [header, payload] = parts;

      JSON.parse(atob(header));
      const decodedPayload = JSON.parse(atob(payload));

      return decodedPayload && typeof decodedPayload.exp === 'number';
    } catch (error) {
      return false;
    }
  },

  getValidAccessToken: (): string | null => {
    try {
      const token = AuthUtils.getAccessToken();

      if (!token || token.trim() === '') {
        return null;
      }

      if (!AuthUtils.isValidJwtFormat(token)) {
        AuthUtils.removeTokens();
        return null;
      }

      if (AuthUtils.isTokenExpired(token)) {
        AuthUtils.removeTokens();
        return null;
      }

      return token;
    } catch (error) {
      AuthUtils.removeTokens();
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return AuthUtils.getValidAccessToken() !== null;
  },

  getTokenExpirationTime: (token: string): number | null => {
    try {
      if (!AuthUtils.isValidJwtFormat(token)) {
        return null;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp;
    } catch (error) {
      return null;
    }
  },

  willTokenExpireSoon: (token: string, withinMinutes: number = 5): boolean => {
    try {
      const expirationTime = AuthUtils.getTokenExpirationTime(token);
      if (!expirationTime) {
        return true;
      }

      const currentTime = Date.now() / 1000;
      const timeUntilExpiration = expirationTime - currentTime;
      const minutesUntilExpiration = timeUntilExpiration / 60;

      return minutesUntilExpiration <= withinMinutes;
    } catch (error) {
      return true;
    }
  },

  getRememberMe: (): boolean => {
    try {
      const remember = localStorage.getItem(CONSTANT.REMEMBER_ME);
      return remember === 'true';
    } catch (error) {
      return false;
    }
  },

  setRememberMe: (remember: boolean): void => {
    try {
      localStorage.setItem(CONSTANT.REMEMBER_ME, remember.toString());
    } catch (error) {
      // localStorage 오류를 조용히 처리 (예: 프라이빗 브라우징 모드)
    }
  },
};

export default AuthUtils;
