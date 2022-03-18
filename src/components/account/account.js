import React, { useEffect } from 'react';

const Account = () => {
    useEffect(() => {
        document.body.style.backgroundImage = null;
    }, [])
    
    return (
        <div>
            Account
        </div>
    )
}

export default Account;