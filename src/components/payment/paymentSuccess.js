import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { SitesContext } from '../../contexts/sitesContext';
import { toast } from 'react-toastify';

import styles from './paymentSuccess.module.css';

const PaymentSuccess = () => {
  const { setIsSubscribed, theme, themeObj } = useContext(SitesContext);

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme])

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users`, { withCredentials: true })
      .then(res => setIsSubscribed(res.data.isSubscribed))
      .catch(err => toast('Could not retrieve your subscription status.', { type: 'error' }))
  }, [])

  const createPortalSession = () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/payment/create-portal-session`, { withCredentials: true })
      .then((res) => {
        window.location.href = res.data.redirect;
      })
      .catch(err => console.log(err))
  }

  return (
    <div className={styles.successContainer}>
      <div className={styles.success} style={{backgroundColor: themeObj.landingCardBackground}}>
        <h1>Payment succeeded!</h1>
        <button onClick={createPortalSession}>Log into Stripe portal</button>
      </div>
    </div>
  )
}

export default PaymentSuccess;