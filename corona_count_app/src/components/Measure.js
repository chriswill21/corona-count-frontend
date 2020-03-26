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
import TextField from '@material-ui/core/TextField'
import Snackbar from '@material-ui/core/Snackbar';
import config from "../url_config";
import axios from "axios";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import socketIOClient from "socket.io-client";


function createData(name, code, population, size) {
    const density = population / size;
    return {name, code, population, size, density};
}

class Measure extends React.Component {
    state = {
        raw_feed: [],
        user_obj: null,
        measure_name: "",
        measure_id: "",
        measure_obj: null,
        go_back: false,
        bunker_id: null,
        users: [],
        user_id_to_name: new Map(),
        user_being_rated_name_and_id: {},
        user_being_rated_comment: "",
        user_being_rated_delta: 0,
        snackbar_open: false,
        endpoint: "http://127.0.0.1:4000"
    }

    columns = [
        {id: 'name', label: 'Name', minWidth: 170},
        {id: 'code', label: 'ISO\u00a0Code', minWidth: 100},
        {
            id: 'population',
            label: 'Population',
            minWidth: 170,
            align: 'right',
            format: value => value.toLocaleString(),
        },
        {
            id: 'size',
            label: 'Size\u00a0(km\u00b2)',
            minWidth: 170,
            align: 'right',
            format: value => value.toLocaleString(),
        },
        {
            id: 'density',
            label: 'Density',
            minWidth: 170,
            align: 'right',
            format: value => value.toFixed(2),
        },
    ];

    rows = [
        createData('India', 'IN', 1324171354, 3287263),
        createData('China', 'CN', 1403500365, 9596961),
        createData('Italy', 'IT', 60483973, 301340),
        createData('United States', 'US', 327167434, 9833520),
        createData('Canada', 'CA', 37602103, 9984670),
        createData('Australia', 'AU', 25475400, 7692024),
        createData('Germany', 'DE', 83019200, 357578),
        createData('Ireland', 'IE', 4857000, 70273),
        createData('Mexico', 'MX', 126577691, 1972550),
        createData('Japan', 'JP', 126317000, 377973),
        createData('France', 'FR', 67022000, 640679),
        createData('United Kingdom', 'GB', 67545757, 242495),
        createData('Russia', 'RU', 146793744, 17098246),
        createData('Nigeria', 'NG', 200962417, 923768),
        createData('Brazil', 'BR', 210147125, 8515767),
    ];

    constructor(props) {
        super(props);
        this.state = {
            user_obj: this.props.user_obj,
            measure_name: this.props.measure_name,
            measure_id: this.props.measure_id,
            measure_obj: this.props.measure_obj,
            raw_feed: [],
            go_back: false,
            bunker_id: this.props.bunker_id,
            users: this.props.users_for_bunker,
            user_id_to_name: new Map(),
            user_being_rated_name_and_id: {},
            user_being_rated_comment: "",
            user_being_rated_delta: 0,
            snackbar_open: false,
            endpoint: "http://127.0.0.1:4000",
        }

        this.setUserIdToName()
        this.getFeed(this.state.measure_id).then()
    }

    componentDidMount() {
        const endpoint = this.state.endpoint;
        const socket = socketIOClient(endpoint);
        socket.on("new_post", data => {
            this.setState({raw_feed: data})
        });
        socket.on("verified_post", data => {
            this.setState({raw_feed: data})
        });
    }

    setGoBack = () => {
        this.setState({go_back: true})
    }

    setUserIdToName = () => {
        let user_id_to_name = new Map()
        this.state.users.forEach(value => {
            user_id_to_name.set(value.user_id, value.name)
        })
        this.setState({user_id_to_name: user_id_to_name})
        console.log("User id to name", user_id_to_name)
    }

    handleUserBeingRatedSelectorChange = event => {
        this.setState({user_being_rated_name_and_id: event.target.value});
    };

    handleSnackbarOpen = () => {
        this.setState({snackbar_open: true})
    }

    handleSnackbarClose = () => {
        this.setState({snackbar_open: false})
    }

    deltaSliderValueChange = (value) => {
        this.setState({user_being_rated_delta: value.toString()})
    }

    buildFeed = () => {
        let feed = [this.postEventCard()]
        this.state.raw_feed.forEach(raw_feed_item => {
            feed.push(this.feedEventCard(raw_feed_item))
        })
        return feed
    }


    // On click functions

    __onSubmitDeltaClick = () => {
        if (!this.state.user_being_rated_name_and_id || !this.state.user_being_rated_comment) {
            // Tell them to add name breadcrums
            this.handleSnackbarOpen()
        } else {
            // Post delta to backend
            this.postDelta().then()
            this.setState({user_being_rated_name_and_id: {}})
            this.setState({user_being_rated_comment: ""})
            this.setState({user_being_rated_delta: 0})
        }
    }

    _onCommentTextChange = (event) => {
        this.setState({user_being_rated_comment: event.target.value})
    }

    _onVerifyDelta = (post_id) => {
        // this.state.raw_feed.filter((entry => entry._id === post_id))[0].is_verified = true
        this.verifyPost(post_id).then()
    }

    // Back end async functions

    async postDelta() {
        let url = config.measures_url + "/feed/" + this.state.measure_id
        url = encodeURI(url)
        console.log('Post delta url: ', url)
        try {
            const response = await axios.post(
                url,
                {
                    accuser_id: this.state.user_obj.sub.slice(6),
                    victim_id: this.state.user_being_rated_name_and_id.user_id,
                    delta: this.state.user_being_rated_delta,
                    comment: this.state.user_being_rated_comment,
                    is_verified: false
                },
                {headers: {'Content-Type': 'application/json'}}
            ).then(r => console.log("Successfully posted delta"))
        } catch (e) {
            console.log("Failed to post delta", e.response)
            return null
        }
    }

    async getFeed() {
        let url = config.measures_url + "/feed/" + this.state.measure_id
        url = encodeURI(url)
        console.log('Get feed url: ', url)
        try {
            const response =
                await axios.get(url).then(r => {
                    console.log("Retrieved feed: ", r.data.feed)
                    this.setState({raw_feed: r.data.feed})
                })
        } catch (e) {
            console.log("Failed to retrieve feed", e.response)
            return null
        }
    }

    async verifyPost(post_id) {
        let url = config.measures_url + "/verify/" + this.state.measure_id + "/" + post_id
        url = encodeURI(url)
        console.log('Verify post url: ', url)
        try {
            const response = await axios.post(
                url,
                {},
                {headers: {'Content-Type': 'application/json'}}
            ).then(r => console.log("Successfully posted delta"))
        } catch (e) {
            console.log("Failed to verify post", e.response)
            return null
        }
    }

    // Component render functions

    postEventCard = () => {
        return (
            <Feed.Event>
                <Feed.Content>
                    <Feed.Extra>
                        <MUI_Grid container spacing={5} style={{marginTop: '20px'}} justify={"space-evenly"}
                                  alignItems={"center"}>
                            <MUI_Grid item xs={2}>
                                <TextField
                                    id="outlined-select-currency-native"
                                    select
                                    label="User select"
                                    onChange={this.handleUserBeingRatedSelectorChange}
                                    helperText="User being rated"
                                    variant="outlined"
                                    color={"primary"}
                                    defaultValue={""}
                                >
                                    {this.state.users.map(option => (
                                        <option key={option.user_id} value={option}>
                                            {option.name}
                                        </option>
                                    ))}
                                </TextField>
                            </MUI_Grid>
                            <MUI_Grid item xs={2}>
                                <TextField id="standard-basic" label="Comments"
                                           value={this.state.user_being_rated_comment}
                                           onChange={(event => this._onCommentTextChange(event))
                                           }/>

                            </MUI_Grid>
                            <MUI_Grid item xs={4}>
                                <Container>
                                    <Typography id="discrete-slider-small-steps" gutterBottom>
                                        Point delta: {this.state.user_being_rated_delta.toString()}
                                    </Typography>
                                    <Slider
                                        defaultValue={0.0}
                                        onChange={(event, value) => this.deltaSliderValueChange(value)}
                                        aria-labelledby="discrete-slider-small-steps"
                                        step={1.0}
                                        marks
                                        color={"secondary"}
                                        min={-10.0}
                                        max={10.0}
                                        valueLabelDisplay="auto"
                                        value={this.state.user_being_rated_delta}
                                    />
                                </Container>
                            </MUI_Grid>
                            <MUI_Grid item xs={2}>
                                <Button variant="contained" onClick={this.__onSubmitDeltaClick}>Submit</Button>
                            </MUI_Grid>
                        </MUI_Grid>
                        <Divider/>
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    }

    feedEventCard = (raw_feed_item) => {
        let post_id = raw_feed_item._id
        let accuser = this.state.users.filter(entry => entry.user_id === raw_feed_item.accuser_id)[0].name
        let victim = this.state.users.filter(entry => entry.user_id === raw_feed_item.victim_id)[0].name
        let delta = raw_feed_item.delta
        let is_verified = raw_feed_item.is_verified ? <div></div> :
            <Button variant="contained" color={"secondary"} onClick={() => this._onVerifyDelta(post_id)}>Verify</Button>
        let comment = raw_feed_item.comment
        let initials = null
        try {
            initials = accuser.split(" ")[0][0]
        } catch {
            initials = " "
        }
        return (<Feed.Event>
                <Feed.Label>
                    <Avatar>{initials}</Avatar>
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Feed.User>{accuser}</Feed.User>
                    </Feed.Summary>

                    <Feed.Extra>
                        <MUI_Grid container spacing={5} style={{marginTop: '20px'}} justify={"space-between"}
                                  alignItems={"flex-start"}>
                            <MUI_Grid item xs={2}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>
                                            {victim} receives
                                        </Typography>
                                        <Typography variant="h5" component="h2">
                                            {delta}
                                        </Typography>
                                        <Typography color="textSecondary" gutterBottom>
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </MUI_Grid>

                            <MUI_Grid item xs={7}>
                                <p>
                                    {comment}
                                </p>
                            </MUI_Grid>

                            <MUI_Grid item xs={2}>
                                {is_verified}
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
                    <Snackbar
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        open={this.state.snackbar_open}
                        autoHideDuration={6000}
                        onClose={this.handleSnackbarClose}
                        message="Please add a name and comments to submit a delta"
                    />
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
                                            {this.state.measure_name}
                                        </Menu.Item>
                                        <Menu.Item as='a' header position={"right"}>
                                            <Modal trigger={<Segment.Inline> <Icon name='add'/> Leaderboard, babyy
                                            </Segment.Inline>}>
                                                <Modal.Header>Add a new measure, dawggg</Modal.Header>
                                                <Modal.Content>
                                                    <TableContainer>
                                                        <Table stickyHeader aria-label="sticky table">
                                                            <TableHead>
                                                                <TableRow>
                                                                    {this.columns.map(column => (
                                                                        <TableCell
                                                                            key={column.id}
                                                                            align={column.align}
                                                                            style={{minWidth: column.minWidth}}
                                                                        >
                                                                            {column.label}
                                                                        </TableCell>
                                                                    ))}
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {this.rows.map(row => {
                                                                    return (
                                                                        <TableRow hover role="checkbox" tabIndex={-1}
                                                                                  key={row.code}>
                                                                            {this.columns.map(column => {
                                                                                const value = row[column.id];
                                                                                return (
                                                                                    <TableCell key={column.id}
                                                                                               align={column.align}>
                                                                                        {column.format && typeof value === 'number' ? column.format(value) : value}
                                                                                    </TableCell>
                                                                                );
                                                                            })}
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                </Modal.Content>
                                            </Modal>

                                        </Menu.Item>
                                    </Container>
                                </Menu>
                            </Container>
                        </SUI_Grid.Row>
                        {/*<SUI_Grid.Row columns={1}>*/}
                        {/*    <Menu fixed='top' color={'grey'} inverted borderless style={{marginTop: '60px'}} fluid widths={4}>*/}
                        {/*        <Container>*/}
                        {/*            <Menu.Item position={"left"}>*/}
                        {/*                <TextField*/}
                        {/*                    id="outlined-select-currency-native"*/}
                        {/*                    select*/}
                        {/*                    label="User select"*/}
                        {/*                    onChange={this.handleUserBeingRatedSelectorChange}*/}
                        {/*                    SelectProps={{*/}
                        {/*                        native: true,*/}
                        {/*                    }}*/}
                        {/*                    helperText="User being rated"*/}
                        {/*                    variant="outlined"*/}
                        {/*                >*/}
                        {/*                    /!*{this.state.users.map(option => (*!/*/}
                        {/*                    /!*    <option key={option.value.user} value={option.value.user}>*!/*/}
                        {/*                    /!*        {option.label}*!/*/}
                        {/*                    /!*    </option>*!/*/}
                        {/*                    /!*))}*!/*/}
                        {/*                </TextField>*/}
                        {/*            </Menu.Item>*/}
                        {/*            <Menu.Item header>*/}
                        {/*                <TextField id="standard-basic" label="Comments"/>*/}

                        {/*            </Menu.Item>*/}
                        {/*            <Menu.Item header>*/}
                        {/*                <Container>*/}
                        {/*                    <Typography id="discrete-slider-small-steps" gutterBottom>*/}
                        {/*                        Point delta*/}
                        {/*                    </Typography>*/}
                        {/*                    <Slider*/}
                        {/*                        defaultValue={0.0}*/}
                        {/*                        // getAriaValueText={valuetext}*/}
                        {/*                        aria-labelledby="discrete-slider-small-steps"*/}
                        {/*                        step={1.0}*/}
                        {/*                        marks*/}
                        {/*                        min={-10.0}*/}
                        {/*                        max={10.0}*/}
                        {/*                        valueLabelDisplay="auto"*/}
                        {/*                    />*/}
                        {/*                </Container>*/}
                        {/*            </Menu.Item>*/}
                        {/*            <Menu.Item as='a' header position={"right"}>*/}
                        {/*                <Button variant="contained">Submit</Button>*/}
                        {/*            </Menu.Item>*/}
                        {/*        </Container>*/}
                        {/*    </Menu>*/}
                        {/*</SUI_Grid.Row>*/}
                        <SUI_Grid.Row columns={1}>
                            <Container>
                                <Feed style={{marginTop: '55px'}}>
                                    {this.buildFeed().map(value => value)}
                                    {/*{this.postEventCard()}*/}
                                    {/*{this.feedEventCard()}*/}
                                    {/*{this.feedEventCard()}*/}
                                    {/*{this.feedEventCard()}*/}
                                    {/*{this.feedEventCard()}*/}
                                    {/*{this.feedEventCard()}*/}
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