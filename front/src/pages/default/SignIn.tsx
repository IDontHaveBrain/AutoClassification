import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useTranslation } from 'hooks/useTranslation';
import { withI18nInitialization, withTranslationErrorBoundary } from 'i18n';
import { Loading } from 'pages/default/Loading';
import { getPublicKey, type LoginData, signIn } from 'service/Apis/AuthApi';
import { useAppDispatch } from 'stores/rootHook';
import { setUserInfo } from 'stores/rootSlice';

import { onAlert } from 'utils/alert';
import AuthUtils from 'utils/authUtils';
import { CONSTANT } from 'utils/constant';

function Copyright(props: TypographyProps) {
    const { t, ready } = useTranslation('common');
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {ready ? t('copyright') : 'Copyright © '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

function SignIn() {
    const { t: authT, ready: authReady } = useTranslation('auth');
    const { t: commonT, ready: commonReady } = useTranslation('common');

    // Check if all i18n hooks are ready
    const isI18nReady = authReady && commonReady;

    const [publicKey, setPublicKey] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [rememberMe, setRememberMe] = useState(
        !!localStorage.getItem(CONSTANT.REMEMBER_ME),
    );
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            getPublicKey()
                .then((res) => {
                    setPublicKey(res.data);
                    clearInterval(intervalId);
                    // 공개키 로드 후 이메일 입력에 포커스
                    if (emailInputRef.current) {
                        emailInputRef.current.focus();
                    }
                })
                .catch((_err) => {
                    // 에러를 조용히 처리
                });
        }, 2500);

        setRememberMe(!!localStorage.getItem(CONSTANT.REMEMBER_ME));
        if (localStorage.getItem(CONSTANT.REMEMBER_ME)) {
            setEmail(localStorage.getItem(CONSTANT.REMEMBER_ME));
        }
    }, []);

    // Simple form validation with error messages
    const validateForm = (formData: { username: string; password: string }) => {
        const errors: Record<string, string> = {};

        // Email validation
        if (!formData.username) {
            errors.username = isI18nReady ? authT('validation.required') : 'This field is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
            errors.username = isI18nReady ? authT('validation.invalidEmail') : 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            errors.password = isI18nReady ? authT('validation.required') : 'This field is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const formData = {
            username: data.get('username') as string,
            password: data.get('password') as string,
        };

        // Form validation before submission
        if (!validateForm(formData)) {
            onAlert(isI18nReady ? commonT('messages.validationFailed') : 'Please check your input and try again.');
            return;
        }

        const encryptedPassword = AuthUtils.encrypt(formData.password, publicKey);

        const params: LoginData = {
            username: formData.username,
            password: encryptedPassword,
        };

        signIn(params)
            .then((res) => {
                if (res.data.access_token) {
                    sessionStorage.setItem(
                        CONSTANT.ACCESS_TOKEN,
                        res.data.access_token,
                    );
                    dispatch(setUserInfo(res.data));
                    onAlert(isI18nReady ? authT('login.loginSuccess') : 'Login successful!');
                    if (rememberMe) {
                        localStorage.setItem(CONSTANT.REMEMBER_ME, res.data.user.email);
                    } else {
                        localStorage.removeItem(CONSTANT.REMEMBER_ME);
                    }
                    navigate('/');
                }
            })
            .catch((error) => {
                // Simple error handling
                let errorMessage = isI18nReady ? commonT('messages.apiFailed') : 'An error occurred';

                if (error?.response?.data?.message) {
                    errorMessage = error.response.data.message;
                } else if (error?.message) {
                    errorMessage = error.message;
                }

                onAlert(errorMessage);
            });
    };

    const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);

        // Real-time validation with i18n error messages
        if (validationErrors.username) {
            const { value } = e.target;
            const hasValidEmail = value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (hasValidEmail) {
                setValidationErrors(prev => ({ ...prev, username: '' }));
            }
        }

        if (rememberMe) {
            localStorage.setItem(CONSTANT.REMEMBER_ME, e.target.value);
        }
    };

    const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);

        // Real-time validation with i18n error messages
        if (validationErrors.password) {
            const { value } = e.target;
            if (value) {
                setValidationErrors(prev => ({ ...prev, password: '' }));
            }
        }
    };

    const changeRememberMe = (e) => {
        setRememberMe(e.target.checked);
        if (e.target.checked) {
            localStorage.setItem(CONSTANT.REMEMBER_ME, email);
        } else {
            localStorage.removeItem(CONSTANT.REMEMBER_ME);
        }
    };

    return (
        <>
            {!publicKey || !isI18nReady ? (
                <Loading />
            ) : (
                <Container component="main" maxWidth="xs">
                    <CssBaseline/>
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            {authT('login.title')}
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                            sx={{ mt: 1 }}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label={isI18nReady ? authT('login.email') : 'Email'}
                                name="username"
                                autoComplete="email"
                                inputRef={emailInputRef}
                                value={email}
                                onChange={onChangeEmail}
                                error={!!validationErrors.username}
                                helperText={validationErrors.username}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label={isI18nReady ? authT('login.password') : 'Password'}
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={onChangePassword}
                                error={!!validationErrors.password}
                                helperText={validationErrors.password}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value="remember"
                                        color="primary"
                                        checked={!!rememberMe}
                                        onChange={changeRememberMe}
                                    />
                                }
                                label={isI18nReady ? authT('login.rememberMe') : 'Remember Me'}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isI18nReady ? authT('login.loginButton') : 'Sign In'}
                            </Button>
                            <Grid container>
                                <Grid size="auto">
                                    <Link to={'/sign-up'}>
                                        {isI18nReady ? `${authT('login.noAccount')} ${authT('login.signUp')}` : 'Don\'t have an account? Sign Up'}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }}/>
                </Container>
            )}
        </>
    );
}

// Export SignIn with both i18n initialization and error boundary protection
export default withTranslationErrorBoundary(
    withI18nInitialization(SignIn, {
        showLoadingWhileInitializing: true,
        fallbackComponent: Loading,
    }),
);
