import React, { useContext } from 'react';
import { SitesContext } from '../../contexts/sitesContext';

import styles from './pleaseVerify.module.css';

const PleaseVerify = () => {
  const { themeObj } = useContext(SitesContext);

  return (
    <div className={styles.pleaseVerifyContainer}>
      <div className={styles.pleaseVerify} style={{backgroundColor: themeObj.landingCardBackground}}>
        <h1>Please verify your email by clicking the link in the email we just sent to you.</h1>
      </div>
    </div>
  );
};

export default PleaseVerify;