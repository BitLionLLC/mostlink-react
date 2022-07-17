import './App.css';
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Home from './components/home';
import { SitesContext } from './contexts/sitesContext';
import SingleSite from './components/singleSite';
import Account from './components/account/account';
import Login from './components/account/login';
import Register from './components/account/register';
import ResetPassword from './components/account/resetPassword';
import ForgotPassword from './components/account/forgotPassword';
import Header from './components/header';
import Footer from './components/footer';
import Landing from './components/landing/landing';
import Pricing from './components/pricing';
import PrivacyPolicy from './components/privacyPolicy';
import Feedback from './components/feedback';
import PaymentSuccess from './components/payment/paymentSuccess';
import PaymentCanceled from './components/payment/paymentCanceled';
import PleaseVerify from './components/account/pleaseVerify';
import VerifyEmail from './components/account/verifyEmail';
import { ToastContainer } from 'react-toastify';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ThemeProvider } from '@mui/material/styles';
import { muiDarkTheme, muiLightTheme } from './constants/themes';

import 'react-toastify/dist/ReactToastify.css';
import TermsAndConditions from './components/termsAndConditions';
import ResendVerification from './components/account/resendVerification';

function App() {
  const { theme } = useContext(SitesContext);

  return (
    <ThemeProvider theme={theme === 'light' ? muiLightTheme : muiDarkTheme}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Router>
        <Header />
        <Footer />
        <Route path="/" exact>
          <Landing />
        </Route>
        <Route path="/home">
          <Home />
        </Route>
        <Route path="/site/:id">
          <SingleSite />
        </Route>
        <Route path="/account" exact>
          <Account />
        </Route>
        <Route path="/account/register">
          <Register />
        </Route>
        <Route path="/account/login">
          <Login />
        </Route>
        <Route path="/account/reset-password/:token/:userId">
          <ResetPassword />
        </Route>
        <Route path="/account/forgot-password">
          <ForgotPassword />
        </Route>
        <Route path="/account/please-verify">
          <PleaseVerify />
        </Route>
        <Route path="/account/verify-email/:hash/:userId">
          <VerifyEmail />
        </Route>
        <Route path="/account/resend-verification">
          <ResendVerification />
        </Route>
        <Route path="/payment/success">
          <PaymentSuccess />
        </Route>
        <Route path="/payment/canceled">
          <PaymentCanceled />
        </Route>
        <Route path="/pricing">
          <Pricing />
        </Route>
        <Route path="/privacy-policy">
          <PrivacyPolicy />
        </Route>
        <Route path="/terms-and-conditions">
          <TermsAndConditions />
        </Route>
        <Route path="/feedback">
          <Feedback />
        </Route>
      </Router>
    </ThemeProvider>
  );
}

library.add(fab, far, fas);

export default App;
