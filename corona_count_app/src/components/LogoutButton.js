import {useAuth0} from "../react-auth0-spa";
import {Typography} from "@material-ui/core";
import React from "react";

const LogoutButton = () => {
    const {isAuthenticated, logout} = useAuth0();
    return (
        <div>
            {isAuthenticated && <Typography onClick={() => logout()}
                                            variant={'button'}
                                            color={'textPrimary'}
            >Log out</Typography>}
        </div>
    );
};

export default LogoutButton