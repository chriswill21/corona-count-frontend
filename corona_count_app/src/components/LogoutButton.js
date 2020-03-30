import {useAuth0} from "../react-auth0-spa";
import {Typography} from "@material-ui/core";
import {Dropdown} from "semantic-ui-react";
import React from "react";

const LogoutButton = () => {
    const {isAuthenticated, logout} = useAuth0();
    return (
        <Dropdown.Item onClick={() => logout()}>
            {isAuthenticated &&
            <Typography
                variant={'button'}
                color={'textPrimary'}
            >Log out</Typography>}
        </Dropdown.Item>
    );
};

export default LogoutButton