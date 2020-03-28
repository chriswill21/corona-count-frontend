import React from "react";
import Feed from "semantic-ui-react/dist/commonjs/views/Feed";
import {Container, Divider, Dropdown, Grid as SUI_Grid, Menu, Segment} from "semantic-ui-react";
import LogoutButton from "./LogoutButton";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Slider from '@material-ui/core/Slider';
import MUI_Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Bunker from './Bunker';
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'
import Snackbar from '@material-ui/core/Snackbar';
import config from "../url_config";
import axios from "axios";
import socketIOClient from "socket.io-client";
import {
    Button,
    createMuiTheme,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@material-ui/core";
import {ThemeProvider} from '@material-ui/styles'


class Measure extends React.Component {
    state = {
        raw_feed: [],
        lb_rows: [],
        ratings: [],
        user_obj: null,
        measure_name: "",
        measure_id: "",
        measure_obj: null,
        go_back: false,
        bunker_id: null,
        users: [],
        past_users: [],
        user_being_rated_name_and_id: null,
        user_being_rated_comment: "",
        user_being_rated_delta: 0,
        snackbar_open: false,
        endpoint: "http://127.0.0.1:4000",
        viewing_leaderboard: false,
        theme: this.props.theme
    };

    columns = [
        {id: 'rank', label: 'Rank', minWidth: 170},
        {id: 'name', label: 'Name', minWidth: 170},
        {id: 'score', label: 'Score', minWidth: 170},

    ];

    constructor(props) {
        super(props);
        this.state = {
            user_obj: this.props.user_obj,
            ratings: this.props.measure_obj.ratings,
            measure_name: this.props.measure_name,
            measure_id: this.props.measure_id,
            measure_obj: this.props.measure_obj,
            raw_feed: [],
            lb_rows: this.props.buildLeaderboard(this.props.measure_obj.ratings, this.props.users_for_bunker),
            go_back: false,
            bunker_id: this.props.bunker_id,
            users: this.props.users_for_bunker,
            past_users: this.props.past_users_for_bunker,
            user_being_rated_name_and_id: null,
            user_being_rated_comment: "",
            user_being_rated_delta: 0,
            snackbar_open: false,
            endpoint: "http://127.0.0.1:4000",
            theme: this.props.theme
        };

        this.getFeed(this.state.measure_id).then()
    }

    componentDidMount() {
        const endpoint = this.state.endpoint;
        const socket = socketIOClient(endpoint);
        socket.on("new_post", data => {
            this.setState({raw_feed: data})
        });
        socket.on("verified_post", data => {
            this.setState({
                raw_feed: data.feed,
                ratings: data.ratings,
                lb_rows: this.props.buildLeaderboard(data.ratings, this.state.users)
            });
        });
    }

    setGoBack = () => {
        this.setState({go_back: true})
    };

    handleUserBeingRatedSelectorChange = event => {
        this.setState({user_being_rated_name_and_id: event.target.value});
    };

    handleSnackbarOpen = () => {
        this.setState({snackbar_open: true})
    };

    handleSnackbarClose = () => {
        this.setState({snackbar_open: false})
    };

    deltaSliderValueChange = (value) => {
        this.setState({user_being_rated_delta: value.toString()})
    };

    buildFeed = () => {
        let feed = [this.postEventCard()];
        this.state.raw_feed.forEach(raw_feed_item => {
            feed.push(this.feedEventCard(raw_feed_item))
        });
        return feed
    };


    // On click functions

    __onSubmitDeltaClick = () => {
        if (!this.state.user_being_rated_name_and_id || this.state.user_being_rated_name_and_id === {} || !this.state.user_being_rated_comment) {
            // Tell them to add name breadcrums
            this.handleSnackbarOpen()
        } else {
            // Post delta to backend
            this.postDelta().then();
            this.setState({
                user_being_rated_name_and_id: null,
                user_being_rated_comment: "",
                user_being_rated_delta: 0
            })
        }
    };

    _onCommentTextChange = (event) => {
        this.setState({user_being_rated_comment: event.target.value})
    };

    _onVerifyDelta = (post_id) => {
        // this.state.raw_feed.filter((entry => entry._id === post_id))[0].is_verified = true
        this.verifyPost(post_id).then()
    };

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
        console.log(this.state.users);
        return (
            <Feed.Event>
                <Feed.Content>
                    <Feed.Extra>
                        <MUI_Grid container spacing={5} style={{marginTop: '20px'}} justify={"space-evenly"}
                                  alignItems={"center"}>
                            <MUI_Grid item xs={2}>
                                <TextField
                                    id="outlined-select-user-native"
                                    select
                                    label="User select"
                                    onChange={this.handleUserBeingRatedSelectorChange}
                                    helperText="User being rated"
                                    variant="outlined"
                                    color={"primary"}
                                    defaultValue={""}
                                    fullWidth={true}
                                    value={this.state.user_being_rated_name_and_id == null ? "" : this.state.user_being_rated_name_and_id}
                                >

                                    {this.state.users.map(option => (
                                        <MenuItem key={option.user_id} value={option}>
                                            {option.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </MUI_Grid>
                            <MUI_Grid item xs={2}>
                                <TextField id="standard-basic" label="Comments"
                                           value={this.state.user_being_rated_comment}
                                           onChange={(event => this._onCommentTextChange(event))}
                                           fullWidth={true}
                                           color={"primary"}/>

                            </MUI_Grid>
                            <MUI_Grid item xs={4}>
                                <Container>
                                    <Typography id="discrete-slider-small-steps" gutterBottom>
                                        <Typography variant={'body'} color={'textPrimary'}>
                                            Point delta: {this.state.user_being_rated_delta.toString()}
                                        </Typography>
                                    </Typography>
                                    <Slider
                                        defaultValue={0.0}
                                        onChange={(event, value) => this.deltaSliderValueChange(value)}
                                        aria-labelledby="discrete-slider-small-steps"
                                        step={1.0}
                                        marks
                                        color={"primary"}
                                        min={-10.0}
                                        max={10.0}
                                        valueLabelDisplay="auto"
                                        value={this.state.user_being_rated_delta}
                                    />
                                </Container>
                            </MUI_Grid>
                            <MUI_Grid item xs={2}>
                                <Button variant='contained' size={'large'} color={'primary'} onClick={this.__onSubmitDeltaClick}>Submit</Button>
                            </MUI_Grid>
                        </MUI_Grid>
                        <Divider/>
                    </Feed.Extra>
                </Feed.Content>
            </Feed.Event>
        )
    };

    feedEventCard = (raw_feed_item) => {
        let post_id = raw_feed_item._id;
        const all_users = this.state.users.concat(this.state.past_users);
        let accuser = all_users.filter(entry => entry.user_id === raw_feed_item.accuser_id)[0].name;
        let victim = all_users.filter(entry => entry.user_id === raw_feed_item.victim_id)[0].name;
        let delta = raw_feed_item.delta;
        let is_verified = raw_feed_item.is_verified || this.state.user_obj.nickname === accuser ? <div></div> :
            <Button variant='contained' color={"primary"} onClick={() => this._onVerifyDelta(post_id)}>Verify</Button>;
        let comment = raw_feed_item.comment;
        let initials = null;
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
                        <Feed.User style={{color: 'white'}}>
                            <Typography variant={"h5"}>
                                {accuser}
                            </Typography>
                        </Feed.User>
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
                                <p style={{color: 'white'}}>
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
                <Bunker bunker_id={this.state.bunker_id}
                        user_obj={this.state.user_obj}
                        users_for_bunker={this.state.users}
                        theme={this.props.theme}/>
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
                    <ThemeProvider theme={createMuiTheme(this.state.theme)}>
                        <SUI_Grid divided='vertically'>
                            <SUI_Grid.Row columns={1}>
                                <Container>
                                    <Menu fixed='top' color={'#581845'} inverted borderless>
                                        <Container>
                                            <Menu.Item position={"left"}>
                                                <Dropdown item icon='arrow circle left' simple>
                                                    <Dropdown.Menu style={{background: "#2f2f2f"}}>
                                                        <Dropdown.Item>
                                                            <Button onClick={this.setGoBack}>
                                                                Back to bunker
                                                            </Button>
                                                        </Dropdown.Item>
                                                        <Dropdown.Item>
                                                            <LogoutButton/>
                                                        </Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </Menu.Item>
                                            <Menu.Item header>
                                                <Typography variant={'h4'}>
                                                    {this.state.measure_name}
                                                </Typography>
                                            </Menu.Item>
                                            <Menu.Item as='a'
                                                       header position={"right"}
                                                       onClick={() => this.setState({viewing_leaderboard: true})}>
                                                <Segment.Inline> <Icon name='trophy'/> Leaderboard
                                                </Segment.Inline>
                                            </Menu.Item>

                                            <Dialog open={this.state.viewing_leaderboard}
                                                    onClose={() => this.setState({viewing_leaderboard: false})}
                                                    aria-labelledby='leaderboard-title'
                                                    aria-describedby='leaderboard-description'
                                            >
                                                <DialogTitle id='leaderboard-title'>Leaderboard</DialogTitle>
                                                <DialogContent>
                                                    <DialogContentText id='leaderboard-description'>
                                                        See how the survivors in your bunker compare
                                                        in {this.state.measure_name}
                                                    </DialogContentText>
                                                </DialogContent>
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
                                                            {this.state.lb_rows.map(row => {
                                                                return (
                                                                    <TableRow hover role="checkbox" tabIndex={-1}
                                                                              key={row.code}>
                                                                        {this.columns.map(column => {
                                                                            const value = row[column.id];
                                                                            return (
                                                                                <TableCell key={column.id}
                                                                                           align={column.align}>
                                                                                    {value}
                                                                                </TableCell>
                                                                            );
                                                                        })}
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                                <DialogActions>
                                                    <Button onClick={() => this.setState({viewing_leaderboard: false})}>
                                                        Done
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </Container>
                                    </Menu>
                                </Container>
                            </SUI_Grid.Row>
                            <SUI_Grid.Row columns={1}>
                                <Container>
                                    <Feed style={{marginTop: '55px'}}>
                                        {this.buildFeed().map(value => value)}
                                    </Feed>
                                </Container>

                            </SUI_Grid.Row>
                        </SUI_Grid>
                    </ThemeProvider>
                </div>
            )
        }
    }
}

export default Measure