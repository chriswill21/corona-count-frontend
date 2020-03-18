import {useAuth0} from "../react-auth0-spa";
import React from "react";
import Home from "../components/Home";

const RetrieveProfileGoHome = () => {
    const {loading, user} = useAuth0();

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <Home user={user}/>
    )
};

export default RetrieveProfileGoHome