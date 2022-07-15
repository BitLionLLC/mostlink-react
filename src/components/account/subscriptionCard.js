import React, { useContext } from 'react';
import { SitesContext } from '../../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './subscriptionCard.module.css';

const SubscriptionSingle = ({ attributes, tierName }) => {
  const { themeObj } = useContext(SitesContext);
  const tierNameLower = tierName.toLowerCase();

  const getDisplayOfAttribute = (attribute) => {
    if (typeof attribute === 'boolean') {
      if (attribute) {
        return <FontAwesomeIcon icon={['fas', 'check']} color="green" />
      } else {
        return <FontAwesomeIcon icon={['fas', 'minus']} color="red" />
      }
    } else {
      return attribute;
    }
  }

  return (
    <div className={styles.subscriptionCard} style={{backgroundColor: themeObj.bodyColor}}>
      <h1>{attributes.name[tierNameLower]}</h1>
      <ul className={styles.list}>
        <li className={styles.bigText}>{getDisplayOfAttribute(attributes.sites[tierNameLower])} sites</li>
        <li className={styles.bigText}>{getDisplayOfAttribute(attributes.socialLiveNotice[tierNameLower])} social live notice</li>
        <li><h2>{getDisplayOfAttribute(attributes.price[tierNameLower])}</h2></li>
      </ul>
    </div>
  )
}

export default SubscriptionSingle;