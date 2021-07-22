import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/home';
import SitesContextProvider from './contexts/sitesContext';
import SingleSite from './components/singleSite';

function App() {
  return (
    <SitesContextProvider>
      <Router>
        <Route path="/" exact>
          <Home />
        </Route>
        <Route path="/site/:id">
          <SingleSite />
        </Route>
      </Router>
    </SitesContextProvider>
  );
}

export default App;
