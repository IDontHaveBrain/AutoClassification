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
import { Loading } from 'pages/default/Loading';
import { getPublicKey, type LoginData, signIn } from 'service/Apis/AuthApi';
import { useAppDispatch } from 'stores/rootHook';
import { setUserInfo } from 'stores/rootSlice';

import { onAlert } from 'utils/alert';
import AuthUtils from 'utils/authUtils';
import { CONSTANT } from 'utils/constant';
import { Strings } from 'utils/strings';

function Copyright(props: TypographyProps) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {'Copyright © '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default function SignIn() {
    const [publicKey, setPublicKey] = useState('');
    const [email, setEmail] = useState('');
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        AuthUtils.encrypt(data.get('password') as string, publicKey)
            .then((res) => {
                const params: LoginData = {
                    username: data.get('username') as string,
                    password: res as string,
                };

                signIn(params)
                    .then((res) => {
                        if (res.data.access_token) {
                            sessionStorage.setItem(
                                CONSTANT.ACCESS_TOKEN,
                                res.data.access_token,
                            );
                            dispatch(setUserInfo(res.data));
                            onAlert(Strings.Common.loginSuccess);
                            if (rememberMe) {
                                localStorage.setItem(CONSTANT.REMEMBER_ME, res.data.user.email);
                            } else {
                                localStorage.removeItem(CONSTANT.REMEMBER_ME);
                            }
                            navigate('/');
                        }
                    })
                    .catch((_err) => {
                        onAlert(Strings.Common.loginFailed);
                    });
            })
            .catch((_err) => {
                onAlert(Strings.Common.loginFailed);
            });
    };

    const onChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (rememberMe) {
            localStorage.setItem(CONSTANT.REMEMBER_ME, e.target.value);
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
            {!publicKey ? (
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
                            Sign in
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
                                label="Email Address"
                                name="username"
                                autoComplete="email"
                                inputRef={emailInputRef}
                                value={email}
                                onChange={onChangeEmail}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
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
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign In
                            </Button>
                            <Grid container>
                                <Grid size="auto">
                                    <Link to={'/sign-up'}>{"Don't have an account? Sign Up"}</Link>
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
