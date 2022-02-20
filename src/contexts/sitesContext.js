import React, { createContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const SitesContext = createContext();

const SitesContextProvider = (props) => {
    const [site, setSite] = useState({});
    const [sites, setSites] = useState([]);

    const fetchSite = async siteId => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/sites/siteId/${siteId}`)
            .then(res => {
                setSite(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    const fetchSites = () => {
        axios
            .get(`${process.env.REACT_APP_API_BASE}/sites`)
            .then(res => {
                setSites(res.data);
            })
            .catch(err => {
                toast(err, { type: "error" });
            })
    }

    return (
        <SitesContext.Provider value={{ site, sites, fetchSite, fetchSites }} >
            {props.children}
        </SitesContext.Provider>
    )
}

export default SitesContextProvider;