import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';
import GoogleLogin from 'react-google-login';

import styles from "./login.module.css";

const Login = () => {
    const history = useHistory();
    const { setJwtToken, setUserId, setIsSubscribed, themeObj, theme } = useContext(SitesContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])
    
    const onCancel = () => {
        setUsername("");
        setPassword("");
        
        history.push("/");
    }

    const onSubmit = e => {
        e.preventDefault();

        axios
            .post(`${process.env.REACT_APP_API_BASE}/api/users/login`, {
                username,
                password
            })
            .then(res =>{
                setJwtToken(res.data.token);
                setUserId(res.data.id);
                setIsSubscribed(res.data.isSubscribed);
                history.push("/home");
                localStorage.setItem("mostlinkUserId", res.data.id);
                toast("Successfully logged in.", { type: "success" });
            })
            .catch(err => {
                toast("Wrong username or password.", { type: "error"})
            })
    }

    const responseGoogle = (response) => {
        const { profileObj } = response;

        if (Object.keys(profileObj).length) {
            const username = profileObj.email;

            axios
                .post(`${process.env.REACT_APP_API_BASE}/api/users/login/google`, {
                    username
                })
                .then(res => {
                    setJwtToken(res.data.token);
                    setUserId(res.data.id);
                    setIsSubscribed(res.data.isSubscribed);
                    history.push("/home");
                    localStorage.setItem("mostlinkUserId", res.data.id);
                    toast("Successfully logged in.", { type: "success" });
                })
                .catch(err => {
                    toast(err, { type: "error" });
                })
            } 
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.login}>
                <h1>Log in</h1>
                <GoogleLogin
                    clientId="481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com"
                    buttonText="Continue with Google"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                    isSignedIn={true}
                />
                <h3 style={{ color: themeObj.accentColor }}><Link to="/account/register" style={{ color: themeObj.accentColor }}>Don't have an account? Register instead.</Link></h3>
                <form onSubmit={onSubmit} className={styles.loginForm}>
                    <label htmlFor="username">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />

                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordAndEyeIcon}>
                        <input type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" className={styles.password} />
                        <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className={styles.eyeIcon} />
                    </div>

                    <h3 style={{ color: themeObj.accentColor }}><Link to="/account/forgot-password" style={{ color: themeObj.accentColor }}>Forgot password</Link></h3>

                    <div className={styles.loginFormButtons}>
                        <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                        <button className={styles.submitButton} type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;