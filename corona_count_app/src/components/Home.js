import React from 'react'
// eslint-disable-next-line
import {List, Segment, Dropdown, Menu, Container, Image} from 'semantic-ui-react'
import FlatList from 'flatlist-react';


class Home extends React.Component {
    state = {
        bunkers: [
            {name: "PBE", id: 1},
            {name: "PHAT Fam", id: 2},
            {name: "FLP", id: 3}

        ],
        user: {name: "Christien", id: 0}, //should be obj w/ unique ID and name
    }

    constructor(props) {
        super(props);
        this.state = {
            bunkers: [
                {name: "PBE", id: 1},
                {name: "PHAT Fam", id: 2},
                {name: "FLP", id: 3}

            ],
            user: {name: "Christien", id: 0}, //should be obj w/ unique ID and name
        };
    }

    // componentWillReceiveProps(newProps) {
    //     this.setState({bunkers: newProps.bunkers});
    //     this.setState({user: newProps.user})
    // }


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
        this.state.bunkers.forEach(bunker => data.push(this.renderBunkerListItem(bunker)))
        return data
    }

    bunkerDataForDisplay = this.genBunkerList()

    render() {
        return (
            <div>
                <Container>
                    <Menu fixed='top' color={'green'} inverted>
                        <Container>
                            <Menu.Item as='a' header>
                                <Image size='mini' src='/logo.png' style={{marginRight: '1.5em'}}/>
                                It's shot o'clock, bitch!
                            </Menu.Item>
                            <Menu.Item as='a'>Home</Menu.Item>

                            <Dropdown item simple text='Dropdown'>
                                <Dropdown.Menu>
                                    <Dropdown.Item>List Item</Dropdown.Item>
                                    <Dropdown.Item>List Item</Dropdown.Item>
                                    <Dropdown.Divider/>
                                    <Dropdown.Header>Header Item</Dropdown.Header>
                                    <Dropdown.Item>
                                        <i className='dropdown icon'/>
                                        <span className='text'>Submenu</span>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>List Item</Dropdown.Item>
                                            <Dropdown.Item>List Item</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Item>
                                    <Dropdown.Item>List Item</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
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