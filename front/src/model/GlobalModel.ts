
export interface AlertDetail {
    message: string;
    open?: boolean;
    callback?: () => any;
}

export interface User {
    id?: number;
    email: string;
    name: string;
}

export interface UserInfo {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user: User;
}