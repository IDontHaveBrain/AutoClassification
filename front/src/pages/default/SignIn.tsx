import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import {Link, useNavigate} from 'react-router-dom';
import {getPublicKey, LoginData, signIn} from "../../service/authApi";
import CONSTANT from "../../utils/constant/constant";
import {useEffect, useState} from "react";
import AuthUtils from "../../utils/authUtils";
import {useDispatch} from "react-redux";
import {setUserInfo} from "../../store/rootSlice";
import {useAppDispatch} from "../../store/rootHook";

function Copyright(props: any) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

export default function SignIn() {
    const [publicKey, setPublicKey] = useState('');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        getPublicKey().then(res => {
            console.log(res);
            setPublicKey(res.data);
        }).catch(err => {
            console.log(err);
        })
    }, [])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('username'),
            password: data.get('password'),
        });

        AuthUtils.encrypt(data.get('password') as string, publicKey)
            .then(res => {
                console.log(res);
                const params: LoginData = {
                    username: data.get('username') as string,
                    password: res as string,
                }

                signIn(params).then(res => {
                    console.log(res);
                    if (res.data.access_token) {
                        sessionStorage.setItem(CONSTANT.ACCESS_TOKEN, res.data.access_token);
                        dispatch(setUserInfo(res.data));
                        navigate('/');
                    }
                }).catch(err => {
                    console.log(err);
                })
            }).catch(err => {
            console.log(err);
        })
    };

    return (
        <>
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
                    <Avatar sx={{m: 1, bgcolor: 'secondary.main'}}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Email Address"
                            name="username"
                            autoComplete="email"
                            autoFocus
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
                            control={<Checkbox value="remember" color="primary"/>}
                            label="Remember me"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{mt: 3, mb: 2}}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            {/*<Grid item xs>*/}
                            {/*  <Link href="#" variant="body2">*/}
                            {/*    Forgot password?*/}
                            {/*  </Link>*/}
                            {/*</Grid>*/}
                            <Grid item>
                                <Link to={"/sign-up"}>
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
                <Copyright sx={{mt: 8, mb: 4}}/>
            </Container>
        </>
    );
}
