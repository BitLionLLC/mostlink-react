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
    const { setJwtToken, setUserId, themeObj, theme } = useContext(SitesContext);

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
            .post(`/users/login`, {
                username,
                password
            })
            .then(res =>{
                setJwtToken(res.data.token);
                setUserId(res.data.id);
                localStorage.setItem("mostlinkUserId", res.data.id);
                history.push("/home");
            })
            .catch(err => {
                toast("Wrong username or password.", { type: "error"})
            })
    }

    const responseGoogle = (response) => {
        const { profileObj } = response;
        
        const username = profileObj.email;

        axios
            .post(`/users/login/google`, {
                username
            })
            .then(res => {
                setJwtToken(res.data.token);
                setUserId(res.data.id);
                history.push("/home");
                toast("Success", { type: "success" });
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.login}>
                <h1>Log in</h1>
                <GoogleLogin
                    clientId="481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com"
                    buttonText="Log in"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                    isSignedIn={true}
                />
                <form onSubmit={onSubmit} className={styles.loginForm}>
                    <label htmlFor="username">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />

                    <label htmlFor="password">Password</label>
                    <div className={styles.passwordAndEyeIcon}>
                        <input type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" className={styles.password} />
                        <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className={styles.eyeIcon} />
                    </div>

                    <h3 style={{ color: themeObj.accentColor }}><Link to="/account/register" style={{ color: themeObj.accentColor }}>Register</Link></h3>
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