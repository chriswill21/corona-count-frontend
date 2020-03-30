import {useAuth0} from "../react-auth0-spa";
import React from "react";
import Home from "../components/Home";
import config from "../url_config";
import axios from "axios";

const RetrieveProfileGoHome = () => {
    const {loading, user} = useAuth0();
    const theme = {
        palette: {
            primary: {
                main: "#333366"
            },
            secondary: {
                main: "#ff9d76"

            },
            warning: {
                main: "#eb4d55"
            },
            type: 'dark'
        }
    };

    if (loading || !user) {
        return <div>Loading...</div>;
    }

    const id = user.sub.slice(6);
    let url = config.users_url + "/" + id;
    url = encodeURI(url);
    try {
        axios.get(url).then(response => {
            user.name = response.data.user.name;
        });
    } finally {
    }

    return (
        <Home user={user} theme={theme}/>
    )

};

export default RetrieveProfileGoHome