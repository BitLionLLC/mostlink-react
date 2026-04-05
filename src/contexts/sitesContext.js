import React, { createContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { lightTheme, darkTheme } from "../constants/themes";
import { toast } from "react-toastify";

export const SitesContext = createContext();
const localTheme = localStorage.getItem("mostlinkTheme");

const SitesContextProvider = (props) => {
  const [site, setSite] = useState({});
  const [siteLoading, setSiteLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [theme, setTheme] = useState(localTheme || "dark");
  const [themeObj, setThemeObj] = useState(
    localTheme === "light" ? lightTheme : darkTheme
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [withGoogle, setWithGoogle] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalOpenedWith, setEditModalOpenedWith] = useState({});
  const createSiteModalRef = useRef(null);
  const [singleSiteTabIndex, setSingleSiteTabIndex] = useState(0);

  useEffect(() => {
    fetchJwt();
    fetchUser();
  }, []);

  const fetchJwt = async () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users/jwt`, {
        withCredentials: true,
      })
      .then((res) => {
        // console.log(res.data);
        setJwtToken(res.data.token);
      })
      .catch((err) => console.log(err));
  };

  const fetchUser = async () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users/`, {
        withCredentials: true,
      })
      .then((res) => {
        setEmail(res.data.email);
        setUserId(res.data.id);
        setWithGoogle(res.data.google);
        setIsSubscribed(res.data.isSubscribed);
      })
      .catch((err) => console.log(err));
  };

  const fetchSite = async (siteId) => {
    setSiteLoading(true);

    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/sites/siteId/${siteId}`, {
        withCredentials: true,
      })
      .then((res) => {
        setSite(res.data);
        setSiteLoading(false);
      })
      .catch((err) => {
        setSiteLoading(false);
        toast(err.response.data.error, { type: "error", theme });
      });
  };

  const fetchSites = () => {
    setSitesLoading(true);

    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/sites/byUserId`, {
        withCredentials: true,
      })
      .then((res) => {
        setSites(res.data);
        setSitesLoading(false);
      })
      .catch((err) => {
        setSitesLoading(false);
        toast(err.response.data.error, { type: "error", theme });
      });
  };

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
  };

  return (
    <SitesContext.Provider
      value={{
        site,
        siteLoading,
        sites,
        sitesLoading,
        jwtToken,
        userId,
        theme,
        themeObj,
        isSubscribed,
        createSiteModalRef,
        email,
        withGoogle,
        isEditModalOpen,
        editModalOpenedWith,
        singleSiteTabIndex,
        fetchSite,
        fetchSites,
        fetchUser,
        setJwtToken,
        setUserId,
        setTheme,
        setEmail,
        setWithGoogle,
        toggleTheme,
        setIsSubscribed,
        setIsEditModalOpen,
        setEditModalOpenedWith,
        setSingleSiteTabIndex,
      }}
    >
      {props.children}
    </SitesContext.Provider>
  );
};

export default SitesContextProvider;
