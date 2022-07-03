import React, { useContext, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { TextField, Select, MenuItem, ListItemText, Button } from '@mui/material';
import { SitesContext } from '../contexts/sitesContext';

import styles from './editableLink.module.css';

const style = {
    border: '1px dashed gray',
    padding: '0.5rem 1rem',
    marginBottom: '.5rem',
};

const LIVE_TYPES = {
    NONE: "none",
    TWITCH: "twitch",
    YOUTUBE: "youtube"
}

const EditableLink = ({ link, links, setLinks, deleteLink, moveLink, index, id, key }) => {
    const { isSubscribed, theme } = useContext(SitesContext);

    const [typeOfLiveNotification, setTypeOfLiveNotification] = useState(link.live?.type || LIVE_TYPES.NONE);
    const [liveMeta, setLiveMeta] = useState(link.live?.meta || "");

    const transformIconKey = (key, lib) => {
        const arr = key.split("").slice(2);
        const display = arr.join("");
        let valueArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i])) && i !== 0) {
                valueArr.push("-");
                valueArr.push(arr[i].toLowerCase());
            } else if (arr[i].toUpperCase() === arr[i] && !Number.isInteger(Number(arr[i]))) {
                valueArr.push(arr[i].toLowerCase());
            } else {
                valueArr.push(arr[i]);
            }
        }

        const value = lib + "_" + valueArr.join("");
        return [display, value];
    }

    const selectOptions = Object.keys(fab).concat(Object.keys(far)).filter((key) => key !== "faFontAwesomeLogoFull").sort().map(key => {
        let lib;
        if (Object.keys(far).includes(key)) {
            lib = "far"
        } else {
            lib = "fab"
        }
        const [label, value] = transformIconKey(key, lib);
        return {value, label}
    })
    
    return (
        <li className={styles.linkEditLi} style={{...style}}>                   
            {index > 0 && <Button disabled={index === 0} onClick={() => moveLink(index, index - 1)}>move up &uarr;</Button>}
            <TextField type="text" value={link.text} className={styles.textField} variant="filled" size="small" placeholder={`Link #${index + 1} text`} onChange={e => {
                const newLinks = links.slice();
                newLinks[index].text = e.target.value;
                setLinks(newLinks);
            }} />
            <TextField type="text" value={link.href} className={styles.textField} variant="filled" size="small" placeholder={`Link #${index + 1} URI`} onChange={e => {
                const newLinks = links.slice();
                newLinks[index].href = e.target.value;
                setLinks(newLinks);
            }} />
            <FontAwesomeIcon icon={["far", "window-close"]} size="1x" onClick={() => deleteLink(index)} color="red" className={styles.deleteLink} />
            <Select
                className={styles.iconOptionSelect}
                onChange={e => {
                    const newLinks = links.slice();
                    newLinks[index].icon = e.target.value;
                    setLinks(newLinks);
                }} 
                defaultValue={selectOptions.find(obj => obj.value === link?.icon).value} 
            >
                {selectOptions.map(option => <MenuItem value={option.value} className={styles.iconOption}>
                    <ListItemText>{option.label}</ListItemText>
                    <FontAwesomeIcon icon={option.value.split("_")} size="2x" className={styles.iconOptionIcon} />
                </MenuItem>)}
            </Select>

            {
                isSubscribed || true // TODO: remove OR condition when out of beta
                ?
                    <>
                        <Select 
                            value={typeOfLiveNotification} 
                            onChange={e => {
                                setTypeOfLiveNotification(e.target.value);
                                const newLinks = links.slice();
                                newLinks[index].live = Object.assign({}, newLinks[index].live, {type: e.target.value}); 
                                setLinks(newLinks);
                            }}
                        >
                            <MenuItem value={LIVE_TYPES.NONE}>Not a live notification</MenuItem>
                            <MenuItem value={LIVE_TYPES.TWITCH}>Twitch live notification</MenuItem>
                            <MenuItem value={LIVE_TYPES.YOUTUBE}>YouTube Live Notification</MenuItem>
                        </Select>
                        {
                            typeOfLiveNotification !== LIVE_TYPES.NONE 
                            ?
                                <TextField 
                                    className={styles.textField} variant="filled" size="small"
                                    value={liveMeta} 
                                    onChange={e => {
                                        setLiveMeta(e.target.value);
                                        const newLinks = links.slice();
                                        newLinks[index].live = Object.assign({}, newLinks[index].live, {meta: e.target.value}); 
                                        setLinks(newLinks);
                                    }}
                                    placeholder={typeOfLiveNotification === LIVE_TYPES.TWITCH ? "channel name" : "channel ID" }
                                />
                            :
                                    null
                        }
                    </>
                :
                    null
            }
            {index < links.length - 1 && <Button disabled={index === links.length - 1} onClick={() => moveLink(index, index + 1)}>move down &darr;</Button>}
        </li>
    )
}

export default EditableLink;