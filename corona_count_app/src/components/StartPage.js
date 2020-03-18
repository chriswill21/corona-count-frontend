import React from 'react'
import {Button, Form, Grid, Header, Image, Message, Segment, Icon, Modal, Text} from 'semantic-ui-react'
import {useAuth0} from "../react-auth0-spa";

const StartPage = () => {
    const {isAuthenticated, loginWithRedirect, logout} = useAuth0();

    if (isAuthenticated) {
        loginWithRedirect();
    }
    return (
        <div>
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='teal' textAlign='center'>
                        <Image src='../../icons/icon_1.png'/> Welcome to Corona Count!
                    </Header>
                    <Form size='large'>
                        <Segment stacked>
                            {!isAuthenticated && (
                                <Button color='teal' fluid size='large' onClick={() => loginWithRedirect({})}>Get
                                    Started!</Button>
                                // <button onClick={() => loginWithRedirect({})}>Get Started!</button>
                            )}

                            {isAuthenticated && (
                                // <button onClick={() => logout()}>Log out</button>
                                <Button color='teal' fluid size='large' onClick={() => logout()}>Log out</Button>
                            )}
                        </Segment>
                    </Form>
                </Grid.Column>
            </Grid>
        </div>
    );
};


export default StartPage