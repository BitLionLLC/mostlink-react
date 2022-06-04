import axios from 'axios';
import { useHistory } from 'react-router-dom';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGoogleLogout } from 'react-google-login';
import { SitesContext } from '../../contexts/sitesContext';

import styles from './account.module.css';

const Account = () => {
    const { themeObj, theme, isSubscribed, setJwtToken, setUserId } = useContext(SitesContext);
    const history = useHistory();
    const [isDeleteModalShowing, setIsDeleteModalShowing] = useState(false);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    const subscribeToPremium = () => {
        axios
            .post('/api/payment/create-checkout-session', {priceId: "price_1L70lyKTiWhpJMC5zJmDcOWx"})
            .then((res) => {
                window.location.href = res.data.redirect;
            })
            .catch(err => console.log(err))
    }

    const createPortalSession = () => {
        axios
            .get('/api/payment/create-portal-session')
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
            .delete('/api/users')
            .then(res => {
                setJwtToken(null);
                setUserId(null);
                localStorage.removeItem("mostlinkUserId");

                toast('Successfully deleted your account.', { type: "success" });
                history.push("/");
            })
            .catch(err => {
                toast('Could not delete your account. Please try again.', { type: "error" });
            })
    }

    return (
        <div className={styles.accountContainer}>
            <div className={styles.account} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Account</h1>
                <button className={styles.generalButton} onClick={subscribeToPremium} disabled={isSubscribed}>Subscribe to Premium</button>
                <button className={styles.generalButton} onClick={createPortalSession}>Log into Stripe portal</button> to cancel or modify your subscription.
                <button className={styles.deleteAccountButton} onClick={() => setIsDeleteModalShowing(true)}>Delete account</button>
            </div>
            { isDeleteModalShowing ?
                <> 
                    <div className={styles.blocker} onClick={() => setIsDeleteModalShowing(false)}></div>
                    <div className={styles.deleteAccountModal}>
                        <div className={styles.closeButton} onClick={() => setIsDeleteModalShowing(false)}>+</div>
                        <h1>Delete account</h1>
                        <p>Are you sure you want to delete your account? This action cannot be undone. Your sites will be lost forever (a long time!)</p>
                        <div className={styles.deleteAccountButtons}>
                            <button className={styles.cancelButton} onClick={() => setIsDeleteModalShowing(false)}>Cancel</button>
                            <button className={styles.deleteButton} onClick={deleteAccount}>Delete</button>
                        </div>
                    </div>
                </>
            : null }
        </div>
    )
}

export default Account;