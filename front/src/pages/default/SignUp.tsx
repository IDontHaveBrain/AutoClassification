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
import { signUp } from 'service/Apis/AuthApi';

import { onAlert } from 'utils/alert';
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
                setEmailError('Please enter a valid email address');
            } else {
                setEmailError('');
            }
        }

        if (name === 'password') {
            const passwordValid = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/.test(value);
            if (!passwordValid) {
                setPasswordError(Strings.Auth.passwordValidationError);
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        signUp(form).then((_res) => {
            onAlert(Strings.Common.apiSuccess, () => navigate('/sign-in'));
        }).catch((_err) => {
            onAlert(Strings.Common.apiFailed);
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
                        Sign up
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
                                    label="Full Name"
                                    inputRef={nameInputRef}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
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
                                        {Strings.Auth.passwordRequirements}
                                    </Typography>
                                    <List dense sx={{ py: 0 }}>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={Strings.Auth.passwordMinLength}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={Strings.Auth.passwordMustHaveNumber}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ py: 0, px: 0 }}>
                                            <ListItemText
                                                primary={Strings.Auth.passwordMustHaveSpecial}
                                                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
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
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid size="auto">
                                <Link to="/sign-in">
                                    Already have an account? Sign in
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
