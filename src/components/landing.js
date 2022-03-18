import React, { useEffect } from 'react';

const Landing = () => {
    useEffect(() => {
        document.body.style.backgroundImage = null;
    }, [])

    return (
        <div>
            Landing
        </div>
    )
}

export default Landing;