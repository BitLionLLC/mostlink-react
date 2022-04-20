import React, { useEffect, useContext, useState } from 'react';
import SubscriptionTable from './account/subscriptionTable';
import SubscriptionSingle from './account/subscriptionSingle';
import { SitesContext } from '../contexts/sitesContext';

import styles from './pricing.module.css';

const SUBSCRIPTION_ATTRIBUTES = [
    {"name": "Number of Sites", "free": 3, "premium": "Unlimited"},
    {"name": "Social Live Notice", "free": false, "premium": true},
    {"name": "Price", "free": "Free!", "premium": "$5/mo"},
]

const Pricing = () => {
    const { themeObj, theme } = useContext(SitesContext);

    const getWindowDimensions = () => {
        const { innerWidth: width, innerHeight: height } = window;
        return {
          width,
          height
        };
    }

    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        document.body.style.backgroundImage = themeObj.landingBackground;
    }, [theme])

    useEffect(() => {
        function handleResize() {
          setWindowDimensions(getWindowDimensions());
        }
    
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <div className={styles.pricingContainer}>
            <div className={styles.pricing} style={{backgroundColor: themeObj.landingCardBackground}}>
                <h1>Pricing</h1>

                <div className={styles.subscription}>
                    {
                        windowDimensions.width >= 1000 ?
                            <SubscriptionTable attributes={SUBSCRIPTION_ATTRIBUTES} />
                        :
                            <>
                                <SubscriptionSingle attributes={SUBSCRIPTION_ATTRIBUTES} tierName="Free" />
                                <SubscriptionSingle attributes={SUBSCRIPTION_ATTRIBUTES} tierName="Premium" />
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default Pricing;