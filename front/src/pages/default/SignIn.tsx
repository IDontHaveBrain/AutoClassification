import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { Loading } from 'pages/default/Loading';
import { getPublicKey, type LoginData, signIn } from 'service/Apis/AuthApi';
import { useAppDispatch } from 'stores/rootHook';
import { setUserInfo } from 'stores/rootSlice';

import { onAlert } from 'utils/alert';
import AuthUtils from 'utils/authUtils';

// Copyright 컴포넌트를 외부로 분리하여 렌더링 중 setState 경고 방지
function Copyright(props: TypographyProps) {
    const { t } = useTranslation('common');

    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {'Copyright © '}
            <Link to="#" color="inherit">
                {t('appName', 'AutoClassification')}
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default function SignIn() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const { t, i18n } = useTranslation('auth');

    const [isLoading, setIsLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [publicKey, setPublicKey] = useState('');
    const [isLoadingPublicKey, setIsLoadingPublicKey] = useState(true);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    const isEffectRan = useRef(false);
    const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getButtonText = () => {
        if (isLoading) return t('signingIn', 'Signing In...');
        if (isLoadingPublicKey) return t('loadingEncryptionKey', 'Loading encryption key...');
        if (isCheckingAuth) return t('checkingAuth', 'Checking authentication...');
        return t('signIn', 'Sign In');
    };

    // 무한 리다이렉트 방지 로직이 포함된 강화된 인증 상태 검증
    useEffect(() => {
        if (isEffectRan.current) return;
        isEffectRan.current = true;

        const performAuthCheck = async () => {
            try {
                setIsCheckingAuth(true);

                const locationState = location.state as { redirectAttempts?: number; from?: string } | null;
                const previousRedirectAttempts = locationState?.redirectAttempts || 0;
                const fromWorkspace = locationState?.from === '/workspace';

                if (previousRedirectAttempts >= 3) {
                    console.warn('🚫 Too many redirect attempts detected, stopping redirect loop');
                    setIsCheckingAuth(false);
                    return;
                }

                // 워크스페이스 인증 실패 시 즉시 재리다이렉트 방지
                if (fromWorkspace && previousRedirectAttempts > 0) {
                    setIsCheckingAuth(false);
                    return;
                }

                // 레이스 컨디션 방지를 위한 지연된 인증 상태 확인
                await new Promise(resolve => setTimeout(resolve, 100));

                const isAuthenticated = AuthUtils.isAuthenticated();

                if (isAuthenticated) {
                    const rememberMe = AuthUtils.getRememberMe();
                    setRemember(rememberMe);

                    // 너무 빠른 리다이렉트 방지를 위한 지연 처리
                    redirectTimeoutRef.current = setTimeout(() => {
                        if (AuthUtils.isAuthenticated()) {
                            navigate('/workspace', {
                                replace: true,
                                state: {
                                    redirectAttempts: previousRedirectAttempts + 1,
                                    from: '/sign-in',
                                },
                            });
                        } else {
                            setIsCheckingAuth(false);
                        }
                    }, 500);
                } else {
                    setIsCheckingAuth(false);
                }
            } catch (error) {
                console.error('❌ Error during authentication check:', error);
                setIsCheckingAuth(false);
            }
        };

        performAuthCheck();

        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
        };
    }, [navigate, location.state]);

    useEffect(() => {
        const loadPublicKey = async () => {
            setIsLoadingPublicKey(true);
            try {
                const response = await getPublicKey();

                // 백엔드 문자열 응답과 향후 객체 응답 형식 모두 지원
                const publicKeyValue = typeof response.data === 'string'
                    ? response.data
                    : response.data?.publicKey;

                if (publicKeyValue) {
                    setPublicKey(publicKeyValue);
                } else {
                    console.error('❌ Invalid public key response format:', response.data);
                    throw new Error('Invalid response format: no public key found');
                }
            } catch (error: unknown) {
                console.error('❌ Failed to load public key:', error);
                onAlert(t('failedToLoadKey', 'Failed to load encryption key'));
            } finally {
                setIsLoadingPublicKey(false);
            }
        };

        loadPublicKey();
    }, [t]);

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
        };
    }, []);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            if (!publicKey) {
                console.error('❌ Public key validation failed: Public key is empty or undefined');
                onAlert(t('noPublicKey', 'Encryption key not available'));
                return;
            }

            if (!userName.trim() || !password.trim()) {
                onAlert(t('fillAllFields', 'Please fill in all fields'));
                return;
            }

            setIsLoading(true);

            try {
                const encryptedPassword = AuthUtils.encrypt(password, publicKey);

                const loginData: LoginData = {
                    username: userName.trim(),
                    password: encryptedPassword,
                    remember,
                };

                const response = await signIn(loginData);

                // 백엔드가 success 필드를 제공하지 않아 토큰 존재 여부로 성공 판단
                if (response.data.access_token && response.data.refresh_token) {

                    AuthUtils.setAccessToken(response.data.access_token);
                    AuthUtils.setRefreshToken(response.data.refresh_token);

                    const memberInfo = {
                        access_token: response.data.access_token,
                        refresh_token: response.data.refresh_token,
                        expires_in: response.data.expires_in || 3600,
                        user: response.data.user,
                    };
                    dispatch(setUserInfo(memberInfo));

                    AuthUtils.setRememberMe(remember);

                    onAlert(t('signInSuccess', 'Sign in successful'));

                    navigate('/workspace', {
                        replace: true,
                        state: {
                            redirectAttempts: 0,
                            from: '/sign-in',
                            loginSuccess: true,
                        },
                    });
                } else {
                    throw new Error(response.data.message || t('signInFailed', 'Sign in failed'));
                }
            } catch (error: unknown) {
                const errorResponse = error as { response?: { data?: { message?: string } }; message?: string };
                const errorMessage = errorResponse?.response?.data?.message ||
                                  errorResponse?.message ||
                                  t('signInError', 'An error occurred during sign in');

                onAlert(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [userName, password, remember, publicKey, navigate, dispatch, t],
    );

    const handleUserNameChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(event.target.value);
    }, []);

    const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(event.target.value);
    }, []);

    const handleRememberChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRemember(event.target.checked);
    }, []);

    if (!i18n.isInitialized) {
        return <Loading />;
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    {t('signIn', 'Sign In')}
                </Typography>
                {isCheckingAuth && (
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                        {t('checkingAuthStatus', '🔍 Checking authentication status...')}
                    </Typography>
                )}
                {!isCheckingAuth && isLoadingPublicKey && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('loadingEncryptionKeyStatus', '🔑 Loading encryption key...')}
                    </Typography>
                )}
                {!isCheckingAuth && !isLoadingPublicKey && !publicKey && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                        {t('encryptionKeyFailed', '⚠️ Encryption key failed to load')}
                    </Typography>
                )}
                {!isCheckingAuth && !isLoadingPublicKey && publicKey && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                        {t('encryptionReady', '✅ Encryption ready')}
                    </Typography>
                )}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label={t('username', 'Username')}
                        name="username"
                        autoComplete="username"
                        value={userName}
                        onChange={handleUserNameChange}
                        disabled={isLoading || isCheckingAuth}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={t('passwordLabel', 'Password')}
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={handlePasswordChange}
                        disabled={isLoading || isCheckingAuth}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                value="remember"
                                color="primary"
                                checked={remember}
                                onChange={handleRememberChange}
                                disabled={isLoading || isCheckingAuth}
                            />
                        }
                        label={t('rememberMe', 'Remember me')}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading || isLoadingPublicKey || isCheckingAuth}
                    >
                        {getButtonText()}
                    </Button>
                    <Grid container>
                        <Grid size="grow">
                            <Link to="#" style={{ fontSize: '0.875rem' }}>
                                {t('forgotPassword', 'Forgot password?')}
                            </Link>
                        </Grid>
                        <Grid>
                            <Link to="#" style={{ fontSize: '0.875rem' }}>
                                {t('noAccount', "Don't have an account? Sign Up")}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    );
}