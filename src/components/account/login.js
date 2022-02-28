import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { SitesContext } from '../../contexts/sitesContext';
import "./login.css";
import { toast } from 'react-toastify';

const Login = () => {
    const history = useHistory();
    const { setJwtToken, setUserId } = useContext(SitesContext);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);

    const onCancel = () => {
        setUsername("");
        setPassword("");
        
        history.push("/");
    }

    const onSubmit = e => {
        e.preventDefault();

        axios
            .post(`${process.env.REACT_APP_API_BASE}/users/login`, {
                username,
                password
            })
            .then(res =>{
                setJwtToken(res.data.token);
                setUserId(res.data.id);
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
                        <FontAwesomeIcon icon={isPasswordShowing ? ["fas", "eye-slash"] : ["fas", "eye"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className="eye-icon" />
                    </div>

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