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

class Bunker extends React.Component {
    state = {
        measures: [],
        bunker: {
            "users": [
                "5e727d36c8ed5d0ce0e20fcd"
            ],
            "_id": "5e72bb378d68e10ca4e156d7",
            "name": "wassguuud",
            "measures": [
                {
                    "ratings": [
                        {
                            "_id": "5e7369256a45a60f1dcb6814",
                            "user": "5e727d36c8ed5d0ce0e20fcd",
                            "score": 24
                        }
                    ],
                    "_id": "5e7369256a45a60f1dcb6813",
                    "name": "lakers"
                }
            ],
            "__v": 0
        },
        user_obj: null,
        create_measure_form_text: null,
        create_measure_default_score: 0,
        bunker_name: "",
        go_back: false
    }

    constructor(props) {
        super(props);
        // Set user upon return
        this.getBunker(this.props.location.state.bunker_id).then(r => this.__completeStateInitialization())
    }

    setGoBack = () => {
        this.setState({go_back: true})
    }

    async createNewMeasure(name, default_score) {
        //TODO: Duplicate measure names shouldn't exit
        let url = config.measures_url + "/" + this.state.bunker._id + "/" + name + "/" + default_score
        url = encodeURI(url)
        console.log('Post new measure url: ', url)
        try {
            const response = await axios.post(
                url,
                {},
                {headers: {'Content-Type': 'application/json'}}
            ).then(e => console.log(e))
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
                await axios.get(url)
            console.log("Retrieved bunker data: ", response.data.bunker)
            this.setState({bunker: response.data.bunker})
            // return response.data.bunker
        } catch (e) {
            console.log(e => console.log("Bunker doesn't exist"))
            return null
        }
    }

    __completeStateInitialization() {
        this.setState({user_obj: this.props.location.state.user})
        this.setState({bunker_name: this.state.bunker.name})
        console.log("User object: ", this.state.user_obj)
    }

    __onCreateMeasureNameFormChange = (value) => {
        this.setState({create_measure_form_text: value})
    }

    __onCreateMeasureDefaultScoreChange = (value) => {
        this.setState({create_measure_default_score: value})
    }

    __onAddMeasureClick = () => {
        this.createNewMeasure(this.state.create_measure_form_text, this.state.create_measure_default_score).then(r => console.log("Measure created"))
    }

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
                <List.Icon name='github' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>You're in no measures!</List.Header>
                    <List.Description as='a'>...boringgggg...</List.Description>
                </List.Content>
            </List.Item>
        );
    }

    renderMeasureListItem = (measure) => {
        return (
            <List.Item>
                <List.Icon name='github' size='large' verticalAlign='middle'/>
                <List.Content>
                    <List.Header as='a'>{measure.name}</List.Header>
                    <List.Description as='a'>Christien is #1</List.Description>
                </List.Content>
            </List.Item>
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
        } else {
            return (
                <div>
                    <Container>
                        <Menu fixed='top' color={'teal'} widths={3} inverted>
                            <Container>
                                <Menu.Item as='a' position={"right"}>
                                    <Dropdown item icon='arrow circle left' simple>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={this.setGoBack}>
                                                Back to bunker
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
                                <Menu.Item as='a' header>
                                    <Modal trigger={<Segment.Inline> <Icon name='add'/> Add Measure
                                    </Segment.Inline>}>
                                        <Modal.Header>Add a new measure, dawggg</Modal.Header>
                                        <Modal.Content>
                                            <Segment stacked>
                                                <Modal.Description>
                                                    {this.addBunkerModalHeader()}
                                                    <p>
                                                        Just dooo it!... Create a new measure!
                                                    </p>
                                                </Modal.Description>
                                                <Divider/>
                                                {this.addMeasureCard()}
                                                <Divider/>
                                                <Button color='teal' fluid size='large'
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
                    <Container text style={{marginTop: '45px'}}>
                        <Segment inverted>
                            <List divided inverted relaxed items={measureDataForDisplay}>
                            </List>
                        </Segment>
                    </Container>
                </div>
            )
        }
    }
}

export default Bunker