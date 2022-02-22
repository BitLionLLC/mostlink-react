import React, { useState, useEffect } from 'react';
import './register.css';

const Register = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");

    return (
        <div className="register-container">
            <div className="register">
                <h1>Register</h1>
                <form className="register-form">
                    <label for="firstName">First name</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} id="firstName" />
                    <label for="lastName">Last name</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} id="lastName" />
                    <label for="email">Email address</label>
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)} id="email" />
                    <label for="username">Username</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />
                    <label for="password">Password</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} id="password" />
                    <label for="passwordAgain">Re-type password</label>
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