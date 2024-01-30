import React , { useContext, useEffect} from "react";
import { SitesContext } from "../../contexts/sitesContext";

import styles from "./paymentCanceled.module.css";

const PaymentCanceled = () => {
  const { theme, themeObj } = useContext(SitesContext);

  useEffect(() => {
    document.body.style.backgroundImage = themeObj.landingBackground;
  }, [theme]);

  return (
    <div className={styles.canceledContainer}>
      <div className={styles.canceled} style={{backgroundColor: themeObj.landingCardBackground}}>
        <h1>Payment canceled</h1>
      </div>
    </div>
  );
};

export default PaymentCanceled;