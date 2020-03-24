import React from "react";
import Feed from "semantic-ui-react/dist/commonjs/views/Feed";
import {Container, Divider, Dropdown, Grid as SUI_Grid, Menu, Segment} from "semantic-ui-react";
import LogoutButton from "./LogoutButton";
import Modal from "semantic-ui-react/dist/commonjs/modules/Modal";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import MUI_Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Bunker from './Bunker';

class Measure extends React.Component {
    state = {
        feed: [],
        user_obj: null,
        measure_name: "",
        measure_id: "",
        go_back: false,
        bunker_id: null
    }

    constructor(props) {
        super(props);
        this.state = {
            user_obj: this.props.user_obj,
            measure_name: this.props.measure_name,
            measure_id: this.props.measure_id,
            feed: [],
            go_back: false,
            bunker_id: this.props.bunker_id
        }
        // Set user upon return
        // this.getBunker(this.props.location.state.bunker_id).then(r => this.__completeStateInitialization())
    }

    setGoBack = () => {
        this.setState({go_back: true})
    }

    feedEventCard = () => {
        return (<Feed.Event>
                <Feed.Label>
                    <Avatar>CW</Avatar> </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Feed.User>Christien Williams</Feed.User>
                    </Feed.Summary>

                    <Feed.Extra>
                        <MUI_Grid container spacing={5} style={{marginTop: '20px'}} justify={"space-between"}
                                  alignItems={"flex-start"}>
                            <MUI_Grid item xs={2} direction={"row"}>
                                <Card maxWidth={24}>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            Ariel Brito receives
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            - 5
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                        </Typography>
                                        {/*<Typography variant="body2" component="p">*/}
                                        {/*    From*/}
                                        {/*    <br/>*/}
                                        {/*    Christien Williams*/}
                                        {/*</Typography>*/}
                                    </CardContent>
                                </Card>
                            </MUI_Grid>

                            <MUI_Grid item xs={7}>

                                <p>
                                    Ours is a life of constant reruns. We're always circling back to where
                                    we'd we started, then starting all over again. Even if we don't run
                                    extra laps that day, we surely will come back for more of the same
                                    another day soon.
                                </p>
                            </MUI_Grid>

                            <MUI_Grid item xs={2}>

                                <Button variant="contained">Verify</Button>
                            </MUI_Grid>
                        </MUI_Grid>
                        <Divider/>
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }

    render() {
        if (this.state.go_back) {
            return (
                <Bunker bunker_id={this.state.bunker_id} user_obj={this.state.user_obj}/>
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
                                        <Menu.Item as='a' header position={"right"}>
                                            <Modal trigger={<Segment.Inline> <Icon name='add'/> Leaderboard, babyy
                                            </Segment.Inline>}>
                                                <Modal.Header>Add a new measure, dawggg</Modal.Header>
                                                <Modal.Content>
                                                    <Segment vertical>
                                                        <Modal.Description>
                                                            <p>
                                                                Just dooo it!... Create a new measure!
                                                            </p>
                                                        </Modal.Description>
                                                        <Divider/>
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
                            <Container>

                                <Feed style={{marginTop: '55px'}}>
                                    {this.feedEventCard()}
                                </Feed>
                            </Container>

                        </SUI_Grid.Row>
                    </SUI_Grid>
                </div>
            )
        }
    }
}

export default Measure