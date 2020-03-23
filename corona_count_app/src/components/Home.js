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
import {Redirect} from "react-router-dom";

class Home extends React.Component {
    state = {
        bunkers: [],
        user_obj: null,
        user_name: null,
        user_id: null,
        add_bunker_tab: "join",
        join_bunker_error: false,
        create_bunker_form_text: "",
        join_bunker_form_text: "",
        redirect_bunker_id: ""
    }

    constructor(props) {
        super(props);
        let user = this.props.user;
        console.log("user", user)
        this.getUserData(user).then(r => console.log("User data retrieved"))
    }

    setRedirect = (bunker) => {
        console.log("clicked on a bunker", bunker)
        this.setState({
            redirect_bunker_id: bunker._id
        })
    }

    handleItemClick = (e, {name}) => this.setState({add_bunker_tab: name})

    async getUserData(user) {
        // Get user data from backend
        let id = user.sub.slice(6)

        let url = config.users_url + "/" + id
        url = encodeURI(url)
        console.log("Get user data url", url);
        try {
            const response =
                await axios.get(url)

            let loadedBunkers = response.data.bunkers
            this.setState({bunkers: loadedBunkers})
        } catch (e) {
            // If no data --> postNewUser --> bunker is empty
            console.log(e.response)
            this.postNewUser(user);
        }

        this.setState({user_name: user.name})
        this.setState({user_id: id.toString()})
        this.setState({user_obj: user})
    }

    async postNewUser(user) {
        let url = config.users_url
        url = encodeURI(url)
        let id = user.sub.slice(6)
        console.log('Post new user url: ', url)
        const response = await axios.post(
            url,
            {name: user.nickname.toString(), bunkers: [], user_id: id.toString()},
            {headers: {'Content-Type': 'application/json'}}
        ).catch(e => console.log(e.response.data))
        console.log("Post new user response data", response.data)
    }

    async createNewBunker(name) {
        //TODO: Duplicate bunker names shouldn't exit
        //TODO: WE SHOULD RETURN THE BUNKER OBJECT WHEN WE CREATE A NEW ONE
        let url = config.bunkers_url
        url = encodeURI(url)
        console.log('Post new bunker url: ', url)
        const response = await axios.post(
            url,
            {name: name.toString(), users: [this.state.user_id], measures: []},
            {headers: {'Content-Type': 'application/json'}}
        ).then(r => this.setRedirect(r.data.bunker))
    }

    async joinBunker(access_code) {
        // Note access code = unique bunker id
        //TODO: WE SHOULD RETURN THE BUNKER OBJECT
        let url = config.bunkers_url + "/user/" + access_code + "/" + this.state.user_id
        url = encodeURI(url)
        console.log('Join bunker url: ', url)

        try {
            const response =
                await axios.post(url).then(r => this.setRedirect(r.data.bunker))
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
            this.joinBunker(this.state.join_bunker_form_text).then(r => console.log("Attempt join new bunker", r))
        } else {
            this.createNewBunker(this.state.create_bunker_form_text).then(r => console.log("Attempt created new bunker", r))
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
                <Header color={"red"}>Bunker join error! Either your access code is incorrect, or you've already been
                    added to this bunker.</Header>
            )
        }
    }

    renderBlankBunkerListItem = () => {
        return (
            <List.Item>
                <List.Icon name='certificate' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'> </List.Header>
                    <List.Description as='a'> </List.Description>
                </List.Content>
            </List.Item>
        );
    }

    renderEmptyBunkerListItem = () => {
        return (
            <List.Item>
                <List.Icon name='certificate' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>You're in no bunkers!</List.Header>
                    <List.Description as='a'>Get to safety</List.Description>
                </List.Content>
            </List.Item>
        );
    }
    renderBunkerListItem = (bunker) => {
        return (
            <List.Item onClick={() => {
                this.setRedirect(bunker)
            }}>
                <List.Icon name='certificate' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>{bunker.name}</List.Header>
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


    render() {

        let bunkerDataForDisplay = this.genBunkerList()
        const {add_bunker_tab} = this.state.add_bunker_tab

        if (this.state.redirect_bunker_id !== "") {
            let bunker_id = this.state.redirect_bunker_id
            let user_obj = this.state.user_obj
            return (
                < Redirect to={{pathname: "/bunker", state: {user: user_obj, bunker_id: bunker_id}}}/>
            )

        } else {
            return (

                <div class="full-height" style={{
                    backgroundColor: '#900C3F ',
                    backgroundSize: "cover",
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    position: 'absolute'
                }}>
                    <Grid divided='vertically'>
                        <Grid.Row columns={1}>
                            <Container>
                                <Menu fixed='top' color={'#581845'} widths={3} inverted>
                                    <Container>
                                        <Menu.Item as='a'>
                                            <Dropdown item icon='align justify' simple>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item>
                                                        <LogoutButton/>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Menu.Item>
                                        <Menu.Item header>
                                            It's shot o'clock, bitch!
                                        </Menu.Item>
                                        <Menu.Item as='a' header position={"right"}>
                                            <Modal trigger={<Segment.Inline> <Icon name='add'/> Add Bunker
                                            </Segment.Inline>}>
                                                <Modal.Header>Add a new bunker, my guy</Modal.Header>
                                                <Modal.Content>
                                                    <Segment vertical>
                                                        <Modal.Description>
                                                            {this.addBunkerModalHeader()}
                                                            <p>
                                                                Create a bunker and invite your friends to stay safe and
                                                                start
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
                                                        <Button color='#581845' fluid size='large'
                                                                onClick={this.__onAddBunkerClick}>
                                                            Esketit
                                                        </Button>
                                                    </Segment>
                                                </Modal.Content>
                                            </Modal>

                                        </Menu.Item>
                                    </Container>
                                </Menu>
                            </Container>
                        </Grid.Row>

                        <Grid.Row columns={1}>
                            <Container text style={{marginTop: '38px'}}>
                                <Segment vertical>
                                    <List divided inverted relaxed items={bunkerDataForDisplay}>
                                    </List>
                                </Segment>
                            </Container>
                        </Grid.Row>
                    </Grid>


                </div>
            )
        }
    }
}

export default Home