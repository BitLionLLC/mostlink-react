import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { lightTheme, darkTheme } from '../constants/themes';
import { toast } from 'react-toastify';

export const SitesContext = createContext();
const localTheme = localStorage.getItem("mostlinkTheme");

const SitesContextProvider = (props) => {
    const [site, setSite] = useState({});
    const [sites, setSites] = useState([]);
    const [jwtToken, setJwtToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [theme, setTheme] = useState(localTheme);
    const [themeObj, setThemeObj] = useState(localTheme === "light" ? lightTheme : darkTheme);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        axios
            .get(`/api/users/`)
            .then(res => setIsSubscribed(res.data.isSubscribed))
            .catch(err => console.log(err));
    }, [])

    const fetchSite = async siteId => {
        axios
            .get(`/api/sites/siteId/${siteId}`)
            .then(res => {
                setSite(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const fetchSites = () => {
        axios
            .get(`/api/sites/byUserId`)
            .then(res => {
                setSites(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const toggleTheme = () => {
        if (theme === "dark") {
            setTheme("light");
            setThemeObj(lightTheme);
            localStorage.setItem("mostlinkTheme", "light");
        } else {
            setTheme("dark");
            setThemeObj(darkTheme);
            localStorage.setItem("mostlinkTheme", "dark");
        }
    }

    return (
        <SitesContext.Provider value={{ 
            site, 
            sites, 
            jwtToken, 
            userId, 
            theme, 
            themeObj,
            isSubscribed, 
            fetchSite, 
            fetchSites, 
            setJwtToken, 
            setUserId, 
            setTheme, 
            toggleTheme,
            setIsSubscribed
        }} >
            {props.children}
        </SitesContext.Provider>
    )
}

export default SitesContextProvider;