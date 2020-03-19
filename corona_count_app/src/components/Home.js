import React from 'react'
// eslint-disable-next-line
import {List, Segment, Dropdown, Menu, Container, Image, Divider, Grid, Header, Form, Button} from 'semantic-ui-react'
import {useAuth0} from "../react-auth0-spa";
import LogoutButton from "./LogoutButton";
import axios from 'axios';
import UserProfile from '../Hooks/RetrieveProfileGoHome'
import config from '../url_config.json';
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";

class Home extends React.Component {
    state = {
        bunkers: [],
        user_name: null,
        user_id: null,
        add_bunker_tab: "join",
        join_bunker_error: false,
        create_bunker_form_text: "",
        join_bunker_form_text: ""
    }

    constructor(props) {
        super(props);
        let user = this.props.user;
        console.log(user)
        this.getUserData(user).then(r => console.log("User data retrieved"))
    }

    handleItemClick = (e, {name}) => this.setState({add_bunker_tab: name})

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
            console.log(e.response)
            this.postNewUser(user);
        }

        this.setState({user_name: user.name})
        this.setState({user_id: id.toString()})
    }

    async postNewUser(user) {
        let url = config.users_url
        let id = user.sub.slice(6)
        console.log('Post new user url: ', url)
        const response = await axios.post(
            url,
            {name: user.nickname.toString(), bunkers: [], user_id: id.toString()},
            {headers: {'Content-Type': 'application/json'}}
        ).catch(e => console.log(e.response.data))
        console.log(response.data)
    }

    async createNewBunker(name) {
        //TODO: Duplicate bunker names shouldn't exit
        let url = config.bunkers_url
        console.log("here", name)
        console.log('Post new bunker url: ', url)
        const response = await axios.post(
            url,
            {name: name.toString(), users: [this.state.user_id], measures: []},
            {headers: {'Content-Type': 'application/json'}}
        )
    }

    async joinBunker(access_code) {
        let url = config.bunkers_url + "/" + access_code
        console.log('Get join bunker url: ', url)

        try {
            const response =
                await axios.get(url)
            console.log("Bunker data: ", response.data)
        } catch (e) {
            console.log(e => console.log("Bunker doesn't exist"))
            this.setState({join_bunker_error: true})
        }

    }

    __onCreateBunkerFormChange = (value) => {
        this.setState({create_bunker_form_text: value})
    }

    __onJoinBunkerFormChange = (value) => {
        this.setState({join_bunker_form_text: value})
    }

    __onAddBunkerClick = () => {
        if (this.state.add_bunker_tab === "join") {
            this.joinBunker(this.state.join_bunker_form_text)
        } else {
            this.createNewBunker(this.state.create_bunker_form_text)
        }
    }

    addBunkerCard = () => {
        if (this.state.add_bunker_tab === "join") {
            return (
                <Form.Input fluid icon='hand rock' iconPosition='left'
                            placeholder='Bunker access code'
                            onChange={(e, {value}) => this.__onJoinBunkerFormChange(value)}/>
            )
        } else {
            return (
                <Form.Input fluid icon='hand rock' iconPosition='left'
                            placeholder='New bunker name'
                            onChange={(e, {value}) => this.__onCreateBunkerFormChange(value)}/>
            )
        }
    }

    addBunkerModalHeader = () => {
        if (!this.state.join_bunker_error) {
            return (
                <Header>Time is of the essence... get to safety!</Header>
            )
        } else {
            return (
                <Header color={"red"}>Bunker access code error! Double check your access code.</Header>
            )
        }
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
        const {add_bunker_tab} = this.state.add_bunker_tab
        return (
            <div>
                <Container>
                    <Menu fixed='top' color={'teal'} widths={3} inverted>
                        <Container>
                            <Menu.Item as='a' header>
                                <Modal trigger={<Segment.Inline> <Icon name='add'/> Add Bunker </Segment.Inline>}>
                                    <Modal.Header>Add a new bunker, my guy</Modal.Header>
                                    <Modal.Content>
                                        <Segment stacked>
                                            <Modal.Description>
                                                {this.addBunkerModalHeader()}
                                                <p>
                                                    Create a bunker and invite your friends to stay safe and start
                                                    slandering!
                                                </p>
                                            </Modal.Description>
                                            <Divider/>
                                            <Menu tabular>
                                                <Menu.Item
                                                    name='join'
                                                    active={this.state.add_bunker_tab === "join"}
                                                    onClick={this.handleItemClick}
                                                />
                                                <Menu.Item
                                                    name='create'
                                                    active={this.state.add_bunker_tab === "create"}
                                                    onClick={this.handleItemClick}
                                                />
                                            </Menu>
                                            {this.addBunkerCard()}
                                            <Divider/>
                                            <Button color='teal' fluid size='large' onClick={this.__onAddBunkerClick}>
                                                Esketit
                                            </Button>
                                        </Segment>
                                    </Modal.Content>
                                </Modal>

                            </Menu.Item>
                            <Menu.Item header>
                                It's shot o'clock, bitch!
                            </Menu.Item>
                            <Menu.Item as='a' position={"right"}>
                                <LogoutButton/>
                            </Menu.Item>
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