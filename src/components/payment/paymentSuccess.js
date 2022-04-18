import React from 'react';
import axios from 'axios';

const PaymentSuccess = () => {
    const createPortalSession = () => {
        axios
            .get('/payment/create-portal-session')
            .then((res) => {
                window.location.href = res.data.redirect;
            })
            .catch(err => console.log(err))
    }

    return (
        <div>
            Payment succeeded!
            <button onClick={createPortalSession}>Log into Stripe portal</button>
        </div>
    )
}

export default PaymentSuccess;