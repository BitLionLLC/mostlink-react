import "./App.css";
import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/home";
import { SitesContext } from "./contexts/sitesContext";
import SingleSite from "./components/singleSite";
import Account from "./components/account/account";
import Login from "./components/account/login";
import Register from "./components/account/register";
import ResetPassword from "./components/account/resetPassword";
import ForgotPassword from "./components/account/forgotPassword";
import Header from "./components/header";
import SingleSiteHeader from "./components/singleSiteHeader";
import Footer from "./components/footer";
import Landing from "./components/landing/landing";
import Pricing from "./components/pricing";
import PrivacyPolicy from "./components/privacyPolicy";
import Feedback from "./components/feedback";
import PaymentSuccess from "./components/payment/paymentSuccess";
import PaymentCanceled from "./components/payment/paymentCanceled";
import PleaseVerify from "./components/account/pleaseVerify";
import VerifyEmail from "./components/account/verifyEmail";
import { ToastContainer } from "react-toastify";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { ThemeProvider } from "@mui/material/styles";
import { muiDarkTheme, muiLightTheme } from "./constants/themes";

import "react-toastify/dist/ReactToastify.css";
import TermsAndConditions from "./components/termsAndConditions";
import ResendVerification from "./components/account/resendVerification";

function App() {
  const { theme } = useContext(SitesContext);

  return (
    <ThemeProvider theme={theme === "light" ? muiLightTheme : muiDarkTheme}>
      <ToastContainer position="top-right" autoClose={5000} />
      <Router>
        <Routes>
          <Route
            path="/"
            exact
            element={
              <>
                <Header />
                <Footer />
                <Landing />
              </>
            }
          />
          <Route
            path="/home"
            element={
              <>
                <Header />
                <Footer />
                <Home />
              </>
            }
          />
          <Route
            path="/site/:id"
            element={
              <>
                <SingleSiteHeader />
                <SingleSite />
              </>
            }
          />
          <Route
            path="/account"
            exact
            element={
              <>
                <Header />
                <Footer />
                <Account />
              </>
            }
          />
          <Route
            path="/account/register"
            element={
              <>
                <Header />
                <Footer />
                <Register />
              </>
            }
          />
          <Route
            path="/account/login"
            element={
              <>
                <Header />
                <Footer />
                <Login />
              </>
            }
          />
          <Route
            path="/account/reset-password/:token/:userId"
            element={
              <>
                <Header />
                <Footer />
                <ResetPassword />
              </>
            }
          />
          <Route
            path="/account/forgot-password"
            element={
              <>
                <Header />
                <Footer />
                <ForgotPassword />
              </>
            }
          />
          <Route
            path="/account/please-verify"
            element={
              <>
                <Header />
                <Footer />
                <PleaseVerify />
              </>
            }
          />
          <Route
            path="/account/verify-email/:hash/:userId"
            element={
              <>
                <Header />
                <Footer />
                <VerifyEmail />
              </>
            }
          />
          <Route
            path="/account/resend-verification"
            element={
              <>
                <Header />
                <Footer />
                <ResendVerification />
              </>
            }
          />
          <Route
            path="/payment/success"
            element={
              <>
                <Header />
                <Footer />
                <PaymentSuccess />
              </>
            }
          />
          <Route
            path="/payment/canceled"
            element={
              <>
                <Header />
                <Footer />
                <PaymentCanceled />
              </>
            }
          />
          <Route
            path="/pricing"
            element={
              <>
                <Header />
                <Footer />
                <Pricing />
              </>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <>
                <Header />
                <Footer />
                <PrivacyPolicy />
              </>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={
              <>
                <Header />
                <Footer />
                <TermsAndConditions />
              </>
            }
          />
          <Route
            path="/feedback"
            element={
              <>
                <Header />
                <Footer />
                <Feedback />
              </>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

library.add(fab, far, fas);

export default App;
