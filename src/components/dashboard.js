import React, { useEffect, useContext } from "react";
import LinkPageBuilder from "./linkPageBuilder";
import SitesList from "./sitesList";
import { SitesContext } from "../contexts/sitesContext";

const Dashboard = () => {
  const { themeObj, theme } = useContext(SitesContext);

  useEffect(() => {
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = themeObj.bodyColor;
  }, [theme, themeObj.bodyColor]);

  return (
    <div className="App">
      <LinkPageBuilder />
      <SitesList />
    </div>
  );
};

export default Dashboard;
