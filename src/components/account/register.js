import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './register.css';

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            email && axios
                .get(`${process.env.REACT_APP_API_BASE}/users/register/check-email/${email}`)
                .then(() => setEmailError(""))
                .catch(() => setEmailError("This email address is already in use. Log in instead."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [email])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            username && axios
                .get(`${process.env.REACT_APP_API_BASE}/users/register/check-username/${username}`)
                .then(() => setUsernameError(""))
                .catch(() => setUsernameError("This username is already in use. Try a different one."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [username])

    return (
        <div className="register-container">
            <div className="register">
                <h1>Register</h1>
                <form className="register-form">
                    <label htmlFor="firstName">First name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} id="firstName" />
                    <label htmlFor="lastName">Last name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} id="lastName" />
                    <label htmlFor="email">Email address</label>
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)} id="email" />
                    { emailError && <div>{emailError}</div> }
                    <label htmlFor="username">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />
                    { usernameError && <div>{usernameError}</div> }
                    <label htmlFor="password">Password</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} id="password" />
                    <label htmlFor="passwordAgain">Re-type password</label>
                    <input type="text" value={passwordAgain} onChange={e => setPasswordAgain(e.target.value)} id="passwordAgain" />
                    <div className="register-form-buttons">
                        <button className="cancel-button">Cancel</button>
                        <button className="submit-button" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register;