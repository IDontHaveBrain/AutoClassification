import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { useTranslation } from 'hooks/useTranslation';
import { signUp } from 'service/Apis/AuthApi';

import { onAlert } from 'utils/alert';

function Copyright(props: TypographyProps) {
    const { t } = useTranslation('common');
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {t('copyright')}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default function SignUp() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();
    const nameInputRef = useRef<HTMLInputElement>(null);
    const { t: authT } = useTranslation('auth');

    useEffect(() => {
        // 컴포넌트 마운트 시 이름 입력에 포커스
        if (nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, []);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setForm({
            ...form,
            [name]: value,
        });

        if (name === 'email') {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            if (!emailValid) {
                setEmailError(authT('register.invalidEmailAddress'));
            } else {
                setEmailError('');
            }
        }

        if (name === 'password') {
            const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/.test(value);
            if (!passwordValid) {
                setPasswordError(authT('password.validationError'));
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        signUp(form).then((_res) => {
            onAlert(authT('register.registerSuccess'), () => navigate('/sign-in'));
        }).catch((_err) => {
            onAlert(authT('register.registerFailed'));
        });
    };

    return (
        <>
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
                        {authT('register.title')}
                    </Typography>
                    <Box
                        component="form"
                        noValidate
                        onSubmit={handleSubmit}
                        sx={{ mt: 3 }}
                    >
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    autoComplete="given-name"
                                    name="name"
                                    required
                                    fullWidth
                                    id="name"
                                    label={authT('register.fullName')}
                                    inputRef={nameInputRef}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label={authT('register.email')}
                                    name="email"
                                    autoComplete="email"
                                    onChange={handleChange}
                                    error={!!emailError}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {authT('password.requirements')}
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={authT('password.minLength')}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={authT('password.mustHaveNumber')}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={authT('password.mustHaveSpecial')}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label={authT('register.password')}
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    onChange={handleChange}
                                    error={!!passwordError}
                                    helperText={passwordError}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }} />
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {authT('register.signUpButton')}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid size="auto">
                                <Link to="/sign-in">
                                    {authT('register.alreadyHaveAccount')} {authT('register.signIn')}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{ mt: 5 }} />
            </Container>
        </>
    );
}
