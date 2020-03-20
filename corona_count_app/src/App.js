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

//function App() {
//  return (
//    <div className="App">
//      <header className="App-header">
//        <img src={logo} className="App-logo" alt="logo" />
//        <p>
//          Edit <code>src/App.js</code> and save to reload.
//        </p>
//        <a
//          className="App-link"
//          href="https://reactjs.org"
//          target="_blank"
//          rel="noopener noreferrer"
//        >
//          Learn React
//        </a>
//      </header>
//    </div>
//  );
//}
// class App extends Component {
//
//     render() {
//         return (
//             <Router>
//                 <div>
//                     <Route path='/home' component={Home}/>
//                     <Route path='/login' component={Login}/>
//                 </div>
//             </Router>
//         );
//     }
// }

function App() {
    const {isAuthenticated, loading} = useAuth0();

    if (loading) {
        return <div>Loading...</div>;
    }
    
    return (
        <Router>
            <div>
                <Switch>
                    <Route path='/home' render={(props) => (isAuthenticated ? <RetrieveProfileGoHome {...props}/> :
                        < Redirect to={"/start"}/>)}/>
                    <Route path='/login'
                           render={(props) => (isAuthenticated ? <Login {...props}/> : < Redirect to={"/start"}/>)}/>
                    <Route path='/start' render={(props) => <StartPage {...props}/>}/>
                    <Route path='/bunker/:id'
                           render={(props) => (isAuthenticated ? <Bunker {...props}/> : < Redirect to={"/start"}/>)}/>
                </Switch>
            </div>
        </Router>
    );


}

export default App;
