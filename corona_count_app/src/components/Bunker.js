import React from 'react'
// eslint-disable-next-line
import {Container, Dropdown, Grid as SUI_Grid, List, Menu} from 'semantic-ui-react'
import LogoutButton from "./LogoutButton";
import axios from 'axios';
import config from '../url_config.json';
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import {Redirect} from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from "@material-ui/core/Typography";
import MUI_Grid from '@material-ui/core/Grid';
import Measure from './Measure';
import Paper from "@material-ui/core/Paper";
import {
    Button,
    createMuiTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles"

class Bunker extends React.Component {
    state = {
        measures: [],
        bunker: {},
        user_obj: null,
        create_measure_form_text: null,
        create_measure_default_score: 0,
        bunker_name: "",
        go_back: false,
        go_to_measure: false,
        select_measure_name: null,
        select_measure_id: null,
        select_measure_obj: null,
        users_for_bunker: null,
        past_users_for_bunker: null,
        adding_measure: false,
        inviting_others: false,
        theme: this.props.theme ? this.props.theme : this.props.location.state.theme
    };

    constructor(props) {
        super(props);
        // Set user upon return
        let bunker_id;
        try {
            bunker_id = this.props.location.state.bunker_id
        } catch (e) {   // Transition coming from a measure
            bunker_id = this.props.bunker_id
        }
        this.getBunker(bunker_id).then(r => this.__completeStateInitialization())
    }

    buildLeaderboard = (ratings, users) => {
        let sorted_ratings = ratings;
        sorted_ratings.sort((a, b) => (a.score > b.score) ? -1 : 1);
        let leaderboard = [];
        for (let i = 0; i < sorted_ratings.length; i++) {
            const users_object = users.filter(entry => entry.user_id === sorted_ratings[i].user)[0];
            if (users_object) {
                const name = users.filter(entry => entry.user_id === sorted_ratings[i].user)[0].name;
                const rank = i + 1;
                const score = sorted_ratings[i].score;
                leaderboard.push({rank, name, score})
            }
        }
        return leaderboard
    };

    // Page change prep functions
    setGoBack = () => {
        this.setState({go_back: true})
    };

    setGoToMeasure = (measure_obj) => {
        console.log("Go to measure:", measure_obj);
        this.setState({
            select_measure_name: measure_obj.name,
            select_measure_id: measure_obj._id,
            select_measure_obj: measure_obj,
            go_to_measure: true
        });
    };

    // Back end call functions

    async createNewMeasure(name, default_score) {
        let url = config.bunkers_url + "/measure/" + this.state.bunker._id + "/" + name + "/" + default_score;
        url = encodeURI(url);
        console.log('Post new measure url: ', url);
        try {
            await axios.post(
                url,
                {},
                {headers: {'Content-Type': 'application/json'}}
            ).then(e => this.setGoToMeasure(e.data.measure))
        } catch (e) {
            console.log(e.response)
        }
    }

    async getBunker(bunker_id) {
        let url = config.bunkers_url + "/" + bunker_id;
        url = encodeURI(url);
        console.log('Get bunker url: ', url);

        try {
            await axios.get(url).then(r => {
                this.setState({bunker: r.data.bunker});
                this.getMeasuresFromBunker(r.data.bunker._id);
                console.log("Retrieved bunker data: ", r.data.bunker)
            })
        } catch (e) {
            console.log("Bunker doesn't exist", e);
            return null
        }
    }

    async getMeasuresFromBunker(bunker_id) {
        let url = config.bunkers_url + "/measures/" + bunker_id;
        url = encodeURI(url);
        console.log('Get measures from bunker url: ', url);
        try {
            await axios.get(url).then(r => {
                    this.setState({measures: r.data.measures});
                    this.getUsersFromBunker(bunker_id)
                }
            );
            console.log("Retrieved bunker's measures")
        } catch (e) {
            console.log("Couldn't get bunker's measures", e);
            return null
        }

    }

    async getMeasure(measure_id) {
        let url = config.measures_url + "/" + measure_id;
        url = encodeURI(url);
        console.log('Get measure url: ', url);

        try {
            await axios.get(url).then(r => {
                console.log("Retrieved measure data: ", r.data.measure);
                this.setGoToMeasure(r.data.measure)
            })
        } catch (e) {
            console.log("Measure doesn't exist", e);
            return null
        }
    }

    async getUsersFromBunker(bunker_id) {
        let url = config.bunkers_url + "/users/" + bunker_id;
        url = encodeURI(url);
        console.log('Get users from bunker url: ', url);
        try {
            await axios.get(url).then(r => {
                console.log("Retrieved users from bunker: ", r.data.users);
                this.setState({
                    users_for_bunker: r.data.users,
                    past_users_for_bunker: r.data.past_users
                });
            })
        } catch (e) {
            console.log("Failed getting users from bunker", e);
            return null
        }
    }

    __completeStateInitialization() {
        // Set active user obj
        try {
            this.setState({user_obj: this.props.location.state.user})
        } catch (e) {   // Transitioning from a measure
            this.setState({user_obj: this.props.user_obj})
        }

        // Set bunker users
        try {
            this.setState({
                users_for_bunker: this.props.location.state.users_for_bunker,
                past_users_for_bunker: this.props.past_users_for_bunker
            })
        } catch (e) { // Transitioning from a measure
            this.setState({
                users_for_bunker: this.props.users_for_bunker,
                past_users_for_bunker: this.props.past_users_for_bunker
            })
        }
        this.setState({bunker_name: this.state.bunker.name});

        console.log("User object: ", this.state.user_obj)
    }

    // On click/change functions

    __onCreateMeasureNameFormChange = (value) => {
        this.setState({create_measure_form_text: value})
    };

    __onAddMeasureClick = () => {
        this.createNewMeasure(this.state.create_measure_form_text, this.state.create_measure_default_score).then(r => console.log("Measure created:", r))
    };

    // Render functions

    renderEmptyMeasureListItem = () => {
        return (
            <List.Item>
                <List.Icon name='bug' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>You're in no measures!</List.Header>
                    <List.Description as='a'>...boringgggg...</List.Description>
                </List.Content>
            </List.Item>
        );
    };

    renderMeasureListItem = (measure) => {
        let lb = this.buildLeaderboard(measure.ratings, this.state.users_for_bunker);
        return (
            <Paper color={"grey"}>
                <Card onClick={() => this.getMeasure(measure._id)} id={measure._id} raised>
                    <CardActionArea>
                        <CardContent>
                            <Typography variant="h5" component="h2">
                                {measure.name}
                            </Typography>
                            <Typography color="textSecondary" gutterBottom>
                                Rankings:
                            </Typography>
                            <Typography variant="body2" component="p">
                                1. {lb[0].name}
                                <br/>
                                2. {lb[1] ? lb[1].name : " "}
                                <br/>
                                3. {lb[2] ? lb[2].name : " "}

                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Paper>

        );
    };

    genMeasureList = () => {
        let data = [];
        if (this.state.measures.length === 0) {
            data.push(this.renderEmptyMeasureListItem())
        } else {
            this.state.measures.forEach(measure => data.push(this.renderMeasureListItem(measure)))
        }
        return data
    };


    render() {
        let measureDataForDisplay = this.genMeasureList();
        if (this.state.go_back) {
            return (
                < Redirect to={{pathname: "/home", state: {user: this.state.user_obj}}}/>
            )
        } else if (this.state.go_to_measure) {
            return (
                <Measure measure_name={this.state.select_measure_name}
                         measure_id={this.state.select_measure_id}
                         measure_obj={this.state.select_measure_obj}
                         user_obj={this.state.user_obj}
                         bunker_id={this.state.bunker._id}
                         users_for_bunker={this.state.users_for_bunker}
                         past_users_for_bunker={this.state.past_users_for_bunker}
                         buildLeaderboard={this.buildLeaderboard}
                         theme={this.state.theme}
                />
            )
        } else {
            return (
                <div className="full-height" style={{
                    backgroundColor: '#EB4D55',
                    backgroundSize: "cover",
                    position: 'absolute',
                    minHeight: '100%',
                    minWidth: '100%'
                }}>
                    <ThemeProvider
                        theme={createMuiTheme(this.state.theme)}>
                        <SUI_Grid divided='vertically'>
                            <SUI_Grid.Row columns={1}>
                                <Container>
                                    <Menu fixed='top' inverted borderless>
                                        <Container>
                                            <Menu.Item position={"left"}>
                                                <Dropdown item
                                                          icon=''
                                                          text={<span><Icon name={'arrow left'}/>&nbsp;&nbsp;{this.state.user_obj == null ? "" : this.state.user_obj.name}</span>}
                                                          simple>
                                                    <Dropdown.Menu style={{background: "#5c5c5c"}}>
                                                        <Dropdown.Item onClick={this.setGoBack}>
                                                            <Typography
                                                                variant={'button'}
                                                                color={'textPrimary'}
                                                            >
                                                                Back to home
                                                            </Typography>
                                                        </Dropdown.Item>
                                                        <LogoutButton/>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Menu.Item>
                                            <Menu.Item header>
                                                <Typography variant={'h4'}>
                                                    {this.state.bunker_name}
                                                </Typography>

                                            </Menu.Item>

                                            <Menu.Item position={"right"}>
                                                <Dropdown item icon='align justify' position={'right'} simple
                                                          direction={'left'}>
                                                    <Dropdown.Menu style={{background: "#5c5c5c"}}>
                                                        <Dropdown.Item>
                                                            <Typography
                                                                onClick={() => this.setState({adding_measure: true})}
                                                                variant={'button'}
                                                                color={'textPrimary'}
                                                            >
                                                                <Icon name='add'/>Add Measure...
                                                            </Typography>
                                                        </Dropdown.Item>
                                                        <Dropdown.Item>
                                                            <Typography
                                                                onClick={() => this.setState({inviting_others: true})}
                                                                variant={'button'}
                                                                color={'textPrimary'}
                                                            >
                                                                <Icon name='add'/>Invite Others...
                                                            </Typography>
                                                        </Dropdown.Item>

                                                        <Dialog open={this.state.adding_measure}
                                                                onClose={() => this.setState({adding_measure: false})}
                                                                aria-labelledby="add-measure-title"
                                                                aria-describedby="add-measure-description"
                                                        >
                                                            <DialogTitle
                                                                id='add-measure-title'>{"Add a measure"}</DialogTitle>
                                                            <DialogContent>
                                                                <DialogContentText id='add-measure-description'>
                                                                    Create a new measure to start ranking the survivors
                                                                    in your bunker!
                                                                </DialogContentText>
                                                                <TextField
                                                                    autoFocus
                                                                    margin="dense"
                                                                    id="name"
                                                                    label="Measure name"
                                                                    type='text'
                                                                    fullWidth
                                                                    color={'secondary'}
                                                                    onChange={(event) => this.__onCreateMeasureNameFormChange(event.target.value)}
                                                                />
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button onClick={this.__onAddMeasureClick}>
                                                                    Create
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                        <Dialog open={this.state.inviting_others}
                                                                onClose={() => this.setState({inviting_others: false})}
                                                                aria-labelledby='inviting-others-title'
                                                                aria-describedby='inviting-others-description'
                                                        >
                                                            <DialogTitle id='inviting-others-title'>Invite
                                                                Others</DialogTitle>
                                                            <DialogContent>
                                                                <DialogContentText id='inviting-others-description'>
                                                                    Copy and send the access code below to your friends
                                                                    so
                                                                    they can join you in your bunker and help you
                                                                    survive!
                                                                </DialogContentText>
                                                                <Typography color={'secondary'} variant={'h5'}
                                                                            align={'center'}><b>{this.state.bunker._id}</b></Typography>
                                                            </DialogContent>
                                                            <DialogActions>
                                                                <Button
                                                                    onClick={() => this.setState({inviting_others: false})}>
                                                                    Done
                                                                </Button>
                                                            </DialogActions>
                                                        </Dialog>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Menu.Item>
                                        </Container>
                                    </Menu>
                                </Container>
                            </SUI_Grid.Row>
                            <SUI_Grid.Row columns={1}>
                                <MUI_Grid container spacing={5} style={{marginTop: '48px'}} direction={"row"}>
                                    <MUI_Grid item xs={12}>
                                        <MUI_Grid container justify="center" spacing={4}>
                                            {measureDataForDisplay.map(value => (
                                                <MUI_Grid item>
                                                    {value}
                                                </MUI_Grid>
                                            ))}
                                        </MUI_Grid>
                                    </MUI_Grid>
                                </MUI_Grid>
                            </SUI_Grid.Row>
                        </SUI_Grid>
                    </ThemeProvider>
                </div>
            )
        }
    }

}

export default Bunker