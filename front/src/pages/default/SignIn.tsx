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
import {useEffect, useState} from "react";
import {CONSTANT} from "utils/constant";
import {useAppDispatch} from "stores/rootHook";
import {getPublicKey, LoginData, signIn} from "service/Apis/AuthApi";
import AuthUtils from "utils/authUtils";
import {setUserInfo} from "stores/rootSlice";
import {onAlert} from "component/modal/AlertModal";
import {Strings} from "utils/strings";
import CircularProgress from "@mui/material/CircularProgress";
import {Loading} from "pages/default/Loading";

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

export default function SignIn() {
    const [publicKey, setPublicKey] = useState("");
    const [email, setEmail] = useState("");
    const [rememberMe, setRememberMe] = useState(
        localStorage.getItem(CONSTANT.REMEMBER_ME) ? true : false,
    );
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const intervalId = setInterval(() => {
            getPublicKey()
                .then((res) => {
                    setPublicKey(res.data);
                    clearInterval(intervalId);
                })
                .catch((err) => {
                    console.error(err);
                });
        }, 2500);

        setRememberMe(localStorage.getItem(CONSTANT.REMEMBER_ME) ? true : false);
        if (localStorage.getItem(CONSTANT.REMEMBER_ME)) {
            setEmail(localStorage.getItem(CONSTANT.REMEMBER_ME));
        }
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        AuthUtils.encrypt(data.get("password") as string, publicKey)
            .then((res) => {
                const params: LoginData = {
                    username: data.get("username") as string,
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
                            navigate("/");
                        }
                    })
                    .catch((err) => {
                        console.error(err);
                        onAlert(Strings.Common.loginFailed);
                    });
            })
            .catch((err) => {
                console.error(err);
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
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Avatar sx={{m: 1, bgcolor: "secondary.main"}}>
                            <LockOutlinedIcon/>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                            sx={{mt: 1}}
                        >
                            <TextField
                                margin="normal"
                                required
                                fullWidth={true}
                                id="username"
                                label="Email Address"
                                name="username"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={onChangeEmail}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth={true}
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
                                        checked={rememberMe ? true : false}
                                        onChange={changeRememberMe}
                                    />
                                }
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth={true}
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
                                    <Link to={"/sign-up"}>{"Don't have an account? Sign Up"}</Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                    <Copyright sx={{mt: 8, mb: 4}}/>
                </Container>
            )}
        </>
    );
}
