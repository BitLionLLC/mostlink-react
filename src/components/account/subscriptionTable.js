import React, { useContext } from 'react';
import { SitesContext } from '../../contexts/sitesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './subscriptionTable.module.css';

const SubscriptionTable = (props) => {
    const { themeObj } = useContext(SitesContext);

    const tableStyle = {
        border: `1px solid ${themeObj.accentColor}`
    }

    const trStyle = {
        borderBottom: `1px solid ${themeObj.color}`
    }

    const tdStyle = {
        borderLeft: `1px solid ${themeObj.color}`
    }

    const getDisplayOfAttribute = (attribute) => {
        if (typeof attribute === "boolean") {
            if (attribute) {
                return <FontAwesomeIcon icon={["fas", "check"]} color="green" />
            } else {
                return <FontAwesomeIcon icon={["fas", "minus"]} color={themeObj.color} />
            }
        } else {
            return attribute;
        }
    }

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table} style={{...tableStyle}}>
                <thead>
                    <tr style={{...trStyle}}>
                        <td className={styles.td}></td>
                        <td className={styles.tdCentered} style={{...tdStyle}}>Free</td>
                        <td className={styles.tdCentered} style={{...tdStyle}}>Premium</td>
                    </tr>
                </thead>
                <tbody>
                    {props.attributes.map((attribute, i) => {
                        return (
                            <tr key={attribute.name} style={i < props.attributes.length - 1 ? {...trStyle} : null}>
                                <td className={styles.td}>{attribute.name}</td>
                                <td className={styles.tdCentered} style={{...tdStyle}}>{getDisplayOfAttribute(attribute.free)}</td>
                                <td className={styles.tdCentered} style={{...tdStyle}}>{getDisplayOfAttribute(attribute.premium)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default SubscriptionTable;