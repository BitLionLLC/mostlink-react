import axios from 'axios';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';
import GoogleLogin from 'react-google-login';
import TextField from '@mui/material/TextField';
import { ThemeProvider } from '@mui/material/styles';
import { muiDarkTheme, muiLightTheme } from '../../constants/themes';

import styles from './register.module.css';

const Register = () => {
    const history = useHistory();
    const { setJwtToken, setUserId, setIsSubscribed, themeObj, theme } = useContext(SitesContext);

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
    const PASSWORD_ERROR = "This password does not meet the requirements.";
    const REQUIRED_FIELD_ERROR = "This field is required."

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])
    
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            email && axios
                .get(`${process.env.REACT_APP_API_BASE}/api/users/register/check-email/${email}`)
                .then(() => setEmailError(""))
                .catch(() => setEmailError("This email is already in use."))
        }, 2000)
    
        return () => clearTimeout(delayDebounceFn)
    }, [email])

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            username && axios
                .get(`${process.env.REACT_APP_API_BASE}/api/users/register/check-username/${username}`)
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
                .post(`${process.env.REACT_APP_API_BASE}/api/users/register`, {
                    firstName, lastName, email, username, password
                }, { withCredentials: true })
                .then(res => {
                    setJwtToken(res.data.token);
                    setUserId(res.data.id);
                    setIsSubscribed(res.data.isSubscribed);
                    history.push("/home");
                    toast("Registered successfully.", { type: "success" });
                })
                .catch(err => {
                    toast("A user with that username already exists. Please log in.", { type: "error" });
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

        if (Object.keys(profileObj).length) {
            const firstName = profileObj.givenName;
            const lastName = profileObj.familyName;
            const { email } = profileObj;
            const username = email;

            axios
                .post(`${process.env.REACT_APP_API_BASE}/api/users/register/google`, {
                    firstName, lastName, email, username
                }, { withCredentials: true })
                .then(res => {
                    setJwtToken(res.data.token);
                    setUserId(res.data.id);
                    setIsSubscribed(res.data.isSubscribed);
                    history.push("/home");
                    toast("Registered successfully.", { type: "success" });
                })
                .catch(err => {
                    toast("A user with that username already exists. Please log in.", { type: "error" });
                })
            }
    }

    const failureGoogle = (failure) => console.log(failure);

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
        <div className={styles.registerContainer}>
            <div className={styles.register}>
                <h1>Register</h1>
                <GoogleLogin
                    clientId="481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com"
                    buttonText="Continue with Google"
                    onSuccess={responseGoogle}
                    onFailure={failureGoogle}
                    isSignedIn={true}
                />
                <h3 style={{ color: themeObj.accentColor }}><Link to="/account/login" style={{ color: themeObj.accentColor }}>Already have an account? Log in instead.</Link></h3>
                <ThemeProvider theme={theme === 'light' ? muiLightTheme : muiDarkTheme}>
                    <form className={styles.registerForm} onSubmit={onSubmit}>
                        <label htmlFor="firstName">First name*</label>
                        <TextField type="text" value={firstName} onChange={e => setFirstName(e.target.value)} id="firstName" variant="filled" size="small" className={styles.textField} error={!!firstNameError} helperText={firstNameError} />

                        <label htmlFor="lastName">Last name*</label>
                        <TextField type="text" value={lastName} onChange={e => setLastName(e.target.value)} id="lastName" variant="filled" size="small" className={styles.textField} error={!!lastNameError} helperText={lastNameError} />

                        <label htmlFor="email">Email address*</label>
                        <TextField type="text" value={email} onChange={e => setEmail(e.target.value)} id="email" variant="filled" size="small" className={styles.textField} error={!!emailError} helperText={emailError} />
                        { emailError && emailError === "This email is already in use." && <div className={styles.errorText}>{<span>Would you like to <Link to="/account/login">log in</Link> instead?</span>}</div> }
                        
                        <label htmlFor="username">Username*</label>
                        <TextField type="text" value={username} onChange={e => setUsername(e.target.value)} id="username" variant="filled" size="small" className={styles.textField} error={!!usernameError} helperText={usernameError} />
                        
                        <div className={styles.passwordAndTooltip}>
                            <label htmlFor="password">Password*</label>
                            <ReactTooltip place="right" html={true}/>
                            <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className={styles.questionMarkTooltip} data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                        </div>
                        <div className={styles.passwordAndEyeIcon}>
                            <TextField type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" variant="filled" size="small" className={styles.textField} error={!!passwordError} helperText={passwordError} />
                            <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className={styles.eyeIcon} />
                        </div>
                        
                        <div className={styles.passwordAndTooltip}>
                            <label htmlFor="passwordAgain">Re-type password*</label>
                            <ReactTooltip place="right" html={true}/>
                            <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className={styles.questionMarkTooltip} data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                        </div>
                        <div className={styles.passwordAndEyeIcon}>
                            <TextField type={ isPasswordAgainShowing ? "text" : "password" } value={passwordAgain} onChange={e => setPasswordAgain(e.target.value)} id="passwordAgain" variant="filled" size="small" className={styles.textField} error={!!passwordAgainError} helperText={passwordAgainError} />
                            <FontAwesomeIcon color="black" icon={isPasswordAgainShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordAgainShowing(!isPasswordAgainShowing)} className={styles.eyeIcon} />
                        </div>
                        
                        <div>*required field</div>
                        <div className={styles.registerFormButtons}>
                            <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                            <button 
                                className={styles.submitButton} 
                                type="submit"
                                disabled={firstNameError || lastNameError || emailError || usernameError || passwordError || passwordAgainError}
                            >
                                    Submit
                            </button>
                        </div>
                    </form>
                </ThemeProvider>
            </div>
        </div>
    )
}

export default Register;