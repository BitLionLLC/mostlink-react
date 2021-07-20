import './App.css';
import React from 'react';
import LinkPageBuilder from './components/linkPageBuilder';
import { ToastContainer } from 'react-toastify';
import SitesContextProvider from './contexts/sitesContext';
import 'react-toastify/dist/ReactToastify.css';
import SitesList from './components/sitesList';


function App() {
  return (
    <SitesContextProvider>
      <div className="App">
        <h1>A really cool link page builder</h1>
        <LinkPageBuilder />
        <ToastContainer position="top-right" autoClose={5000} />
        <SitesList />
      </div>
    </SitesContextProvider>
  );
}

export default App;
