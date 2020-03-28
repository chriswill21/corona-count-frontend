import {useAuth0} from "../react-auth0-spa";
import React from "react";
import Home from "../components/Home";
import {createMuiTheme} from "@material-ui/core";

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

    return (
        <Home user={user} theme={theme}/>
    )
};

export default RetrieveProfileGoHome