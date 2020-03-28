import {useAuth0} from "../react-auth0-spa";
import {Button} from "@material-ui/core";
import React from "react";

const LogoutButton = () => {
    const {isAuthenticated, logout} = useAuth0();
    return (
        <div>
            {isAuthenticated && <Button onClick={() => logout()}>Log out</Button>}
        </div>
    );
};

export default LogoutButton