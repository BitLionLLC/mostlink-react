import React from "react";
import ReactDOM from "react-dom";
import "react-tooltip/dist/react-tooltip.css";
import "./index.css";
import App from "./App";
import { DndProvider } from "react-dnd";
import SitesContextProvider from "./contexts/sitesContext";
import { HTML5Backend } from "react-dnd-html5-backend";
import reportWebVitals from "./reportWebVitals";

document.documentElement.setAttribute(
  "data-mostlink-theme",
  localStorage.getItem("mostlinkTheme") || "dark"
);

ReactDOM.render(
  <React.StrictMode>
    <SitesContextProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </SitesContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
