import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';

import styles from './resetPassword.module.css';

const ResetPassword = () => {
    const { themeObj, theme } = useContext(SitesContext);
    const match = useRouteMatch();
    const { token, userId } = match.params;
    const history = useHistory();

    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);

    const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$";
    const PASSWORD_ERROR = "This password does not meet the requirements: minimum 12 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special character, and at least 1 numerical digit.";

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    useEffect(() => {
        if (password && !password.match(PASSWORD_REGEX)) {
            setPasswordError(PASSWORD_ERROR);
        } else {
            setPasswordError("");
        }
    }, [password])

    const onSubmit = () => {
        axios
            .post(`${process.env.REACT_APP_API_BASE}/api/users/forgot-password/reset`, { token, userId, password }, { withCredentials: true })
            .then(res => {
                toast('Password successfully reset. Refresh and you\'ll log in.', { type: "success" });
                history.push("/");
            })
            .catch(err => {
                toast('Could not create reset your password. Try again.', { type: "error" });
            })
    }

    const onCancel = () => {
        history.push("/");
    }

    return ( 
        <div className={styles.resetPasswordContainer}>
            <div className={styles.resetPassword} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Reset password</h1>
                <div className={styles.passwordAndTooltip}>
                    <label htmlFor="password">Password*</label>
                    <ReactTooltip place="right" html={true}/>
                    <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className={styles.questionMarkTooltip} data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                </div>
                <div className={styles.passwordAndEyeIcon}>
                    <input type={ isPasswordShowing ? "text" : "password" } value={password} onChange={e => setPassword(e.target.value)} id="password" />
                    <FontAwesomeIcon color="black" icon={isPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsPasswordShowing(!isPasswordShowing)} className={styles.eyeIcon} />
                </div>
                { passwordError && <div className={styles.errorText}>{passwordError}</div> }
            
                <div className={styles.resetPasswordButtons}>
                    <button className={styles.cancelButton} onClick={onCancel}>Cancel</button>
                    <button className={styles.submitButton} onClick={onSubmit} disabled={!password || passwordError}>Submit</button>
                </div>    
            </div>
        </div>
    )
}

export default ResetPassword;