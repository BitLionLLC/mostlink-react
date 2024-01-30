import React, { useEffect } from "react";
import CreateSite from "./createSite";
import EditSite from "./editSite";

const LinkPageBuilder = () => {
  useEffect(() => {
    document.body.style.backgroundImage = null;
  }, []);
    
  return (
    <div>
      <CreateSite />
      <EditSite />
    </div>
  );
};

export default LinkPageBuilder;