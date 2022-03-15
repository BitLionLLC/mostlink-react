import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';
import './register.css';

const Register = () => {
    const history = useHistory();
    const { setJwtToken, setUserId } = useContext(SitesContext);

    const [firstName, setFirstName] = useState("");
    const [firstNameError, setFirstNameError] = useState("");

    const [lastName, setLastName] = useState("");
    const [lastNameError, setLastNameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [passwordAgain, setPasswordAgain] = useState("");
    const [passwordAgainError, setPasswordAgainError] = useState("");

    const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$";
    const PASSWORD_ERROR = "This password does not meet the requirements: minimum 12 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special character, and at least 1 numerical digit.";
    const REQUIRED_FIELD_ERROR = "This field is required."

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            email && axios
                .get(`${process.env.REACT_APP_API_BASE}/users/register/check-email/${email}`)
                .then(() => setEmailError(""))
                .catch(() => setEmailError("This email is already in use."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [email])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            username && axios
                .get(`${process.env.REACT_APP_API_BASE}/users/register/check-username/${username}`)
                .then(() => setUsernameError(""))
                .catch(() => setUsernameError("That username is already in use. Please try another one."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [username])

    useEffect(() => {
        if (password && !password.match(PASSWORD_REGEX)) {
            setPasswordError(PASSWORD_ERROR)
        } else if (passwordAgain && !passwordAgain.match(PASSWORD_REGEX)) {
            setPasswordAgainError(PASSWORD_ERROR)
        } else if (password && passwordAgain && !(password === passwordAgain)) {
            setPasswordAgainError("These passwords don't match.")
        } else {
            setPasswordError("");
            setPasswordAgainError("");
        }
    }, [password, passwordAgain])

    const onSubmit = e => {
        e.preventDefault();

        const isFilledOut = firstName && lastName && email && username && password && passwordAgain;
        const hasError = usernameError || emailError || passwordError || passwordAgainError;

        if (isFilledOut && !hasError) {
            axios
                .post(`/users/register`, {
                    firstName, lastName, email, username, password
                })
                .then(res => {
                    setJwtToken(res.data.token);
                    setUserId(res.data.id);
                    toast("Success", { type: "success" });
                })
                .catch(err => {
                    toast(err, { type: "error" });
                })
        } else {
            if (!firstName) {setFirstNameError(REQUIRED_FIELD_ERROR)}
            if (!lastName) {setLastNameError(REQUIRED_FIELD_ERROR)}
            if (!email) {setEmailError(REQUIRED_FIELD_ERROR)}
            if (!username) {setUsernameError(REQUIRED_FIELD_ERROR)}
            if (!password) {setPasswordError(REQUIRED_FIELD_ERROR)}
            if (!passwordAgain) {setPasswordAgainError(REQUIRED_FIELD_ERROR)}
        }
    }

    const onCancel = () => {
        setFirstName("");
        setLastName("");
        setEmail("")
        setUsername("");
        setPassword("");
        setPasswordAgain("");
        
        history.push("/");
    }

    return (
        <div className="register-container">
            <div className="register">
                <h1>Register</h1>
                <form className="register-form" onSubmit={onSubmit}>
                    <label htmlFor="firstName">First name*</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} id="firstName" />
                    { firstNameError && <div className="error-text">{firstNameError}</div> }

                    <label htmlFor="lastName">Last name*</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} id="lastName" />
                    { lastNameError && <div className="error-text">{lastNameError}</div> }

                    <label htmlFor="email">Email address*</label>
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)} id="email" />
                    { emailError && <div className="error-text">{emailError} {emailError === "This email is already in use." && <span>Would you like to <Link to="/account/login">log in</Link> instead?</span>}</div> }
                    
                    <label htmlFor="username">Username*</label>
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" />
                    { usernameError && <div className="error-text">{usernameError}</div> }
                    
                    <div className="password-and-tooltip">
                        <label htmlFor="password">Password*</label>
                        <ReactTooltip place="right" html={true}/>
                        <div className="question-mark-tooltip" data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                    </div>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} id="password" />
                    { passwordError && <div className="error-text">{passwordError}</div> }
                    
                    <div className="password-and-tooltip">
                        <label htmlFor="passwordAgain">Re-type password*</label>
                        <ReactTooltip place="right" html={true}/>
                        <div className="question-mark-tooltip" data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                    </div>
                    <input type="password" value={passwordAgain} onChange={e => setPasswordAgain(e.target.value)} id="passwordAgain" />
                    { passwordAgainError && <div className="error-text">{passwordAgainError}</div> }
                    
                    <div>*required field</div>
                    <div className="register-form-buttons">
                        <button className="cancel-button" onClick={onCancel}>Cancel</button>
                        <button className="submit-button" type="submit">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Register;