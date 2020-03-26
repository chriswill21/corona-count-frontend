import React from 'react'
import {Button, Form, Grid, Header, Image, Message, Segment, Icon, Modal, Text} from 'semantic-ui-react'
import {useAuth0} from "../react-auth0-spa";
import Typography from "@material-ui/core/Typography";
import BlurOnIcon from '@material-ui/icons/BlurOn';

const StartPage = () => {
    const {isAuthenticated, loginWithRedirect, logout} = useAuth0();

    if (isAuthenticated) {
        loginWithRedirect();
    }
    return (
        <div>
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='#73031D' textAlign='center'>
                        <BlurOnIcon fontSize="large"/> <Typography variant={"h2"} style={{color: "#73031D"}}> Welcome to Corona Count! </Typography>
                    </Header>
                    <Form size='large'>
                        <Segment >
                            {!isAuthenticated && (
                                <Button color='#73031D' fluid size='large' onClick={() => loginWithRedirect({})}>Get
                                    Started!</Button>
                            )}

                            {isAuthenticated && (
                                <Button color='#73031D' fluid size='large' onClick={() => logout()}>Log out</Button>
                            )}
                        </Segment>
                    </Form>
                </Grid.Column>
            </Grid>
        </div>
    );
};


export default StartPage