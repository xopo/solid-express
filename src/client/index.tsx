/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from '@solidjs/router';

import './index.css'
import App from './App'
import Login from './components/login/Login';

const root = document.getElementById('root')

render(() => (
    <Router>
        <Route path='/login'  component={Login} />
        <Route path='/' component={App} />
    </Router>
), root!)
