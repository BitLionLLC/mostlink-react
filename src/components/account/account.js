import axios from 'axios';
import { useHistory } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGoogleLogout } from 'react-google-login';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactTooltip from 'react-tooltip';
import { SitesContext } from '../../contexts/sitesContext';

import styles from './account.module.css';

const Account = () => {
    const { themeObj, theme, isSubscribed, setJwtToken, setUserId } = useContext(SitesContext);
    
    const history = useHistory();

    const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);
    const [isChangePasswordModalShowing, setIsChangePasswordModalShowing] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [isOldPasswordShowing, setIsOldPasswordShowing] = useState(false);
    const [oldPasswordError, setOldPasswordError] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isNewPasswordShowing, setIsNewPasswordShowing] = useState(false);
    const [newPasswordError, setNewPasswordError] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordShowing, setIsPasswordShowing] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    const PASSWORD_REGEX = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$";
    const PASSWORD_ERROR = "This password does not meet the requirements: minimum 12 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 special character, and at least 1 numerical digit.";
    const SAME_PASSWORD_ERROR = "You cannot use the same password for your new one.";

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    useEffect(() => {
        if (oldPassword === newPassword) {
            setNewPasswordError(SAME_PASSWORD_ERROR)
        } else if (oldPassword && !oldPassword.match(PASSWORD_REGEX)) {
            setOldPasswordError(PASSWORD_ERROR);
        } else if (newPassword && !newPassword.match(PASSWORD_REGEX)) {
            setNewPasswordError(PASSWORD_ERROR);
        } else {
            setOldPasswordError("");
            setNewPasswordError("");
        }
    }, [oldPassword, newPassword])

    useEffect(() => {
        if (password && !password.match(PASSWORD_REGEX)) {
            setPasswordError(PASSWORD_ERROR);
        } else {
            setPasswordError("");
        }
    }, [password])

    const subscribeToPremium = () => {
        axios
            .post(`${process.env.REACT_APP_API_BASE}/api/payment/create-checkout-session`, {priceId: "price_1L70lyKTiWhpJMC5zJmDcOWx"}, { withCredentials: true })
            .then((res) => {
                window.location.href = res.data.redirect;
            })
            .catch(err => console.log(err))
    }

    const createPortalSession = () => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/api/payment/create-portal-session`, { withCredentials: true })
            .then((res) => {
                window.location.href = res.data.redirect;
            })
            .catch(err => {
                toast('Could not create portal session. Please subscribe first.', { type: "error" });
            })
    }

    const { signOut } = useGoogleLogout({
        jsSrc: "https://apis.google.com/js/api.js",
        onFailure: (err) => toast(err, { type: "error"}),
        clientId: "481338672906-flcd6hp10b7svfp0k5q8t289l5bmv40q.apps.googleusercontent.com",
        redirectUri: "/",
        onLogoutSuccess: () => {}
    })

    const deleteAccount = () => {
        signOut();

        axios
            .put(`${process.env.REACT_APP_API_BASE}/api/users/delete`, { password }, { withCredentials: true })
            .then(res => {
                setJwtToken(null);
                setUserId(null);
                localStorage.removeItem("mostlinkUserId");

                toast('Successfully deleted your account.', { type: "success" });
                history.push("/");
            })
            .catch(err => {
                toast('Could not delete your account. Please check your password and try again.', { type: "error" });
            })
    }

    const changePassword = () => {
        axios
            .put(`${process.env.REACT_APP_API_BASE}/api/users/change-password`, { oldPassword, newPassword }, { withCredentials: true })
            .then(() => {
                toast('Successfully changed your password.', { type: "success" });
            })
            .catch(() => {
                toast('There was an issue changing your password. Please try again.', { type: "error" });
            })
    }

    return (
        <div className={styles.accountContainer}>
            <div className={styles.account} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Account</h1>
                {/* <button className={styles.generalButton} onClick={subscribeToPremium} disabled={isSubscribed}>Subscribe to Premium</button>
                <button className={styles.generalButton} onClick={createPortalSession}>Log into Stripe portal</button> to cancel or modify your subscription. */}
                <button className={styles.generalButton} onClick={() => setIsChangePasswordModalShowing(true)}>Change password</button>
                <button className={styles.deleteAccountButton} onClick={() => setIsDeleteModalShowing(true)}>Delete account</button> 
            </div>
            { isDeleteModalShowing ?
                <> 
                    <div className={styles.blocker} onClick={() => setIsDeleteModalShowing(false)}></div>
                    <div className={styles.deleteAccountModal}>
                        <div className={styles.closeButton} onClick={() => setIsDeleteModalShowing(false)}>+</div>
                        <h1>Delete account</h1>
                        <p>Are you sure you want to delete your account? This action cannot be undone. Your sites will be lost forever (a long time!)</p>
                        <div className={styles.labelAndInput}>
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
                        </div>
                        <div className={styles.deleteAccountButtons}>
                            <button className={styles.cancelButton} onClick={() => setIsDeleteModalShowing(false)}>Cancel</button>
                            <button className={styles.deleteButton} onClick={deleteAccount} disabled={!password || passwordError}>Delete</button>
                        </div>
                    </div>
                </>
            : null }
            { isChangePasswordModalShowing ?
                <> 
                    <div className={styles.blocker} onClick={() => setIsChangePasswordModalShowing(false)}></div>
                    <div className={styles.changePasswordModal}>
                        <div className={styles.closeButton} onClick={() => setIsChangePasswordModalShowing(false)}>+</div>
                        <h1>Change password</h1>
                        <p>If you registered with Google, <br/>you do not need to change your password here.</p>
                        <div className={styles.changePasswordForm}>
                            <div className={styles.labelAndInput}>
                                <div className={styles.passwordAndTooltip}>
                                    <label htmlFor="oldPassword">Old Password*</label>
                                    <ReactTooltip place="right" html={true}/>
                                    <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className={styles.questionMarkTooltip} data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                                </div>
                                <div className={styles.passwordAndEyeIcon}>
                                    <input type={ isOldPasswordShowing ? "text" : "password" } value={oldPassword} onChange={e => setOldPassword(e.target.value)} id="oldPassword" />
                                    <FontAwesomeIcon color="black" icon={isOldPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsOldPasswordShowing(!isOldPasswordShowing)} className={styles.eyeIcon} />
                                </div>
                                { oldPasswordError && <div className={styles.errorText}>{oldPasswordError}</div> }
                            </div>
                            <div className={styles.labelAndInput}>
                                <div className={styles.passwordAndTooltip}>
                                    <label htmlFor="newPassword">New Password*</label>
                                    <ReactTooltip place="right" html={true}/>
                                    <div style={{color: themeObj.bodyColor, backgroundColor: themeObj.color}} className={styles.questionMarkTooltip} data-tip="<div>Password requirements:<ol><li>Minimum 12 characters</li><li>At least one uppercase letter</li><li>At least one lowercase letter</li><li>At least one special character</li><li>At least one numercial digit</li></ol></div>">?</div>
                                </div>
                                <div className={styles.passwordAndEyeIcon}>
                                    <input type={ isNewPasswordShowing ? "text" : "password" } value={newPassword} onChange={e => setNewPassword(e.target.value)} id="newPassword" />
                                    <FontAwesomeIcon color="black" icon={isNewPasswordShowing ? ["fas", "eye"] : ["fas", "eye-slash"]} onClick={() => setIsNewPasswordShowing(!isNewPasswordShowing)} className={styles.eyeIcon} />
                                </div>
                                { newPasswordError && <div className={styles.errorText}>{newPasswordError}</div> }
                            </div>

                            <span>*required field</span>

                            <div className={styles.deleteAccountButtons}>
                                <button className={styles.cancelChangeButton} onClick={() => setIsChangePasswordModalShowing(false)}>Cancel</button>
                                <button className={styles.submitButton} onClick={changePassword} disabled={!oldPassword || !newPassword || oldPasswordError || newPasswordError}>Submit</button>
                            </div>
                        </div>
                    </div>
                </>
            : null }
        </div>
    )
}

export default Account;