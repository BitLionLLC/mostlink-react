import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';
import GoogleLogin from 'react-google-login';
import './register.css';

const Register = () => {
    const history = useHistory();
    const { setJwtToken, setUserId, themeObj, theme } = useContext(SitesContext);

    const [firstName, setFirstName] = useState("");
    const [firstNameError, setFirstNameError] = useState("");

    const [lastName, setLastName] = useState("");
    const [lastNameError, setLastNameError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");

    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const [password, setPassword] = useState("");
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const [passwordAgain, setPasswordAgain] = useState("");
    const [isPasswordAgainShowing, setIsPasswordAgainShowing] = useState(false);
    const [passwordAgainError, setPasswordAgainError] = useState("");

    const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$";
    const PASSWORD_ERROR = "This password does not meet the requirements: minimum 12 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special character, and at least 1 numerical digit.";
    const REQUIRED_FIELD_ERROR = "This field is required."

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            email && axios
                .get(`/users/register/check-email/${email}`)
                .then(() => setEmailError(""))
                .catch(() => setEmailError("This email is already in use."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [email])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            username && axios
                .get(`/users/register/check-username/${username}`)
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
                    history.push("/home");
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

    const responseGoogle = (response) => {
        const { profileObj } = response;

        const firstName = profileObj.givenName;
        const lastName = profileObj.familyName;
        const { email } = profileObj;
        const username = email;

        axios
            .post(`/users/register/google`, {
                firstName, lastName, email, username
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
                <GoogleLogin
                    clientId="481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    cookiePolicy={'single_host_origin'}
                    isSignedIn={true}
                />
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
                        <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className="question-mark-tooltip" data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                    </div>
                    <div className="password-and-eye-icon">
                        <input type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" />
                        <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className="eye-icon" />
                    </div>
                    { passwordError && <div className="error-text">{passwordError}</div> }
                    
                    <div className="password-and-tooltip">
                        <label htmlFor="passwordAgain">Re-type password*</label>
                        <ReactTooltip place="right" html={true}/>
                        <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className="question-mark-tooltip" data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                    </div>
                    <div className="password-and-eye-icon">
                        <input type={ isPasswordAgainShowing ? "text" : "password" } value={passwordAgain} onChange={e => setPasswordAgain(e.target.value)} id="passwordAgain" />
                        <FontAwesomeIcon color="black" icon={isPasswordAgainShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordAgainShowing(!isPasswordAgainShowing)} className="eye-icon" />
                    </div>
                    { passwordAgainError && <div className="error-text">{passwordAgainError}</div> }
                    
                    <div>*required field</div>
                    <h3 style={{ color: themeObj.accentColor }}><Link to="/account/login" style={{ color: themeObj.accentColor }}>Log in</Link></h3>
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