import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../../contexts/sitesContext';

import styles from './account.module.css';

const Account = () => {
    const { themeObj, theme, isSubscribed } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    const subscribeToPremium = () => {
        axios
            .post('/api/payment/create-checkout-session', {priceId: "price_1Kmff1KTiWhpJMC56gGnA8J5"})
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
            .catch(err => console.log(err))
    }

    return (
        <div className={styles.accountContainer}>
            <div className={styles.account} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Account</h1>
                {!isSubscribed && <button onClick={subscribeToPremium}>Subscribe to Premium</button>}
                <button onClick={createPortalSession}>Log into Stripe portal</button> to cancel or modify your subscription.
            </div>
        </div>
    )
}

export default Account;