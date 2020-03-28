import React from 'react'
// eslint-disable-next-line
import {Button, Container, Divider, Dropdown, Form, Grid, Header, List, Menu, Segment} from 'semantic-ui-react'
import LogoutButton from "./LogoutButton";
import axios from 'axios';
import config from '../url_config.json';
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";
import {Redirect} from "react-router-dom";
import {
    AppBar,
    Box,
    Tabs,
    Tab,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography, TextField
} from '@material-ui/core';

class Home extends React.Component {
    state = {
        bunkers: [],
        user_obj: null,
        user_name: null,
        user_id: null,
        add_bunker_tab: 0,
        join_bunker_error: false,
        create_bunker_form_text: "",
        join_bunker_form_text: "",
        redirect_bunker_id: "",
        users_for_target_bunker: [],
        bunker_to_leave: null,
        adding_bunker: false
    };

    constructor(props) {
        super(props);
        let user = this.props.user;
        console.log("user", user);
        this.getUserData(user).then(r => console.log("User data retrieved"))
    }

    async setRedirect(bunker) {
        console.log("clicked on a bunker", bunker);
        // this.setState({
        //     redirect_bunker_id: bunker._id
        // })
        let url = config.bunkers_url + "/users/" + bunker._id
        url = encodeURI(url)
        console.log('Get users from bunker url: ', url)
        try {
            const response =
                await axios.get(url).then(r => {
                    console.log("Retrieved users from bunker: ", r.data.users)
                    this.setState({
                        users_for_target_bunker: r.data.users,
                        redirect_bunker_id: bunker._id
                    })
                })
        } catch (e) {
            console.log("Failed getting users from bunker", e)
            return null
        }
    }

    handleItemClick = (e, {name}) => this.setState({
        add_bunker_tab: name,
        create_bunker_form_text: "",
        join_bunker_form_text: ""
    });

    handleLeaveBunkerClickOpen = (bunker) => {
        this.setState({bunker_to_leave: bunker})
    };

    handleLeaveBunkerClickClose = () => {
        this.setState({bunker_to_leave: null})
    };

    TabPanel = (props) => {
        const {children, value, index, ...other} = props;

        return (
            <Typography
                component="div"
                role="tabpanel"
                hidden={value !== index}
                id={`add-bunker-tabpanel-${index}`}
                aria-labelledby={`add-bunker-tab-${index}`}
                {...other}
            >
                {value === index && <Box p={3}>{children}</Box>}
            </Typography>
        );
    };


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
            console.log(e);
            this.postNewUser(user);
        }

        this.setState({user_name: user.name});
        this.setState({user_id: id.toString()});
        this.setState({user_obj: user})
    }

    async postNewUser(user) {
        let url = config.users_url;
        url = encodeURI(url);
        let id = user.sub.slice(6);
        console.log('Post new user url: ', url);
        const response = await axios.post(
            url,
            {name: user.nickname.toString(), bunkers: [], user_id: id.toString()},
            {headers: {'Content-Type': 'application/json'}}
        ).catch(e => console.log(e.response.data));
        console.log("Post new user response data", response.data)
    }

    async createNewBunker(name) {
        //TODO: Duplicate bunker names shouldn't exit
        let url = config.bunkers_url
        url = encodeURI(url)
        console.log('Post new bunker url: ', url)
        const response = await axios.post(
            url,
            {name: name.toString(), users: [this.state.user_id], measures: []},
            {headers: {'Content-Type': 'application/json'}}
        ).catch(e => console.log(e.response)).then(r => this.setRedirect(r.data.bunker))
    }

    async joinBunker(access_code) {
        // Note access code = unique bunker id
        let url = config.bunkers_url + "/user/" + access_code + "/" + this.state.user_id;
        url = encodeURI(url);
        console.log('Join bunker url: ', url);

        try {
            const response =
                await axios.post(url).then(r => this.setRedirect(r.data.bunker));
            console.log("Bunker data: ", response.data)
        } catch (e) {
            console.log("Bunker doesn't exist", e.response);
            this.setState({join_bunker_error: true})
        }

    }

    async leaveBunker(bunker_id) {
        let url = config.bunkers_url + "/user/" + bunker_id + "/" + this.state.user_id;
        url = encodeURI(url);
        console.log('Remove user from bunker: ', url);

        try {
            const response =
                await axios.delete(url);
            console.log("Successfully left Bunker: ", response.success);
            this.setState({bunker_to_leave: null})
            this.getUserData(this.props.user).then(r => console.log("User data retrieved"))
        } catch (e) {
            console.log("Error leaving bunker: ", e.response)
        }
    }

    __onCreateBunkerFormChange = (value) => {
        this.setState({create_bunker_form_text: value})
    };

    __onJoinBunkerFormChange = (value) => {
        this.setState({join_bunker_form_text: value})
    };

    __onAddBunkerClick = () => {
        if (this.state.add_bunker_tab === 0) {
            if (this.state.join_bunker_form_text) {
                this.joinBunker(this.state.join_bunker_form_text).then(r => console.log("Attempt join new bunker", r))
            }

        } else {
            if (this.state.create_bunker_form_text) {
                this.createNewBunker(this.state.create_bunker_form_text).then(r => console.log("Attempt created new bunker", r))
            }
        }
    };

    addBunkerCard = () => {
        if (this.state.add_bunker_tab === 0) {
            return (
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Bunker access code"
                    type="text"
                    fullWidth
                    onChange={(event) => this.__onJoinBunkerFormChange(event.target.value)}
                />
            )
        } else {
            return (
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="New bunker name"
                    type="text"
                    fullWidth
                    onChange={(event) => this.__onCreateBunkerFormChange(event.target.value)}
                />
            )
        }
    };

    addBunkerModalHeader = () => {
        if (!this.state.join_bunker_error) {
            return (
                <Typography><b>Time is of the essence... get to safety!</b></Typography>
            )
        } else {
            return (
                <Typography color={"secondary"}><b>Bunker join error! Either your access code is incorrect, or you've already been
                    added to this bunker.</b></Typography>
            )
        }
    };

    renderEmptyBunkerListItem = () => {
        return (
            <List.Item>
                <List.Icon name='certificate' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header>You're in no bunkers!</List.Header>
                    <List.Description>Get to safety</List.Description>
                </List.Content>
            </List.Item>
        );
    };

    renderBunkerListItem = (bunker) => {
        return (
            <List.Item>
                <List.Icon name='certificate' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a' onClick={() => {
                        this.setRedirect(bunker)
                    }}>{bunker.name}</List.Header>
                    <List.Description as='a' onClick={() => {
                        this.handleLeaveBunkerClickOpen(bunker._id)
                    }}>Leave
                        Bunker</List.Description>
                </List.Content>
            </List.Item>
        );
    };

    genBunkerList = () => {
        let data = [];
        if (this.state.bunkers.length === 0) {
            data.push(this.renderEmptyBunkerListItem())
        } else {
            this.state.bunkers.forEach(bunker => data.push(this.renderBunkerListItem(bunker)))
        }

        return data
    };

    render() {

        let bunkerDataForDisplay = this.genBunkerList();

        if (this.state.redirect_bunker_id !== "") {
            let bunker_id = this.state.redirect_bunker_id;
            let user_obj = this.state.user_obj;
            let users_for_bunker = this.state.users_for_target_bunker;
            return (
                < Redirect to={{
                    pathname: "/bunker",
                    state: {user: user_obj, bunker_id: bunker_id, users_for_bunker: users_for_bunker}
                }}/>
            )

        } else {
            return (

                <div className="full-height" style={{
                    backgroundColor: '#eb4d55 ',
                    backgroundSize: "cover",
                    position: 'absolute',
                    minHeight: '100%',
                    minWidth: '100%'
                }}>
                    <Grid divided='vertically'>
                        <Grid.Row columns={1}>
                            <Container>
                                <Menu fixed='top' inverted borderless>
                                    <Container>
                                        <Menu.Item position={"left"}>
                                            <Dropdown item icon='align justify' simple>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item>
                                                        <LogoutButton/>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Menu.Item>
                                        <Menu.Item header>
                                            <Typography variant={'h3'}>
                                                Corona Count
                                            </Typography>
                                        </Menu.Item>
                                        <Menu.Item as='a' position={"right"}
                                                   onClick={() => this.setState({adding_bunker: true})}>
                                            <Segment.Inline> <Icon name='add'/> Add Bunker...
                                            </Segment.Inline>
                                        </Menu.Item>
                                        <Dialog open={this.state.adding_bunker}
                                                onClose={() => this.setState({adding_bunker: false})}
                                                aria-labelledby='add-bunker-title'
                                                aria-describedby='add-bunker-description'
                                                fullWidth
                                        >
                                            <DialogTitle id='add-bunker-title'>Add a new bunker</DialogTitle>
                                            <DialogContent>
                                                <DialogContentText id='add-bunker-description'>
                                                    {this.addBunkerModalHeader()}
                                                    Create a bunker and invite your friends to stay safe and start
                                                    slandering!
                                                </DialogContentText>
                                            </DialogContent>
                                            <AppBar position='static'>
                                                <Tabs value={this.state.add_bunker_tab}
                                                      onChange={(event, newValue) => {
                                                          this.setState({
                                                              add_bunker_tab: newValue,
                                                              create_bunker_form_text: "",
                                                              join_bunker_form_text: ""
                                                          })
                                                      }}
                                                      aria-label="add-bunker-tabs"
                                                >
                                                    <Tab label={"Join"}
                                                         id={'add-bunker-0'}
                                                         aria-controls={'add-bunker-tabpanel-0'}/>
                                                    <Tab label={"Create"}
                                                         id={'add-bunker-1'}
                                                         aria-controls={'add-bunker-tabpanel-1'}/>
                                                </Tabs>
                                            </AppBar>
                                            <this.TabPanel value={this.state.add_bunker_tab} index={0}>
                                                {this.addBunkerCard()}
                                            </this.TabPanel>
                                            <this.TabPanel value={this.state.add_bunker_tab} index={1}>
                                                {this.addBunkerCard()}
                                            </this.TabPanel>
                                            <DialogActions>
                                                <Button onClick={() => this.setState({adding_bunker: false})}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={this.__onAddBunkerClick}>
                                                    Add
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </Container>
                                </Menu>
                            </Container>
                        </Grid.Row>

                        <Grid.Row columns={1}>
                            <Container text style={{marginTop: '50px'}}>
                                <Segment vertical>
                                    <List divided inverted relaxed items={bunkerDataForDisplay}>
                                    </List>
                                </Segment>
                            </Container>
                        </Grid.Row>
                    </Grid>
                    <Dialog
                        open={this.state.bunker_to_leave != null}
                        onClose={this.handleLeaveBunkerClickClose}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle
                            id='alert-dialog-title'>{"Are you sure you want to leave this bunker?"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id='alert-dialog-description'>
                                If you leave this bunker, your rankings in all its measures will be lost, and you will
                                have to rejoin as a new member.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.handleLeaveBunkerClickClose}>
                                Cancel
                            </Button>
                            <Button onClick={() => this.leaveBunker(this.state.bunker_to_leave)} autoFocus>
                                Leave Bunker
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
        )
        }
        }
        }

        export default Home