/* @refresh reload */
import { render } from 'solid-js/web'
import {Router, Route} from '@solidjs/router';
import BASE_URL from './const';
import App from './App';
import { lazy } from 'solid-js';
import './index.css'
const Login  = lazy(() => import('./components/login/Login'));
const Users  = lazy(() => import('./components/users/Users'));

const root = document.getElementById('root')

render(() => (
    <Router>
        <Route path={`${BASE_URL}login`} component={Login} />
        <Route path={`${BASE_URL}register`} component={Login} />
        <Route path={`${BASE_URL}users`} component={Users} />
        <Route path={`${BASE_URL}`} component={App} />
    </Router>
), root!)
