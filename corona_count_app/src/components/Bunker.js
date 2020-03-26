import React from 'react'
// eslint-disable-next-line
import {
    List,
    Segment,
    Dropdown,
    Menu,
    Container,
    Image,
    Divider,
    Grid as SUI_Grid,
    Header,
    Form,
    Button
} from 'semantic-ui-react'
import {useAuth0} from "../react-auth0-spa";
import LogoutButton from "./LogoutButton";
import axios from 'axios';
import UserProfile from '../Hooks/RetrieveProfileGoHome'
import config from '../url_config.json';
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";
import {Redirect} from "react-router-dom";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from '@material-ui/core/CardActionArea';
import Typography from "@material-ui/core/Typography";
import Flexbox from 'flexbox-react';
import MUI_Grid from '@material-ui/core/Grid';
import Measure from './Measure';

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
        users_for_bunker: null
    }

    constructor(props) {
        super(props);
        // Set user upon return
        let bunker_id
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
            let name = users.filter(entry => entry.user_id == sorted_ratings[i].user)[0].name;
            let rank = i + 1;
            let score = sorted_ratings[i].score;
            leaderboard.push({rank, name, score})
        }
        return leaderboard
    }

    // Page change prep functions
    setGoBack = () => {
        this.setState({go_back: true})
    }

    setGoToMeasure = (measure_obj) => {
        console.log("Go to measure:", measure_obj)
        this.setState({select_measure_name: measure_obj.name})
        this.setState({select_measure_id: measure_obj._id})
        this.setState({select_measure_obj: measure_obj})
        this.setState({go_to_measure: true})
    }

    // Back end call functions

    async createNewMeasure(name, default_score) {
        //TODO: Duplicate measure names shouldn't exit
        let url = config.bunkers_url + "/measure/" + this.state.bunker._id + "/" + name + "/" + default_score
        url = encodeURI(url)
        console.log('Post new measure url: ', url)
        try {
            const response = await axios.post(
                url,
                {},
                {headers: {'Content-Type': 'application/json'}}
            ).then(e => this.setGoToMeasure(e.data.measure))
        } catch (e) {
            console.log(e.response)
        }
    }

    async getBunker(bunker_id) {
        let url = config.bunkers_url + "/" + bunker_id
        url = encodeURI(url)
        console.log('Get bunker url: ', url)

        try {
            const response =
                await axios.get(url).then(r => {
                    this.setState({bunker: r.data.bunker})
                    this.getMeasuresFromBunker(r.data.bunker._id)
                    console.log("Retrieved bunker data: ", r.data.bunker)
                })
        } catch (e) {
            console.log("Bunker doesn't exist", e)
            return null
        }
    }

    async getMeasuresFromBunker(bunker_id) {
        let url = config.bunkers_url + "/measures/" + bunker_id
        url = encodeURI(url)
        console.log('Get measures from bunker url: ', url)
        try {
            const response =
                await axios.get(url).then(r => {
                        this.setState({measures: r.data.measures})
                        this.getUsersFromBunker(bunker_id)
                    }
                )
            console.log("Retrieved bunker's measures")
        } catch (e) {
            console.log("Couldn't get bunker's measures", e)
            return null
        }

    }

    async getMeasure(measure_id) {
        let url = config.measures_url + "/" + measure_id
        url = encodeURI(url)
        console.log('Get measure url: ', url)

        try {
            const response =
                await axios.get(url).then(r => {
                    console.log("Retrieved measure data: ", r.data.measure)
                    this.setGoToMeasure(r.data.measure)
                })
        } catch (e) {
            console.log("Measure doesn't exist", e)
            return null
        }
    }

    async getUsersFromBunker(bunker_id) {
        let url = config.bunkers_url + "/users/" + bunker_id
        url = encodeURI(url)
        console.log('Get users from bunker url: ', url)
        try {
            const response =
                await axios.get(url).then(r => {
                    console.log("Retrieved users from bunker: ", r.data.users)
                    this.setState({users_for_bunker: r.data.users})
                })
        } catch (e) {
            console.log("Failed getting users from bunker", e)
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
            this.setState({users_for_bunker: this.props.location.state.users_for_bunker})
        } catch (e) { // Transitioning from a measure
            this.setState({users_for_bunker: this.props.users_for_bunker})
        }
        this.setState({bunker_name: this.state.bunker.name})

        console.log("User object: ", this.state.user_obj)
    }

    // On click/change functions

    __onCreateMeasureNameFormChange = (value) => {
        this.setState({create_measure_form_text: value})
    }

    __onAddMeasureClick = () => {
        this.createNewMeasure(this.state.create_measure_form_text, this.state.create_measure_default_score).then(r => console.log("Measure created"))

    }

    async __onMeasureCardClick(id) {
        let measure_obj = await this.getMeasure(id)
        this.setGoToMeasure(measure_obj)
    }

    // Render functions

    addMeasureCard = () => {
        return (
            <div>
                <Form.Input fluid icon='bug' iconPosition='left'
                            placeholder='New measure name'
                            onChange={(e, {value}) => this.__onCreateMeasureNameFormChange(value)}/>
            </div>
        )
    }

    addBunkerModalHeader = () => {
        return (
            <Header>Roommates making bad jokes, couching too much, or being a headass? Let them know with this measure
                rating</Header>
        )
    }

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
    }

    renderMeasureListItem = (measure) => {
        let lb = this.buildLeaderboard(measure.ratings, this.state.users_for_bunker)
        return (
            <Card onClick={() => this.getMeasure(measure._id)} id={measure._id}>
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
                            2. {lb[1].name}
                            <br/>
                            3. {lb[2].name}

                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
    }

    genMeasureList = () => {
        let data = []
        if (this.state.measures.length == 0) {
            data.push(this.renderEmptyMeasureListItem())
        } else {
            this.state.measures.forEach(measure => data.push(this.renderMeasureListItem(measure)))
        }
        return data
    };


    render() {
        let measureDataForDisplay = this.genMeasureList()
        if (this.state.go_back) {
            return (
                < Redirect to={{pathname: "/home", state: {user: this.state.user_obj}}}/>
            )
        } else if (this.state.go_to_measure) {
            return (
                <Measure measure_name={this.state.select_measure_name} measure_id={this.state.select_measure_id}
                         measure_obj={this.state.select_measure_obj}
                         user_obj={this.state.user_obj} bunker_id={this.state.bunker._id}
                         users_for_bunker={this.state.users_for_bunker}/>
            )
        } else {
            return (
                <div className="full-height" style={{
                    backgroundColor: '#900C3F ',
                    backgroundSize: "cover",
                    top: '0',
                    bottom: '0',
                    left: '0',
                    right: '0',
                    position: 'absolute'
                }}>
                    <SUI_Grid divided='vertically'>
                        <SUI_Grid.Row columns={1}>
                            <Container>
                                <Menu fixed='top' color={'#581845'} inverted borderless>
                                    <Container>
                                        <Menu.Item position={"left"}>
                                            <Dropdown item icon='arrow circle left' simple>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={this.setGoBack}>
                                                        Back to home
                                                    </Dropdown.Item>
                                                    <Dropdown.Item>
                                                        <LogoutButton/>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Menu.Item>
                                        <Menu.Item header>
                                            {this.state.bunker_name}
                                        </Menu.Item>
                                        <Menu.Item as='a' header position={"right"}>
                                            <Modal trigger={<Segment.Inline> <Icon name='add'/> Add Measure
                                            </Segment.Inline>}>
                                                <Modal.Header>Add a new measure, dawggg</Modal.Header>
                                                <Modal.Content>
                                                    <Segment vertical>
                                                        <Modal.Description>
                                                            {this.addBunkerModalHeader()}
                                                            <p>
                                                                Just dooo it!... Create a new measure!
                                                            </p>
                                                        </Modal.Description>
                                                        <Divider/>
                                                        {this.addMeasureCard()}
                                                        <Divider/>
                                                        <Button color='#581845' fluid size='large'
                                                                onClick={this.__onAddMeasureClick}>
                                                            Esketit
                                                        </Button>
                                                    </Segment>
                                                </Modal.Content>
                                            </Modal>

                                        </Menu.Item>
                                    </Container>
                                </Menu>
                            </Container>
                        </SUI_Grid.Row>
                        <SUI_Grid.Row columns={1}>
                            {/*<Container text style={{marginTop: '38px'}}>*/}
                            {/*<Segment vertical>*/}
                            {/*    <List divided inverted relaxed items={measureDataForDisplay}>*/}
                            {/*    </List>*/}
                            {/*</Segment>*/}
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
                            {/*</Container>*/}
                        </SUI_Grid.Row>
                    </SUI_Grid>
                </div>
            )
        }
    }

}

export default Bunker