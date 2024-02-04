/* @refresh reload */
import { render } from 'solid-js/web'
import {Router, Route} from '@solidjs/router';

import './index.css'
import Login from './components/login/Login';
// import MainPage from './components/MainPage';
import App from './App';

const root = document.getElementById('root')

render(() => <Router>
    <Route path='/login' component={Login} />
    <Route path='/' component={App} />
</Router>
, root!)
