import React, {Component} from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
// eslint-disable-next-line
import logo from './logo.svg';
import './App.css';
import Home from './components/Home.js'
import RetrieveProfileGoHome from "./Hooks/RetrieveProfileGoHome";
import Login from './components/Login.js'
import Bunker from "./components/Bunker";
import {useAuth0} from "./react-auth0-spa";
import StartPage from "./components/StartPage";
import Redirect from "react-router-dom/es/Redirect";


function App() {
    const {isAuthenticated, loading} = useAuth0();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <div>
                <Switch>
                    < Redirect exact={true} from={'/'} to={"/start"}/>
                    <Route path='/home' render={(props) => (isAuthenticated ? <RetrieveProfileGoHome {...props}/> :
                        < Redirect to={"/start"}/>)}/>
                    <Route path='/login'
                           render={(props) => (isAuthenticated ? <Login {...props}/> : < Redirect to={"/start"}/>)}/>
                    <Route path='/start' render={(props) => <StartPage {...props}/>}/>
                    <Route path='/bunker'
                           render={(props) => (isAuthenticated ? <Bunker {...props}/> : < Redirect to={"/start"}/>)}/>
                </Switch>
            </div>
        </Router>
    );


}

export default App;
