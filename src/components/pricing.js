import React, { useEffect, useContext, useState } from 'react';
import SubscriptionCard from './account/subscriptionCard';
import { SitesContext } from '../contexts/sitesContext';

import styles from './pricing.module.css';

const SUBSCRIPTION_ATTRIBUTES = {
    name: {
        free: "Free forever",
        premium: "Premium"
    },
    price: {
        free: "Free!",
        premium: "$5/mo"
    },
    sites: {
        free: 3,
        premium: "unlimited"
    },
    socialLiveNotice: {
        free: false,
        premium: true
    }
}

const Pricing = () => {
    const { themeObj, theme } = useContext(SitesContext);

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])
    
    return (
        <div className={styles.pricingContainer}>
            <div className={styles.pricing} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Pricing</h1>

                <div className={styles.subscription}>
                    <SubscriptionCard attributes={SUBSCRIPTION_ATTRIBUTES} tierName="Free" />
                    <SubscriptionCard attributes={SUBSCRIPTION_ATTRIBUTES} tierName="Premium" />
                </div>
            </div>
        </div>
    )
}

export default Pricing;