import React from 'react'
import {Button, Form, Grid, Header, Image, Message, Segment, Icon, Modal, Text} from 'semantic-ui-react'


class Login extends React.Component {
    render() {
        return (
            <Grid textAlign='center' style={{height: '100vh'}} verticalAlign='middle'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h2' color='#73031D' textAlign='center'>
                        <Image src='../../icons/icon_1.png'/> Log-in to your account
                    </Header>
                    <Form size='large'>
                        <Segment stacked>
                            <Form.Input fluid icon='user' iconPosition='left' placeholder='E-mail address'/>
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                placeholder='Password'
                                type='password'
                            />

                            <Button color='teal' fluid size='large'>
                                Login
                            </Button>

                        </Segment>
                    </Form>
                    <Message>
                        <div className="ui red horizontal label">New to us?</div>
                        <Modal trigger={<a href='#'>Sign Up</a>} closeIcon>
                            <Header icon='signup' content='Sign up for Corona Count'/>
                            <Modal.Content>
                                <Form size='large'>
                                    <Segment stacked>
                                        <Form.Input fluid icon='user' iconPosition='left' placeholder='name'/>
                                        <Form.Input fluid icon='address card outline' iconPosition='left' placeholder='E-mail address'/>

                                        <Form.Input
                                            fluid
                                            icon='lock'
                                            iconPosition='left'
                                            placeholder='Password'
                                            type='password'
                                        />

                                        {/*<Button color='teal' fluid size='large'>*/}
                                        {/*    Login*/}
                                        {/*</Button>*/}

                                    </Segment>
                                </Form>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button color='red'>
                                    <Icon name='remove'/> No
                                </Button>
                                <Button color='green'>
                                    <Icon name='checkmark'/> Yes
                                </Button>
                            </Modal.Actions>
                        </Modal>
                    </Message>
                </Grid.Column>
            </Grid>
        )
    }
}


export default Login