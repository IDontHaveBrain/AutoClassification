import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {Link, useNavigate} from "react-router-dom";
import { useState } from "react";
import {signUp} from "service/Apis/AuthApi";
import {onAlert} from "component/modal/AlertModal";
import {Strings} from "utils/strings";

function Copyright(props: any) {
    return (
        <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            {...props}
        >
            {"Copyright © "}
            {new Date().getFullYear()}
            {"."}
        </Typography>
    );
}

export default function SignUp() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        allowExtraEmails: false,
    });
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

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
                setPasswordError('Password must be at least 6 characters, include at least one number and one special character');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log(form);

        signUp(form).then((res) => {
            console.log(res);
            onAlert(Strings.Common.apiSuccess);
            navigate('/sign-in');
        }).catch((err) => {
            console.error(err);
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
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
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
                            <Grid item xs={12}>
                                <TextField
                                    autoComplete="given-name"
                                    name="name"
                                    required
                                    fullWidth={true}
                                    id="name"
                                    label="Full Name"
                                    autoFocus
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth={true}
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    onChange={handleChange}
                                    error={!!emailError}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth={true}
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
                            <Grid item xs={12}>
                                {/*<FormControlLabel*/}
                                {/*    control={*/}
                                {/*        <Checkbox*/}
                                {/*            value="allowExtraEmails"*/}
                                {/*            color="primary"*/}
                                {/*        />*/}
                                {/*    }*/}
                                {/*    label="I want to receive inspiration, marketing promotions and updates via email."*/}
                                {/*/>*/}
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth={true}
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
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
