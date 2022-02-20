import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import Home from './components/home';
import SitesContextProvider from './contexts/sitesContext';
import SingleSite from './components/singleSite';
import Account from './components/account/account';
import Login from './components/account/login';
import Register from './components/account/register';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

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
        <Route path="/account/" exact>
          <Account />
        </Route>
        <Route path="/account/register">
          <Register />
        </Route>
        <Route path="/account/login">
          <Login />
        </Route>
      </Router>
    </SitesContextProvider>
  );
}

library.add(fab, far, fas);

export default App;
