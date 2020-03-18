import React from 'react'
// eslint-disable-next-line
import {List, Segment, Dropdown, Menu, Container, Image, Divider, Grid, Header, Form, Button} from 'semantic-ui-react'
import {useAuth0} from "../react-auth0-spa";
import LogoutButton from "./LogoutButton";
import axios from 'axios';
import UserProfile from '../Hooks/RetrieveProfileGoHome'
import config from '../url_config.json';


class Home extends React.Component {
    state = {
        bunkers: [],
        user: null
    }

    constructor(props) {
        super(props);
        let user = this.props.user;
        console.log(user)
        this.getUserData(user).then(r => console.log(r))
    }

    async getUserData(user) {
        // Get user data from backend
        let id = user.sub.slice(6)

        let url = config.users_url + "/" + id
        console.log(url);
        try {
            const response =
                await axios.get(url)

            let loadedBunkers = response.bunkers
            this.setState({bunkers: loadedBunkers})
        } catch (e) {
            // If no data --> postNewUser --> bunker is empty
            this.postNewUser(user);
        }

        this.setState({user: user.name})
    }

    async postNewUser(user) {
        let url = config.users_url
        console.log('here', url)
        const response = await axios.post(
            url,
            {name: user.name, bunkers: []},
            {headers: {'Content-Type': 'application/json'}}
        )
        console.log(response.data)
    }

    componentWillReceiveProps(newProps) {
        this.setState({bunkers: newProps.bunkers});
        this.setState({user: UserProfile()})
    }


    renderEmptyBunkerListItem = () => {
        return (
            <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>You're in no bunkers!</List.Header>
                    <List.Description as='a'>Get to safety</List.Description>
                </List.Content>
            </List.Item>
        );
    }
    renderBunkerListItem = (bunker) => {
        return (
            <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>{bunker.name}</List.Header>
                    <List.Description as='a'>Updated 22 mins ago</List.Description>
                </List.Content>
            </List.Item>
        );
    }

    genBunkerList = () => {
        let data = []
        if (this.state.bunkers.length == 0) {
            data.push(this.renderEmptyBunkerListItem())
        } else {
            this.state.bunkers.forEach(bunker => data.push(this.renderBunkerListItem(bunker)))
        }
        return data
    };

    bunkerDataForDisplay = this.genBunkerList()

    render() {

        return (
            <div>
                <Container>
                    <Menu fixed='top' color={'teal'} inverted>
                        <Container>
                            <Menu.Item as='a' header>
                                <Image size='mini' src='/logo.png' style={{marginRight: '1.5em'}}/>
                            </Menu.Item>
                            <Menu.Item header>
                                It's shot o'clock, bitch!
                            </Menu.Item>
                            <Menu.Item as='a' position={"right"}>
                                <LogoutButton/>
                            </Menu.Item>

                            {/*<Dropdown item simple text='Dropdown'>*/}
                            {/*    <Dropdown.Menu>*/}
                            {/*        <Dropdown.Item>List Item</Dropdown.Item>*/}
                            {/*        <Dropdown.Item>List Item</Dropdown.Item>*/}
                            {/*        <Dropdown.Divider/>*/}
                            {/*        <Dropdown.Header>Header Item</Dropdown.Header>*/}
                            {/*        <Dropdown.Item>*/}
                            {/*            <i className='dropdown icon'/>*/}
                            {/*            <span className='text'>Submenu</span>*/}
                            {/*            <Dropdown.Menu>*/}
                            {/*                <Dropdown.Item>List Item</Dropdown.Item>*/}
                            {/*                <Dropdown.Item>List Item</Dropdown.Item>*/}
                            {/*            </Dropdown.Menu>*/}
                            {/*        </Dropdown.Item>*/}
                            {/*        <Dropdown.Item>List Item</Dropdown.Item>*/}
                            {/*    </Dropdown.Menu>*/}
                            {/*</Dropdown>*/}
                        </Container>
                    </Menu>
                </Container>
                <Container text style={{marginTop: '45px'}}>
                    <Segment inverted>
                        <List divided inverted relaxed items={this.bunkerDataForDisplay}>
                        </List>
                    </Segment>
                </Container>
            </div>
        )
    }
}

export default Home