import axios from 'axios';
import React, { useContext, useEffect } from 'react';
import { SitesContext } from '../../contexts/sitesContext';

import styles from './account.module.css';

const Account = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    const subscribeToPremium = () => {
        axios
            .post('/payment/create-checkout-session', {priceId: "price_1Kmff1KTiWhpJMC56gGnA8J5"})
            .then((res) => {
                window.location.href = res.data.redirect;
            })
            .catch(err => console.log(err))
    }

    return (
        <div className={styles.accountContainer}>
            <div className={styles.account} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Account</h1>
                <button onClick={subscribeToPremium}>Subscribe to Premium</button>
                <button>Cancel subscription</button>
            </div>
        </div>
    )
}

export default Account;