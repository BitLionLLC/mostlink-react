import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';

import "./login.css";

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
                localStorage.setItem("mostcardUserId", res.data.id);
                history.push("/home");
            })
            .catch(err => {
                toast("Wrong username or password.", { type: "error"})
            })
    }

    return (
        <div className="login-container">
            <div className="login">
                <h1>Log in</h1>
                <form onSubmit={onSubmit} className="login-form">
                    <label htmlFor="username">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />

                    <label htmlFor="password">Password</label>
                    <div className="password-and-eye-icon">
                        <input type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" />
                        <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className="eye-icon" />
                    </div>

                    <h3 style={{ color: themeObj.accentColor }}><Link to="/account/register" style={{ color: themeObj.accentColor }}>Register</Link></h3>
                    <div className="register-form-buttons">
                        <button className="cancel-button" onClick={onCancel}>Cancel</button>
                        <button className="submit-button" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login;